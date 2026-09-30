"""
buyer_profile_import_service.py - Safe CSV Import & Normalization Service for CropKart

Imports buyer profiles from CSV files (e.g. buyer_profiles.csv) into the existing
`buyer_profiles` database table, resolving foreign keys to `users` and `locations`.
"""

import csv
from dataclasses import dataclass, field
import io
import logging
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple, Union
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

try:
    from app.models import BuyerProfile, Location, User
except ImportError:
    from models import BuyerProfile, Location, User

logger = logging.getLogger(__name__)


# Supported header aliases for resilient mapping
KNOWN_HEADER_ALIASES = {
    # buyer_id aliases
    "buyer_id": "buyer_id",
    "buyerid": "buyer_id",
    "buyer": "buyer_id",
    "buyer_pk": "buyer_id",
    "id": "buyer_id",
    # buyer_type aliases -> maps to business_type in database
    "buyer_type": "buyer_type",
    "buyertype": "buyer_type",
    "business_type": "buyer_type",
    "businesstype": "buyer_type",
    "type": "buyer_type",
    "buyer_category": "buyer_type",
    # location_id aliases
    "location_id": "location_id",
    "locationid": "location_id",
    "location": "location_id",
    "loc_id": "location_id",
    "locid": "location_id",
    "market_location_id": "location_id",
}


@dataclass
class BuyerProfileImportResult:
    """Detailed summary of the CSV import operation."""
    total_csv_rows: int = 0
    valid_rows: int = 0
    invalid_rows: int = 0
    inserted_rows: int = 0
    updated_rows: int = 0
    skipped_duplicate_rows: int = 0
    old_records_removed: int = 0
    failed_rows: int = 0
    initial_table_count: int = 0
    final_table_count: int = 0
    rejected_records: List[Dict[str, Any]] = field(default_factory=list)
    imported_records: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_csv_rows": self.total_csv_rows,
            "valid_rows": self.valid_rows,
            "invalid_rows": self.invalid_rows,
            "inserted_rows": self.inserted_rows,
            "updated_rows": self.updated_rows,
            "skipped_duplicate_rows": self.skipped_duplicate_rows,
            "old_records_removed": self.old_records_removed,
            "failed_rows": self.failed_rows,
            "initial_table_count": self.initial_table_count,
            "final_table_count": self.final_table_count,
            "rejected_records_count": len(self.rejected_records),
            "imported_records_count": len(self.imported_records),
        }


class BuyerProfileNormalizer:
    """Normalizes and validates raw CSV headers and row records."""

    @staticmethod
    def clean_header_name(header: str) -> str:
        """Strips BOM, trailing/leading whitespace, and normalizes casing/punctuation."""
        if not header:
            return ""
        # Remove BOM if present
        clean = header.replace("\ufeff", "").strip().lower()
        # Replace multiple spaces, hyphens, and periods with single underscores
        clean = re.sub(r"[\s\-\.]+", "_", clean)
        # Strip trailing non-alphanumeric chars
        clean = re.sub(r"[^\w]", "", clean)
        return clean

    @classmethod
    def map_headers(cls, raw_headers: List[str]) -> Tuple[Dict[str, str], List[str]]:
        """
        Maps raw CSV column headers to canonical internal keys:
        canonical keys: 'buyer_id', 'buyer_type', 'location_id'
        Returns:
            (raw_col_to_canonical_map, missing_required_fields)
        """
        col_map: Dict[str, str] = {}
        for raw_h in raw_headers:
            cleaned = cls.clean_header_name(raw_h)
            canonical = KNOWN_HEADER_ALIASES.get(cleaned)
            if canonical:
                col_map[raw_h] = canonical

        # Verify all 3 required canonical fields are present
        found_canonicals = set(col_map.values())
        required = {"buyer_id", "buyer_type", "location_id"}
        missing = [r for r in required if r not in found_canonicals]
        return col_map, missing

    @classmethod
    def validate_and_normalize_row(
        cls,
        raw_row: Dict[str, Any],
        col_map: Dict[str, str],
        row_number: int,
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """
        Validates individual row values and transforms to typed attributes.
        Returns:
            (normalized_record, error_message)
        """
        canonical_row: Dict[str, Any] = {}
        for raw_key, raw_val in raw_row.items():
            canonical_key = col_map.get(raw_key)
            if canonical_key:
                canonical_row[canonical_key] = raw_val

        # 1. Validate presence of required keys
        for req in ["buyer_id", "buyer_type", "location_id"]:
            val = canonical_row.get(req)
            if val is None or (isinstance(val, str) and not val.strip()):
                return None, f"Row {row_number}: Required field '{req}' is empty or missing"

        # 2. Validate & normalize buyer_id
        raw_bid = str(canonical_row["buyer_id"]).strip()
        try:
            buyer_id_int = int(raw_bid)
            if buyer_id_int <= 0:
                return None, f"Row {row_number}: buyer_id must be a positive integer, got '{raw_bid}'"
        except ValueError:
            # Check if valid UUID was supplied instead
            try:
                uuid.UUID(raw_bid)
                buyer_id_int = raw_bid
            except ValueError:
                return None, f"Row {row_number}: buyer_id must be a valid integer or UUID, got '{raw_bid}'"

        # 3. Validate & normalize buyer_type
        raw_btype = str(canonical_row["buyer_type"]).strip()
        if not raw_btype:
            return None, f"Row {row_number}: buyer_type cannot be blank"
        # Standardize known business types into proper title case
        buyer_type_norm = raw_btype.title()

        # 4. Validate & normalize location_id
        raw_lid = str(canonical_row["location_id"]).strip()
        try:
            location_id_int = int(raw_lid)
            if location_id_int <= 0:
                return None, f"Row {row_number}: location_id must be a positive integer, got '{raw_lid}'"
        except ValueError:
            return None, f"Row {row_number}: location_id must be a valid integer, got '{raw_lid}'"

        return {
            "row_number": row_number,
            "buyer_id": buyer_id_int,
            "buyer_type": buyer_type_norm,
            "location_id": location_id_int,
        }, None


class BuyerProfileImportService:
    """
    Coordinates safe, idempotent ingestion of buyer profiles from CSV.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def get_deterministic_buyer_uuid(buyer_id: Union[int, str]) -> uuid.UUID:
        """
        Generates a deterministic UUID based on the integer/string buyer_id.
        Ensures consistent, reproducible foreign key linking between users and buyer_profiles.
        """
        if isinstance(buyer_id, str):
            try:
                return uuid.UUID(buyer_id)
            except ValueError:
                pass
        return uuid.uuid5(uuid.NAMESPACE_DNS, f"cropkart-buyer-{buyer_id}")

    @staticmethod
    def get_referenced_user_ids(db: Session, candidate_user_ids: List[uuid.UUID]) -> set:
        """
        Checks all marketplace and transactional tables to ensure candidate users
        are NOT referenced by orders, requirements, sample requests, etc.
        """
        if not candidate_user_ids:
            return set()

        referenced = set()
        try:
            from app.models import Order, SampleRequest, BuyerRequirement
        except ImportError:
            from models import Order, SampleRequest, BuyerRequirement

        # Check orders
        try:
            o_ids = {r[0] for r in db.query(Order.buyer_id).filter(Order.buyer_id.in_(candidate_user_ids)).all() if r[0]}
            referenced.update(o_ids)
        except Exception as e:
            logger.warning(f"Could not check Order references: {e}")

        # Check sample requests
        try:
            s_ids = {r[0] for r in db.query(SampleRequest.buyer_id).filter(SampleRequest.buyer_id.in_(candidate_user_ids)).all() if r[0]}
            referenced.update(s_ids)
        except Exception as e:
            logger.warning(f"Could not check SampleRequest references: {e}")

        # Check buyer requirements
        try:
            b_ids = {r[0] for r in db.query(BuyerRequirement.buyer_id).filter(BuyerRequirement.buyer_id.in_(candidate_user_ids)).all() if r[0]}
            referenced.update(b_ids)
        except Exception as e:
            logger.warning(f"Could not check BuyerRequirement references: {e}")

        return referenced

    def import_csv(
        self,
        csv_source: Union[str, Path, io.StringIO, io.TextIOBase],
        update_existing: bool = True,
        replace_existing_dataset: bool = False,
    ) -> BuyerProfileImportResult:
        """
        Imports, normalizes, or replaces buyer profiles from a CSV file or text stream.

        Args:
            csv_source: File path, Path object, or file-like StringIO containing CSV data.
            update_existing: If True, updates existing profiles on duplicate match;
                             if False, skips duplicates without modification.
            replace_existing_dataset: If True, safely replaces previous buyer-profile dataset records
                                     after full validation, preserving demo seed users and referenced users.

        Returns:
            BuyerProfileImportResult with comprehensive import statistics.
        """
        result = BuyerProfileImportResult()
        result.initial_table_count = self.db.query(BuyerProfile).count()

        # 1. Read raw CSV text
        if isinstance(csv_source, Path):
            if not csv_source.exists():
                raise FileNotFoundError(f"CSV file not found: {csv_source.resolve()}")
            with open(csv_source, "r", encoding="utf-8-sig", errors="replace") as f:
                content = f.read()
        elif isinstance(csv_source, str):
            if "\n" in csv_source or "\r" in csv_source:
                content = csv_source
            else:
                csv_path = Path(csv_source)
                if not csv_path.exists():
                    raise FileNotFoundError(f"CSV file not found: {csv_path.resolve()}")
                with open(csv_path, "r", encoding="utf-8-sig", errors="replace") as f:
                    content = f.read()
        elif hasattr(csv_source, "read"):
            content = csv_source.read()
        else:
            content = str(csv_source)

        lines = [line for line in content.splitlines() if line.strip()]
        if not lines:
            logger.warning("Buyer profiles CSV source is empty.")
            result.final_table_count = result.initial_table_count
            return result

        reader = csv.DictReader(io.StringIO("\n".join(lines)))
        if not reader.fieldnames:
            logger.error("No CSV headers found in source.")
            result.final_table_count = result.initial_table_count
            return result

        # 2. Map & validate headers
        col_map, missing_cols = BuyerProfileNormalizer.map_headers(list(reader.fieldnames))
        if missing_cols:
            error_msg = f"CSV is missing required mapped columns: {missing_cols}. Provided headers: {reader.fieldnames}"
            logger.error(error_msg)
            result.failed_rows = len(lines) - 1
            result.rejected_records.append({"row": 1, "error": error_msg})
            result.final_table_count = result.initial_table_count
            return result

        # 3. Cache existing locations for foreign key resolution
        locations = self.db.query(Location).all()
        location_map: Dict[int, Location] = {loc.id: loc for loc in locations}

        # 4. Parse and validate rows
        parsed_records: List[Dict[str, Any]] = []
        for row_idx, raw_row in enumerate(reader, start=2):
            result.total_csv_rows += 1
            norm_record, error = BuyerProfileNormalizer.validate_and_normalize_row(
                raw_row=raw_row,
                col_map=col_map,
                row_number=row_idx,
            )

            if error:
                result.invalid_rows += 1
                result.rejected_records.append({"row": row_idx, "data": raw_row, "error": error})
                continue

            # Verify foreign-key constraint on locations table
            loc_id = norm_record["location_id"]
            if loc_id not in location_map:
                result.invalid_rows += 1
                reject_reason = (
                    f"Row {row_idx}: Foreign key violation - location_id '{loc_id}' "
                    f"does not exist in the locations table"
                )
                result.rejected_records.append({
                    "row": row_idx,
                    "data": raw_row,
                    "error": reject_reason,
                })
                continue

            result.valid_rows += 1
            parsed_records.append(norm_record)

        # Transaction safety check for replace mode:
        # If any validation errors occurred, abort replacement completely to protect existing data.
        if replace_existing_dataset and result.invalid_rows > 0:
            logger.error(
                f"Validation failed for {result.invalid_rows} row(s). "
                "Aborting dataset replacement without modifying existing database records."
            )
            result.final_table_count = self.db.query(BuyerProfile).count()
            return result

        # Step 4B: If in replacement mode, safely remove old dataset buyer profiles first
        if replace_existing_dataset:
            demo_user_id = uuid.UUID("00000000-0000-0000-0000-000000000004")
            old_dataset_users = (
                self.db.query(User)
                .filter(
                    User.role == "buyer",
                    User.id != demo_user_id,
                    User.email.like("buyer%@cropkart-market.com"),
                )
                .all()
            )
            candidate_ids = [u.id for u in old_dataset_users]

            # Verify no users are referenced by other tables (orders, sample_requests, requirements)
            referenced_ids = self.get_referenced_user_ids(self.db, candidate_ids)
            safe_to_replace_ids = [uid for uid in candidate_ids if uid not in referenced_ids]

            if safe_to_replace_ids:
                deleted_count = (
                    self.db.query(BuyerProfile)
                    .filter(BuyerProfile.id.in_(safe_to_replace_ids))
                    .delete(synchronize_session=False)
                )
                result.old_records_removed = deleted_count
                self.db.flush()
                logger.info(
                    f"Safely removed {deleted_count} previous buyer profile records for replacement."
                )

        # 5. Database persistence with idempotency & duplicate protection
        for rec in parsed_records:
            bid = rec["buyer_id"]
            btype = rec["buyer_type"]
            loc_id = rec["location_id"]
            loc = location_map[loc_id]

            buyer_uuid = self.get_deterministic_buyer_uuid(bid)
            buyer_email = f"buyer{bid}@cropkart-market.com"
            company_name = f"{loc.district} {btype} #{bid}"

            # Step 5A: Ensure associated User record exists
            user = self.db.query(User).filter(User.id == buyer_uuid).first()
            if not user:
                # Check by email in case of manual ID assignment
                user = self.db.query(User).filter(User.email == buyer_email).first()

            if not user:
                # Create user for buyer profile foreign-key mapping
                # Mobile format: 91000 + 5-digit padded buyer id (e.g. 9100000001)
                mobile_no = f"91000{int(bid):05d}" if isinstance(bid, int) else None
                user = User(
                    id=buyer_uuid,
                    email=buyer_email,
                    name=f"Buyer #{bid}",
                    mobile=mobile_no,
                    role="buyer",
                    location=f"{loc.district}, {loc.state}",
                )
                self.db.add(user)
                self.db.flush()

            # Step 5B: Insert or update BuyerProfile
            profile = self.db.query(BuyerProfile).filter(BuyerProfile.id == user.id).first()

            if profile:
                # Profile exists -> check if identical or needs update
                is_identical = (
                    profile.business_type == btype and
                    profile.district == loc.district and
                    profile.state == loc.state
                )
                if is_identical or not update_existing:
                    result.skipped_duplicate_rows += 1
                else:
                    profile.business_type = btype
                    profile.district = loc.district
                    profile.state = loc.state
                    result.updated_rows += 1

                result.imported_records.append({
                    "id": str(user.id),
                    "buyer_id": bid,
                    "company_name": profile.company_name,
                    "business_type": profile.business_type,
                    "district": profile.district,
                    "state": profile.state,
                    "action": "skipped" if is_identical else "updated",
                })
            else:
                new_profile = BuyerProfile(
                    id=user.id,
                    company_name=company_name,
                    business_type=btype,
                    district=loc.district,
                    state=loc.state,
                    is_verified=True,
                    rating=4.90,
                )
                self.db.add(new_profile)
                result.inserted_rows += 1
                result.imported_records.append({
                    "id": str(user.id),
                    "buyer_id": bid,
                    "company_name": company_name,
                    "business_type": btype,
                    "district": loc.district,
                    "state": loc.state,
                    "action": "inserted",
                })

        # Commit all changes atomically
        try:
            self.db.commit()
        except Exception as exc:
            self.db.rollback()
            logger.error(f"Failed to commit buyer profile import transaction: {exc}")
            raise

        result.final_table_count = self.db.query(BuyerProfile).count()
        return result
