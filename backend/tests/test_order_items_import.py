"""
test_order_items_import.py - Unit & Integration Tests for OrderItemImportService

Tests:
1. Deterministic UUID generation for orders and order items
2. Validation logic (invalid columns, negative values, duplicates, unknown crops)
3. Safe crop catalog seeding (crops 7 and 8)
4. Transactional import execution on SQLite in-memory test DB
5. Idempotency and duplicate prevention
6. Preservation of existing seed records
"""

import io
import unittest
import uuid
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models import Crop, Location, Order, OrderItem, User
from app.services.buyer_profile_import_service import BuyerProfileImportService
from app.services.order_item_import_service import (
    OrderItemImportService,
    KNOWN_CROP_DEFINITIONS,
)


class TestOrderItemImportService(unittest.TestCase):
    """Test suite for safe order_items and orders ingestion."""

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

        # Seed 3 verified farmers
        self.farmer_1 = User(
            id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
            name="Ramesh Kumar",
            role="farmer",
            location="Pune, Maharashtra",
        )
        self.farmer_2 = User(
            id=uuid.UUID("00000000-0000-0000-0000-000000000002"),
            name="Anita Patil",
            role="farmer",
            location="Nashik, Maharashtra",
        )
        self.farmer_3 = User(
            id=uuid.UUID("00000000-0000-0000-0000-000000000003"),
            name="Balvinder Singh",
            role="farmer",
            location="Ludhiana, Punjab",
        )

        # Seed buyers 1 and 2
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

        # Seed locations 1 and 2
        self.loc_1 = Location(id=1, market="Kadi", district="Mehsana", state="Gujarat")
        self.loc_2 = Location(id=2, market="Multai", district="Betul", state="Madhya Pradesh")

        # Seed 2 existing demo orders (must be preserved!)
        self.demo_order_1 = Order(
            id=uuid.UUID("33333333-3333-3333-3333-333333330001"),
            order_number="CK-2026-0819",
            buyer_id=self.buyer_1.id,
            farmer_id=self.farmer_1.id,
            quantity=3000.0,
            price_per_unit=28.50,
            total_price=85500.0,
            pickup_location="Baramati",
            delivery_location="Vashi",
            status="in_transit",
        )
        self.demo_order_2 = Order(
            id=uuid.UUID("33333333-3333-3333-3333-333333330002"),
            order_number="CK-2026-0922",
            buyer_id=self.buyer_1.id,
            farmer_id=self.farmer_2.id,
            quantity=5000.0,
            price_per_unit=24.00,
            total_price=120000.0,
            pickup_location="Lasalgaon",
            delivery_location="Bhiwandi",
            status="pending",
        )

        self.db.add_all([
            self.farmer_1, self.farmer_2, self.farmer_3,
            self.buyer_1, self.buyer_2,
            self.loc_1, self.loc_2,
            self.demo_order_1, self.demo_order_2,
        ])
        self.db.commit()

        self.service = OrderItemImportService(db=self.db)

    def tearDown(self):
        self.db.close()

    def test_deterministic_uuids(self):
        """Ensures order and order_item UUIDs are stable and reproducible."""
        u1 = self.service.get_deterministic_order_uuid(101)
        u2 = self.service.get_deterministic_order_uuid(101)
        u3 = self.service.get_deterministic_order_uuid(102)
        self.assertEqual(u1, u2)
        self.assertNotEqual(u1, u3)

        item_u1 = self.service.get_deterministic_order_item_uuid(505)
        item_u2 = self.service.get_deterministic_order_item_uuid(505)
        item_u3 = self.service.get_deterministic_order_item_uuid(506)
        self.assertEqual(item_u1, item_u2)
        self.assertNotEqual(item_u1, item_u3)

    def test_validation_detects_bad_data(self):
        """Ensures validate_datasets flags bad values before writing."""
        # 1. Missing columns
        bad_items = pd.DataFrame([{"order_item_id": 1}])
        bad_orders = pd.DataFrame([{"order_id": 1}])
        errs = self.service.validate_datasets(bad_items, bad_orders)
        self.assertTrue(any("missing required columns" in e for e in errs))

        # 2. Negative quantity or price
        items = pd.DataFrame([{
            "order_item_id": 1,
            "order_id": 1,
            "crop_id": 1,
            "quantity": -10.0,
            "unit_price": 50.0,
            "quality": "A",
        }])
        orders = pd.DataFrame([{
            "order_id": 1,
            "buyer_id": 1,
            "order_date": "2026-04-01",
            "location_id": 1,
            "status": "Delivered",
        }])
        errs = self.service.validate_datasets(items, orders)
        self.assertTrue(any("quantity <= 0" in e for e in errs))

        # 3. Invalid crop_id (not in 1..8)
        items["quantity"] = 100.0
        items["crop_id"] = 99
        errs = self.service.validate_datasets(items, orders)
        self.assertTrue(any("Invalid crop_id" in e for e in errs))

        # 4. Unknown buyer
        items["crop_id"] = 1
        orders["buyer_id"] = 999  # Does not exist
        errs = self.service.validate_datasets(items, orders)
        self.assertTrue(any("not found in database" in e for e in errs))

    def test_ensure_crops_seeds_crops_7_and_8(self):
        """Ensures missing crops (including 7 and 8) are seeded with verified farmer relationships."""
        init_crop_count = self.db.query(Crop).count()
        self.assertEqual(init_crop_count, 0)

        created = self.service.ensure_crops_exist()
        self.assertEqual(created, 8)
        self.assertEqual(self.db.query(Crop).count(), 8)

        # Check Crop 7 (Cotton)
        crop_7 = self.db.query(Crop).filter(Crop.id == KNOWN_CROP_DEFINITIONS[7]["id"]).first()
        self.assertIsNotNone(crop_7)
        self.assertEqual(crop_7.name, "Cotton")
        self.assertEqual(crop_7.farmer_id, self.farmer_3.id)

        # Check Crop 8 (Maize)
        crop_8 = self.db.query(Crop).filter(Crop.id == KNOWN_CROP_DEFINITIONS[8]["id"]).first()
        self.assertIsNotNone(crop_8)
        self.assertEqual(crop_8.name, "Maize")
        self.assertEqual(crop_8.farmer_id, self.farmer_1.id)

        # Calling again should create 0 crops (idempotent)
        created_again = self.service.ensure_crops_exist()
        self.assertEqual(created_again, 0)

    def test_import_and_idempotency(self, tmp_path=None):
        """Tests end-to-end import and duplicate protection."""
        import tempfile
        from pathlib import Path

        with tempfile.TemporaryDirectory() as temp_dir:
            items_csv = Path(temp_dir) / "test_items.csv"
            orders_csv = Path(temp_dir) / "test_orders.csv"

            # Create test CSV with 2 items and orders
            df_items = pd.DataFrame([
                {"order_item_id": 1, "order_id": 1, "crop_id": 7, "quantity": 500.0, "unit_price": 6000.0, "quality": "A"},
                {"order_item_id": 2, "order_id": 2, "crop_id": 8, "quantity": 1000.0, "unit_price": 2200.0, "quality": "B"},
            ])
            df_orders = pd.DataFrame([
                {"order_id": 1, "buyer_id": 1, "order_date": "2026-05-01", "location_id": 1, "status": "Delivered"},
                {"order_id": 2, "buyer_id": 2, "order_date": "2026-05-02", "location_id": 2, "status": "Confirmed"},
            ])

            df_items.to_csv(items_csv, index=False)
            df_orders.to_csv(orders_csv, index=False)

            # First import run
            res1 = self.service.import_order_items(items_csv, orders_csv)
            self.assertEqual(res1.inserted_orders, 2)
            self.assertEqual(res1.inserted_order_items, 2)
            self.assertEqual(self.db.query(OrderItem).count(), 2)
            # 2 seed demo orders + 2 new orders = 4 orders
            self.assertEqual(self.db.query(Order).count(), 4)

            # Verify existing demo orders are intact
            self.assertIsNotNone(self.db.query(Order).filter(Order.id == self.demo_order_1.id).first())
            self.assertIsNotNone(self.db.query(Order).filter(Order.id == self.demo_order_2.id).first())

            # Second import run (idempotency check)
            res2 = self.service.import_order_items(items_csv, orders_csv, update_existing=True)
            self.assertEqual(res2.inserted_orders, 0)
            self.assertEqual(res2.inserted_order_items, 0)
            self.assertEqual(res2.updated_orders, 2)
            self.assertEqual(res2.updated_order_items, 2)
            self.assertEqual(self.db.query(OrderItem).count(), 2)
            self.assertEqual(self.db.query(Order).count(), 4)


if __name__ == "__main__":
    unittest.main()
