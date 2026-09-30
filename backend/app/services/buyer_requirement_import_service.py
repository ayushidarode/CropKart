"""
buyer_requirement_import_service.py - Safe Ingestion Service for Buyer Requirements

Safely maps, validates, and ingests buyer_requirements (2).csv into the existing
`public.buyer_requirements` table in PostgreSQL / Supabase without disturbing existing records,
violating foreign keys, or altering the database schema.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import uuid

import pandas as pd
from sqlalchemy.orm import Session

try:
    from app.models import BuyerRequirement, Crop, User
    from app.services.buyer_profile_import_service import BuyerProfileImportService
except ImportError:
    from models import BuyerRequirement, Crop, User
    from services.buyer_profile_import_service import BuyerProfileImportService

logger = logging.getLogger(__name__)

# Complete mapping from CSV buyer UUID to raw integer buyer ID (1..80)
# established from source parity with buyer_requirements.csv
CSV_BUYER_UUID_TO_INT: Dict[str, int] = {
    "ae47a417-01be-5d5a-9d7a-2fd893f0cd45": 1,
    "d9bebb0b-e6c7-5f0e-a470-0433d73562e6": 2,
    "607c5548-0fb8-5252-ae28-8866cc72c58c": 3,
    "101ef6cf-c567-5e8e-a76d-997cda7ba0f1": 4,
    "62c7d962-1382-57bd-b18a-20d59dc18c51": 5,
    "22c16c6b-41af-5314-acbb-b208649b06e8": 6,
    "19ac1886-2558-5baf-b414-e07f3ef26fc7": 7,
    "77cac5fa-b8af-5e1f-9780-93ec3310d22a": 8,
    "ecb82497-0837-5e56-8d10-6e8499147e61": 9,
    "37f3bd7d-32e8-52e9-b485-d421ec3a56e8": 10,
    "4f25d8de-c487-5a8b-b5ae-12fdb98909ae": 11,
    "cb260a16-d0cf-574e-808b-e50d88fb2b1d": 12,
    "774637eb-d16f-51ae-a87c-df9111f86a93": 13,
    "be30799a-fd2a-51f9-941a-3bf4e3e20616": 14,
    "b6a1cf42-269d-51b3-8e86-ba0d40694a59": 15,
    "094968ab-42f6-5610-a15e-69ae43b18945": 16,
    "2cd5ff89-fdad-5320-9e75-ea016aef0768": 17,
    "c5c55cfc-4c6d-5f8e-91d2-5ceebb2e0d82": 18,
    "1b6e669f-4b76-524e-a897-505ab4880522": 19,
    "512898f0-bb78-5f12-95b7-2bbdf0bbe05b": 20,
    "e96010a9-797c-5791-a444-fd4e4234e2b1": 21,
    "1e30ceea-28f6-551e-93b6-c07238350856": 22,
    "c8deffbe-56f9-5e3e-95dd-f2d08190ccde": 23,
    "97a3e638-b246-5fe0-b7da-6c6853a66cd5": 24,
    "0cc9ccbe-9d36-5695-bcbb-cde7b433fa31": 25,
    "3c0b1131-70a0-5062-9c8a-bc2aefc6db7f": 26,
    "3315fb93-7ad0-5beb-8dc7-4a1c6b446f65": 27,
    "1433937f-9387-5d05-acbf-10b26ecd177c": 28,
    "61e08399-d82b-5096-8a16-c6e093387333": 29,
    "f14a0672-306a-5a21-8c1a-69b64f1c21c1": 30,
    "b3be9525-955b-5f40-b41c-67bd1af7ff93": 31,
    "6430f633-eeb3-5b94-aa1b-c871c7ca3be7": 32,
    "ff7f0206-afe0-5958-b13f-ddda9728a3fc": 33,
    "ba5b955b-6bb4-5a73-99c6-fb74e65f0043": 34,
    "1a8bb527-84a1-58d4-89f1-e409a3ed1fc5": 35,
    "f9031337-d0dc-5c35-ba28-252c4281ae1e": 36,
    "eccce0c6-16b5-5e6d-8894-a754c70bc026": 37,
    "a8d8b90e-361f-57e2-9236-533abd01380b": 38,
    "42f58fa7-a6ef-57be-95ae-3d1f68b295b0": 39,
    "a408958f-591c-5be3-89cb-217eb0be8b91": 40,
    "6ed26a94-9bd4-5fad-a24a-e96079423dcf": 41,
    "5a9db6fe-940c-55a6-8f2e-e8fe70e0710e": 42,
    "786b2018-a397-5b92-9a5d-eb012c910c3a": 43,
    "b0a8bfa1-ff87-5f3c-90ba-d87a352d9397": 44,
    "1b44bf42-9b10-5a81-8e1b-3437fdea64da": 45,
    "de667d80-70ad-5892-8bae-03cf2848cc32": 46,
    "ffdd94ed-9f64-5d1b-bcb4-8b8837fb041e": 47,
    "70d8a6ec-1f90-5243-bbfb-94b52c5f3ef9": 48,
    "c66d292e-b615-5b28-b6f7-48eea7902e46": 49,
    "149f65e8-b95f-5d62-b930-d26556408b86": 50,
    "98813a27-d7be-5e4b-80c4-6999b7eb51d7": 51,
    "6645493a-1a34-5c05-82f0-4281c22a4849": 52,
    "ce843d22-f1bd-540a-8aed-d2ca4c53eebc": 53,
    "3e35da71-7fb1-508d-b70a-0a5ba928c139": 54,
    "e91218fa-bed8-5f90-93c1-112424c78830": 55,
    "74312de5-a865-557a-8351-9f7e41907a62": 56,
    "39cfa8ed-0579-53c5-8bba-3e9c6867a71a": 57,
    "a59d4662-404f-577c-9656-300d530888d4": 58,
    "dd37210e-f336-5a4c-8a41-a6e60487fbbf": 59,
    "acf52219-0243-50bf-81a5-96c5b34094e0": 60,
    "787df8a7-65b8-5cb0-b754-f575a6a19d1b": 61,
    "c7ca7724-6adb-5d70-be0d-53b7a5c39752": 62,
    "707f53eb-c0bd-5440-b26b-fcd538577e18": 63,
    "37d427f6-74bf-57e8-b0d8-9c802c02c77a": 64,
    "852bfd04-2afd-57b7-9830-21afff8f040c": 65,
    "f85f8b7b-223c-5789-b63b-f2457533c1e1": 66,
    "73ab3e85-83f7-5054-8ea9-883efdfe5dfd": 67,
    "b778859a-31db-5068-a000-ee4e3f3a954a": 68,
    "16804a90-c94b-58e8-825a-6dfd00307cfb": 69,
    "4d40e0ad-77d1-55d5-a990-7c11ebb1f298": 70,
    "f397542c-b689-5842-bea1-ab85a0ad0dbb": 71,
    "a790d921-d300-59b8-a188-0b4456dc77c1": 72,
    "196a854f-0931-5541-8b8c-86c74ba0f311": 73,
    "d8f820bb-1fc3-5464-926e-27cb613b92e9": 74,
    "bcdb2108-b461-5458-9551-ff89290fec20": 75,
    "faeb12af-5401-536f-9424-06d58dd2518d": 76,
    "4276841b-04d4-5dc2-81df-4042665013ed": 77,
    "ea7a6866-ab49-5602-8a42-fc18fa727e8d": 78,
    "1bc411b1-c3f1-57be-b221-6fe5e6e99551": 79,
    "814238a6-f2f3-500e-91e5-a04777aa5283": 80,
}

# Authentic database crop lookup by crop name
CROP_NAME_TO_DB_UUID: Dict[str, Optional[uuid.UUID]] = {
    "Wheat": uuid.UUID("11111111-1111-1111-1111-111111110001"),
    "Tomato": uuid.UUID("11111111-1111-1111-1111-111111110002"),
    "Rice": uuid.UUID("11111111-1111-1111-1111-111111110003"),
    "Onion": uuid.UUID("11111111-1111-1111-1111-111111110004"),
    "Soybean": uuid.UUID("11111111-1111-1111-1111-111111110005"),
    "Cotton": uuid.UUID("11111111-1111-1111-1111-111111110007"),
    "Maize": uuid.UUID("11111111-1111-1111-1111-111111110008"),
    "Potato": None,  # crop_id is nullable; crop_name stores 'Potato'
}

# Status normalizer satisfying CHECK (status IN ('active', 'fulfilled', 'cancelled'))
STATUS_NORMALIZATION: Dict[str, str] = {
    "open": "active",
    "partially_fulfilled": "active",
    "fulfilled": "fulfilled",
    "active": "active",
    "cancelled": "cancelled",
}


@dataclass
class BuyerRequirementImportResult:
    """Detailed summary of the buyer requirements CSV ingestion."""
    total_csv_rows: int = 0
    valid_csv_rows: int = 0
    invalid_csv_rows: int = 0
    inserted_requirements: int = 0
    updated_requirements: int = 0
    skipped_requirements: int = 0
    initial_table_count: int = 0
    final_table_count: int = 0
    orphaned_buyers_count: int = 0
    orphaned_crops_count: int = 0
    errors: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_csv_rows": self.total_csv_rows,
            "valid_csv_rows": self.valid_csv_rows,
            "invalid_csv_rows": self.invalid_csv_rows,
            "inserted_requirements": self.inserted_requirements,
            "updated_requirements": self.updated_requirements,
            "skipped_requirements": self.skipped_requirements,
            "initial_table_count": self.initial_table_count,
            "final_table_count": self.final_table_count,
            "orphaned_buyers_count": self.orphaned_buyers_count,
            "orphaned_crops_count": self.orphaned_crops_count,
            "errors_count": len(self.errors),
        }


class BuyerRequirementImportService:
    """Coordinates dependency-safe, idempotent ingestion of buyer requirements from CSV."""

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def resolve_buyer_uuid(csv_buyer_id: str) -> Optional[uuid.UUID]:
        """
        Resolves CSV buyer UUID to genuine public.users(id) UUID.
        Handles direct matches or maps via raw integer buyer ID 1..80.
        """
        buyer_str = str(csv_buyer_id).strip()
        # 1. Check if it's already an integer buyer ID
        try:
            bid_int = int(buyer_str)
            return BuyerProfileImportService.get_deterministic_buyer_uuid(bid_int)
        except ValueError:
            pass

        # 2. Check if it's in our authentic parity lookup
        bid_int = CSV_BUYER_UUID_TO_INT.get(buyer_str)
        if bid_int is not None:
            return BuyerProfileImportService.get_deterministic_buyer_uuid(bid_int)

        # 3. Direct UUID fallback
        try:
            return uuid.UUID(buyer_str)
        except ValueError:
            return None

    def validate_dataset(self, df: pd.DataFrame) -> List[str]:
        """Validates all rows, constraints, and foreign keys before any database writes."""
        errors: List[str] = []

        # 1. Required columns
        required_cols = {
            "id", "buyer_id", "crop_name", "variety", "category",
            "quantity", "unit", "target_price", "location", "district",
            "state", "urgency", "status", "created_at", "updated_at", "crop_id"
        }
        missing_cols = required_cols - set(df.columns)
        if missing_cols:
            errors.append(f"CSV missing required columns: {missing_cols}")
            return errors

        # 2. Check duplicate primary keys
        if df["id"].duplicated().any():
            dups = df[df["id"].duplicated()]["id"].tolist()
            errors.append(f"Duplicate requirement id values found: {dups[:5]}")

        # 3. Check numeric positivity
        bad_qty = (df["quantity"] <= 0).sum()
        if bad_qty > 0:
            errors.append(f"Found {bad_qty} requirements with quantity <= 0")

        bad_price = (df["target_price"] < 0).sum()
        if bad_price > 0:
            errors.append(f"Found {bad_price} requirements with negative target_price")

        # 4. Check buyer resolution against public.users
        unique_buyers = df["buyer_id"].unique()
        resolved_buyer_uuids = set()
        unresolvable_buyers = []
        for b in unique_buyers:
            buuid = self.resolve_buyer_uuid(str(b))
            if buuid is None:
                unresolvable_buyers.append(b)
            else:
                resolved_buyer_uuids.add(buuid)

        if unresolvable_buyers:
            errors.append(f"Could not resolve {len(unresolvable_buyers)} buyer IDs: {unresolvable_buyers[:5]}")

        # Verify resolved buyers actually exist in database
        existing_users = {
            r[0] for r in self.db.query(User.id).filter(User.id.in_(list(resolved_buyer_uuids))).all()
        }
        missing_db_buyers = [buuid for buuid in resolved_buyer_uuids if buuid not in existing_users]
        if missing_db_buyers:
            errors.append(f"{len(missing_db_buyers)} resolved buyer UUIDs do not exist in users table: {missing_db_buyers[:5]}")

        # 5. Check crop_name is present
        empty_crop_names = df["crop_name"].isna().sum()
        if empty_crop_names > 0:
            errors.append(f"Found {empty_crop_names} requirements with empty crop_name")

        return errors

    def import_requirements(
        self,
        csv_path: Union[str, Path],
        update_existing: bool = True,
    ) -> BuyerRequirementImportResult:
        """
        Executes safe, atomic, transactional ingestion of buyer requirements.
        Rolls back completely if any integrity violation occurs.
        """
        result = BuyerRequirementImportResult()

        file_path = Path(csv_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Target CSV file does not exist: {file_path.resolve()}")

        result.initial_table_count = self.db.query(BuyerRequirement).count()

        df = pd.read_csv(file_path)
        result.total_csv_rows = len(df)

        # 1. Pre-Validation
        validation_errors = self.validate_dataset(df)
        if validation_errors:
            result.errors = validation_errors
            result.invalid_csv_rows = result.total_csv_rows
            logger.error(f"Pre-validation failed with {len(validation_errors)} error(s): {validation_errors}")
            return result

        result.valid_csv_rows = result.total_csv_rows

        # 2. Transactional Write
        try:
            # Pre-load existing requirements by ID into memory
            existing_reqs = {
                req.id: req for req in self.db.query(BuyerRequirement).all()
            }

            for _, row in df.iterrows():
                req_uuid = uuid.UUID(str(row["id"]))
                buyer_uuid = self.resolve_buyer_uuid(str(row["buyer_id"]))
                crop_name = str(row["crop_name"]).strip()
                crop_uuid = CROP_NAME_TO_DB_UUID.get(crop_name)
                
                raw_status = str(row["status"]).strip().lower()
                norm_status = STATUS_NORMALIZATION.get(raw_status, "active")

                qty = round(float(row["quantity"]), 2)
                t_price = round(float(row["target_price"]), 2) if pd.notna(row["target_price"]) else None

                try:
                    c_at = datetime.fromisoformat(str(row["created_at"]))
                    if c_at.tzinfo is None:
                        c_at = c_at.replace(tzinfo=timezone.utc)
                except Exception:
                    c_at = datetime.now(timezone.utc)

                try:
                    u_at = datetime.fromisoformat(str(row["updated_at"]))
                    if u_at.tzinfo is None:
                        u_at = u_at.replace(tzinfo=timezone.utc)
                except Exception:
                    u_at = datetime.now(timezone.utc)

                existing = existing_reqs.get(req_uuid)
                if existing:
                    if update_existing:
                        existing.buyer_id = buyer_uuid
                        existing.crop_id = crop_uuid
                        existing.crop_name = crop_name
                        existing.variety = str(row["variety"]) if pd.notna(row["variety"]) else None
                        existing.category = str(row["category"]) if pd.notna(row["category"]) else "Grain"
                        existing.quantity = qty
                        existing.unit = str(row["unit"]) if pd.notna(row["unit"]) else "kg"
                        existing.target_price = t_price
                        existing.location = str(row["location"]) if pd.notna(row["location"]) else "Maharashtra"
                        existing.district = str(row["district"]) if pd.notna(row["district"]) else None
                        existing.state = str(row["state"]) if pd.notna(row["state"]) else None
                        existing.urgency = str(row["urgency"]) if pd.notna(row["urgency"]) else "within_15_days"
                        existing.status = norm_status
                        existing.created_at = c_at
                        existing.updated_at = u_at
                        result.updated_requirements += 1
                    else:
                        result.skipped_requirements += 1
                else:
                    new_req = BuyerRequirement(
                        id=req_uuid,
                        buyer_id=buyer_uuid,
                        crop_id=crop_uuid,
                        crop_name=crop_name,
                        variety=str(row["variety"]) if pd.notna(row["variety"]) else None,
                        category=str(row["category"]) if pd.notna(row["category"]) else "Grain",
                        quantity=qty,
                        unit=str(row["unit"]) if pd.notna(row["unit"]) else "kg",
                        target_price=t_price,
                        location=str(row["location"]) if pd.notna(row["location"]) else "Maharashtra",
                        district=str(row["district"]) if pd.notna(row["district"]) else None,
                        state=str(row["state"]) if pd.notna(row["state"]) else None,
                        urgency=str(row["urgency"]) if pd.notna(row["urgency"]) else "within_15_days",
                        status=norm_status,
                        created_at=c_at,
                        updated_at=u_at,
                    )
                    self.db.add(new_req)
                    existing_reqs[req_uuid] = new_req
                    result.inserted_requirements += 1

            # Commit the atomic transaction
            self.db.commit()
            logger.info("Successfully committed buyer requirements transaction.")

        except Exception as exc:
            self.db.rollback()
            logger.error(f"Error during import transaction, rolling back completely: {exc}", exc_info=True)
            result.errors.append(str(exc))
            raise

        # 3. Final verification
        result.final_table_count = self.db.query(BuyerRequirement).count()

        # Check for orphaned foreign keys
        orphaned_buyers = self.db.query(BuyerRequirement).filter(~BuyerRequirement.buyer_id.in_(self.db.query(User.id))).count()
        orphaned_crops = self.db.query(BuyerRequirement).filter(
            BuyerRequirement.crop_id.isnot(None),
            ~BuyerRequirement.crop_id.in_(self.db.query(Crop.id))
        ).count()

        result.orphaned_buyers_count = orphaned_buyers
        result.orphaned_crops_count = orphaned_crops

        logger.info(
            f"Import complete: {result.inserted_requirements} inserted, "
            f"{result.updated_requirements} updated, {result.skipped_requirements} skipped. "
            f"Total count: {result.final_table_count}."
        )

        return result
