"""
test_buyer_profiles_import.py - Unit & Integration Tests for Buyer Profiles CSV Ingestion

Validates:
- Column header normalization (spaces, BOM, casing, aliases)
- Data type validation and missing field rejection
- Foreign-key lookup on locations table
- User linking with deterministic UUIDs
- Duplicate protection and idempotency
"""

import io
import unittest
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base, BuyerProfile, Location, User
from app.services.buyer_profile_import_service import (
    BuyerProfileImportResult,
    BuyerProfileImportService,
    BuyerProfileNormalizer,
)


class TestBuyerProfilesImport(unittest.TestCase):
    """Test suite for buyer profile CSV normalization, validation, and ingestion."""

    def setUp(self):
        # Create an in-memory SQLite database for isolated unit testing
        self.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)
        self.db = self.Session()

        # Seed sample locations (IDs 1 to 5) to mirror production
        self.loc1 = Location(id=1, state="Gujarat", district="Mehsana", market="Kadi")
        self.loc2 = Location(id=2, state="Madhya Pradesh", district="Betul", market="Multai")
        self.loc3 = Location(id=3, state="Madhya Pradesh", district="Alirajpur", market="Alirajpur")
        self.loc4 = Location(id=4, state="Gujarat", district="Surat", market="S.Mandvi")
        self.loc5 = Location(id=5, state="Madhya Pradesh", district="Bhind", market="Alampur")
        self.db.add_all([self.loc1, self.loc2, self.loc3, self.loc4, self.loc5])
        self.db.commit()

        self.service = BuyerProfileImportService(db=self.db)

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(self.engine)

    def test_header_cleaning_and_bom_removal(self):
        """Verify headers with BOM, extra spaces, and mixed casing are cleaned."""
        raw_headers = ["\ufeffbuyer_id", " BUYER_TYPE ", "  location_id  "]
        col_map, missing = BuyerProfileNormalizer.map_headers(raw_headers)
        self.assertEqual(missing, [])
        self.assertEqual(col_map["\ufeffbuyer_id"], "buyer_id")
        self.assertEqual(col_map[" BUYER_TYPE "], "buyer_type")
        self.assertEqual(col_map["  location_id  "], "location_id")

    def test_header_aliases_mapping(self):
        """Verify standard aliases (business_type, loc_id) map to canonical keys."""
        raw_headers = ["buyer_pk", "business_type", "loc_id"]
        col_map, missing = BuyerProfileNormalizer.map_headers(raw_headers)
        self.assertEqual(missing, [])
        self.assertEqual(col_map["buyer_pk"], "buyer_id")
        self.assertEqual(col_map["business_type"], "buyer_type")
        self.assertEqual(col_map["loc_id"], "location_id")

    def test_validate_and_normalize_valid_row(self):
        """Verify valid row parsing into normalized dictionary."""
        col_map = {"buyer_id": "buyer_id", "buyer_type": "buyer_type", "location_id": "location_id"}
        raw_row = {"buyer_id": " 12 ", "buyer_type": " retailer ", "location_id": " 4 "}
        record, err = BuyerProfileNormalizer.validate_and_normalize_row(raw_row, col_map, row_number=2)
        self.assertIsNone(err)
        self.assertIsNotNone(record)
        self.assertEqual(record["buyer_id"], 12)
        self.assertEqual(record["buyer_type"], "Retailer")
        self.assertEqual(record["location_id"], 4)

    def test_validate_invalid_and_empty_rows(self):
        """Verify invalid data formats and missing fields are rejected."""
        col_map = {"buyer_id": "buyer_id", "buyer_type": "buyer_type", "location_id": "location_id"}

        # Empty buyer_id
        _, err = BuyerProfileNormalizer.validate_and_normalize_row(
            {"buyer_id": "", "buyer_type": "Wholesaler", "location_id": "1"}, col_map, 2
        )
        self.assertIn("Required field 'buyer_id' is empty", err)

        # Negative buyer_id
        _, err = BuyerProfileNormalizer.validate_and_normalize_row(
            {"buyer_id": "-5", "buyer_type": "Wholesaler", "location_id": "1"}, col_map, 3
        )
        self.assertIn("positive integer", err)

        # Blank buyer_type
        _, err = BuyerProfileNormalizer.validate_and_normalize_row(
            {"buyer_id": "1", "buyer_type": "   ", "location_id": "1"}, col_map, 4
        )
        self.assertIn("Required field 'buyer_type' is empty", err)

        # Non-numeric location_id
        _, err = BuyerProfileNormalizer.validate_and_normalize_row(
            {"buyer_id": "1", "buyer_type": "Wholesaler", "location_id": "ABC"}, col_map, 5
        )
        self.assertIn("location_id must be a valid integer", err)

    def test_import_csv_success_with_foreign_key_resolution(self):
        """Verify import creates User and BuyerProfile resolving location_id."""
        csv_data = """buyer_id,buyer_type,location_id
1,Retailer,4
2,Wholesaler,3
"""
        result = self.service.import_csv(csv_data)
        self.assertEqual(result.total_csv_rows, 2)
        self.assertEqual(result.valid_rows, 2)
        self.assertEqual(result.invalid_rows, 0)
        self.assertEqual(result.inserted_rows, 2)
        self.assertEqual(result.final_table_count, 2)

        # Verify record 1
        buyer1_uuid = BuyerProfileImportService.get_deterministic_buyer_uuid(1)
        user1 = self.db.query(User).filter(User.id == buyer1_uuid).first()
        self.assertIsNotNone(user1)
        self.assertEqual(user1.name, "Buyer #1")
        self.assertEqual(user1.role, "buyer")
        self.assertEqual(user1.location, "Surat, Gujarat")

        profile1 = self.db.query(BuyerProfile).filter(BuyerProfile.id == buyer1_uuid).first()
        self.assertIsNotNone(profile1)
        self.assertEqual(profile1.business_type, "Retailer")
        self.assertEqual(profile1.district, "Surat")
        self.assertEqual(profile1.state, "Gujarat")
        self.assertEqual(profile1.company_name, "Surat Retailer #1")

    def test_import_csv_rejects_nonexistent_location_fk(self):
        """Verify rows referencing non-existent location_id are rejected."""
        csv_data = """buyer_id,buyer_type,location_id
1,Retailer,4
2,Wholesaler,9999
"""
        result = self.service.import_csv(csv_data)
        self.assertEqual(result.total_csv_rows, 2)
        self.assertEqual(result.valid_rows, 1)
        self.assertEqual(result.invalid_rows, 1)
        self.assertEqual(result.inserted_rows, 1)
        self.assertEqual(len(result.rejected_records), 1)
        self.assertIn("location_id '9999' does not exist", result.rejected_records[0]["error"])

    def test_duplicate_protection_and_idempotency(self):
        """Verify running import multiple times does not produce duplicate profiles."""
        csv_data = """buyer_id,buyer_type,location_id
1,Retailer,4
2,Wholesaler,3
"""
        # Run 1: Inserts 2 records
        res1 = self.service.import_csv(csv_data)
        self.assertEqual(res1.inserted_rows, 2)
        self.assertEqual(res1.skipped_duplicate_rows, 0)
        self.assertEqual(self.db.query(BuyerProfile).count(), 2)

        # Run 2: Exact duplicate -> 0 inserted, 2 skipped
        res2 = self.service.import_csv(csv_data)
        self.assertEqual(res2.inserted_rows, 0)
        self.assertEqual(res2.skipped_duplicate_rows, 2)
        self.assertEqual(self.db.query(BuyerProfile).count(), 2)

        # Run 3: Same buyers with updated buyer_type -> 0 inserted, 2 updated
        updated_csv = """buyer_id,buyer_type,location_id
1,Institutional,4
2,Retailer,3
"""
        res3 = self.service.import_csv(updated_csv, update_existing=True)
        self.assertEqual(res3.inserted_rows, 0)
        self.assertEqual(res3.updated_rows, 2)
        self.assertEqual(self.db.query(BuyerProfile).count(), 2)

        # Verify updated values
        buyer1_uuid = BuyerProfileImportService.get_deterministic_buyer_uuid(1)
        p1 = self.db.query(BuyerProfile).filter(BuyerProfile.id == buyer1_uuid).first()
        self.assertEqual(p1.business_type, "Institutional")

    def test_replace_existing_buyer_dataset_isolated(self):
        """Verify replacement mode safely replaces old dataset profiles while preserving demo buyer."""
        # 1. Create demo seed buyer (Rajesh Gupta)
        demo_id = uuid.UUID("00000000-0000-0000-0000-000000000004")
        demo_user = User(
            id=demo_id,
            email="buyer@example.com",
            name="Rajesh Gupta",
            role="buyer",
            location="Mumbai, Maharashtra",
        )
        demo_profile = BuyerProfile(
            id=demo_id,
            company_name="FreshMart Wholesale India",
            business_type="Wholesaler & Supermarket Chain",
            district="Mumbai",
            state="Maharashtra",
        )
        self.db.add_all([demo_user, demo_profile])
        self.db.commit()

        # 2. Ingest first dataset (buyers 1 and 2)
        old_csv = """buyer_id,buyer_type,location_id
1,Retailer,4
2,Wholesaler,3
"""
        res_old = self.service.import_csv(old_csv)
        self.assertEqual(res_old.inserted_rows, 2)
        self.assertEqual(self.db.query(BuyerProfile).count(), 3)  # 2 imported + 1 demo

        # 3. Replace with new dataset (buyers 3 and 4)
        new_csv = """buyer_id,buyer_type,location_id
3,Wholesaler,5
4,Retailer,4
"""
        res_new = self.service.import_csv(new_csv, replace_existing_dataset=True)
        self.assertEqual(res_new.old_records_removed, 2)
        self.assertEqual(res_new.inserted_rows, 2)
        self.assertEqual(self.db.query(BuyerProfile).count(), 3)  # 2 new + 1 demo

        # Verify demo buyer was completely untouched
        demo_check = self.db.query(BuyerProfile).filter(BuyerProfile.id == demo_id).first()
        self.assertIsNotNone(demo_check)
        self.assertEqual(demo_check.company_name, "FreshMart Wholesale India")

        # Verify old dataset buyers (1 and 2) profiles were removed
        b1_uuid = BuyerProfileImportService.get_deterministic_buyer_uuid(1)
        b2_uuid = BuyerProfileImportService.get_deterministic_buyer_uuid(2)
        self.assertIsNone(self.db.query(BuyerProfile).filter(BuyerProfile.id == b1_uuid).first())
        self.assertIsNone(self.db.query(BuyerProfile).filter(BuyerProfile.id == b2_uuid).first())

        # Verify new dataset buyers (3 and 4) exist
        b3_uuid = BuyerProfileImportService.get_deterministic_buyer_uuid(3)
        b4_uuid = BuyerProfileImportService.get_deterministic_buyer_uuid(4)
        self.assertIsNotNone(self.db.query(BuyerProfile).filter(BuyerProfile.id == b3_uuid).first())
        self.assertIsNotNone(self.db.query(BuyerProfile).filter(BuyerProfile.id == b4_uuid).first())

    def test_replace_mode_aborts_on_validation_failure_preserving_data(self):
        """Verify replacement mode aborts if CSV has invalid rows without deleting existing records."""
        initial_csv = """buyer_id,buyer_type,location_id
1,Retailer,4
2,Wholesaler,3
"""
        self.service.import_csv(initial_csv)
        self.assertEqual(self.db.query(BuyerProfile).count(), 2)

        # Invalid replacement CSV (bad location_id)
        invalid_csv = """buyer_id,buyer_type,location_id
3,Wholesaler,99999
4,Retailer,4
"""
        res = self.service.import_csv(invalid_csv, replace_existing_dataset=True)
        self.assertEqual(res.invalid_rows, 1)
        self.assertEqual(res.old_records_removed, 0)
        self.assertEqual(res.inserted_rows, 0)

        # Confirm old data remains 100% intact
        self.assertEqual(self.db.query(BuyerProfile).count(), 2)


if __name__ == "__main__":
    unittest.main()
