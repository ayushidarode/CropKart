"""
test_buyer_requirements_import.py - Unit & Integration Tests for BuyerRequirementImportService

Tests:
1. Buyer UUID resolution via authentic 1..80 mapping
2. Pre-validation checks (negative values, missing columns, duplicate IDs)
3. Transactional import execution on SQLite in-memory test DB
4. Status normalization ('Open' -> 'active', 'Fulfilled' -> 'fulfilled', etc.)
5. Idempotency and duplicate prevention
6. Crop ID resolution and Potato nullable crop_id handling
"""

import tempfile
import unittest
import uuid
from pathlib import Path
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models import BuyerRequirement, Crop, User
from app.services.buyer_profile_import_service import BuyerProfileImportService
from app.services.buyer_requirement_import_service import (
    BuyerRequirementImportService,
    CSV_BUYER_UUID_TO_INT,
    CROP_NAME_TO_DB_UUID,
)


class TestBuyerRequirementImportService(unittest.TestCase):
    """Test suite for safe buyer requirements ingestion."""

    def setUp(self):
        """Creates an in-memory SQLite database and seeds minimal dependencies."""
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(bind=self.engine, autocommit=False, autoflush=False)
        self.db = self.SessionLocal()

        # Seed buyer 1 and buyer 2
        self.buyer_1 = User(
            id=BuyerProfileImportService.get_deterministic_buyer_uuid(1),
            name="Buyer 1",
            role="buyer",
        )
        self.buyer_2 = User(
            id=BuyerProfileImportService.get_deterministic_buyer_uuid(2),
            name="Buyer 2",
            role="buyer",
        )

        # Seed a crop (Wheat)
        self.crop_wheat = Crop(
            id=CROP_NAME_TO_DB_UUID["Wheat"],
            farmer_id=self.buyer_1.id,
            name="Sharbati Wheat",
            variety="Premium",
            category="Grain",
            location="Baramati",
        )

        self.db.add_all([self.buyer_1, self.buyer_2, self.crop_wheat])
        self.db.commit()

        self.service = BuyerRequirementImportService(db=self.db)

    def tearDown(self):
        self.db.close()

    def test_buyer_resolution(self):
        """Ensures CSV buyer UUIDs correctly resolve to deterministic DB buyer UUIDs."""
        # Buyer 1 CSV UUID
        b1_csv_uuid = "ae47a417-01be-5d5a-9d7a-2fd893f0cd45"
        self.assertEqual(CSV_BUYER_UUID_TO_INT[b1_csv_uuid], 1)
        resolved_b1 = self.service.resolve_buyer_uuid(b1_csv_uuid)
        self.assertEqual(resolved_b1, self.buyer_1.id)

        # Buyer 2 CSV UUID
        b2_csv_uuid = "d9bebb0b-e6c7-5f0e-a470-0433d73562e6"
        resolved_b2 = self.service.resolve_buyer_uuid(b2_csv_uuid)
        self.assertEqual(resolved_b2, self.buyer_2.id)

    def test_validation_detects_errors(self):
        """Ensures validate_dataset flags bad values before writing."""
        # 1. Missing columns
        bad_df = pd.DataFrame([{"id": str(uuid.uuid4())}])
        errs = self.service.validate_dataset(bad_df)
        self.assertTrue(any("missing required columns" in e for e in errs))

        # 2. Negative quantity or price
        b1_csv = "ae47a417-01be-5d5a-9d7a-2fd893f0cd45"
        row = {
            "id": str(uuid.uuid4()),
            "buyer_id": b1_csv,
            "crop_name": "Wheat",
            "variety": "Local",
            "category": "Grain",
            "quantity": -50.0,
            "unit": "quintal",
            "target_price": 2500.0,
            "location": "Pune",
            "district": "Pune",
            "state": "Maharashtra",
            "urgency": "Medium",
            "status": "Open",
            "created_at": "2026-04-01T00:00:00+00:00",
            "updated_at": "2026-04-01T00:00:00+00:00",
            "crop_id": str(uuid.uuid4()),
        }
        df_neg = pd.DataFrame([row])
        errs = self.service.validate_dataset(df_neg)
        self.assertTrue(any("quantity <= 0" in e for e in errs))

        # 3. Unresolvable buyer
        df_neg["quantity"] = 100.0
        df_neg["buyer_id"] = "00000000-0000-0000-0000-000000000999"
        errs = self.service.validate_dataset(df_neg)
        self.assertTrue(any("do not exist in users table" in e for e in errs))

    def test_import_and_idempotency(self):
        """Tests end-to-end import, status normalization, and duplicate protection."""
        with tempfile.TemporaryDirectory() as temp_dir:
            csv_path = Path(temp_dir) / "test_reqs.csv"

            id1 = str(uuid.uuid4())
            id2 = str(uuid.uuid4())
            b1_csv = "ae47a417-01be-5d5a-9d7a-2fd893f0cd45"
            b2_csv = "d9bebb0b-e6c7-5f0e-a470-0433d73562e6"

            df = pd.DataFrame([
                {
                    "id": id1,
                    "buyer_id": b1_csv,
                    "crop_name": "Wheat",
                    "variety": "Local",
                    "category": "Grain",
                    "quantity": 500.0,
                    "unit": "quintal",
                    "target_price": 2800.0,
                    "location": "Pune",
                    "district": "Pune",
                    "state": "Maharashtra",
                    "urgency": "Medium",
                    "status": "Open",
                    "created_at": "2026-04-01T00:00:00+00:00",
                    "updated_at": "2026-04-01T00:00:00+00:00",
                    "crop_id": str(uuid.uuid4()),
                },
                {
                    "id": id2,
                    "buyer_id": b2_csv,
                    "crop_name": "Potato",
                    "variety": "Local",
                    "category": "Vegetable",
                    "quantity": 1000.0,
                    "unit": "quintal",
                    "target_price": 1900.0,
                    "location": "Nashik",
                    "district": "Nashik",
                    "state": "Maharashtra",
                    "urgency": "Medium",
                    "status": "Fulfilled",
                    "created_at": "2026-04-02T00:00:00+00:00",
                    "updated_at": "2026-04-02T00:00:00+00:00",
                    "crop_id": str(uuid.uuid4()),
                },
            ])
            df.to_csv(csv_path, index=False)

            # First run
            res1 = self.service.import_requirements(csv_path)
            self.assertEqual(res1.inserted_requirements, 2)
            self.assertEqual(self.db.query(BuyerRequirement).count(), 2)

            # Verify status normalization
            req1 = self.db.query(BuyerRequirement).filter(BuyerRequirement.id == uuid.UUID(id1)).first()
            self.assertEqual(req1.status, "active")  # 'Open' normalized to 'active'
            self.assertEqual(req1.crop_id, self.crop_wheat.id)
            self.assertEqual(req1.buyer_id, self.buyer_1.id)

            req2 = self.db.query(BuyerRequirement).filter(BuyerRequirement.id == uuid.UUID(id2)).first()
            self.assertEqual(req2.status, "fulfilled")  # 'Fulfilled' normalized to 'fulfilled'
            self.assertIsNone(req2.crop_id)  # Potato crop_id is nullable (None)
            self.assertEqual(req2.crop_name, "Potato")

            # Second run (idempotency)
            res2 = self.service.import_requirements(csv_path, update_existing=True)
            self.assertEqual(res2.inserted_requirements, 0)
            self.assertEqual(res2.updated_requirements, 2)
            self.assertEqual(self.db.query(BuyerRequirement).count(), 2)


if __name__ == "__main__":
    unittest.main()
