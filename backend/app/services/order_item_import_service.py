"""
order_item_import_service.py - Safe CSV Ingestion Service for CropKart Order Items & Orders

Safely maps, validates, and imports order_items.csv and parent orders.csv into the
existing PostgreSQL/Supabase database models (Order, OrderItem, Crop) without
disturbing existing records or modifying the database schema.
"""

from dataclasses import dataclass, field
from datetime import datetime, timezone
import io
import logging
from pathlib import Path
import re
from typing import Any, Dict, List, Optional, Tuple, Union
import uuid

import pandas as pd
from sqlalchemy.orm import Session

try:
    from app.models import Crop, Location, Order, OrderItem, User
    from app.services.buyer_profile_import_service import BuyerProfileImportService
except ImportError:
    from models import Crop, Location, Order, OrderItem, User
    from services.buyer_profile_import_service import BuyerProfileImportService

logger = logging.getLogger(__name__)

# Known crop catalog definitions for crops 1 to 8 based on authentic ML training metadata
# and existing seed crops.
KNOWN_CROP_DEFINITIONS = {
    1: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110001"),
        "name": "Sharbati Wheat",
        "variety": "Premium Sharbati Gold",
        "category": "Grain",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000001"),  # Ramesh Kumar
        "price_per_unit": 28.50,
        "location": "Baramati, Pune",
        "district": "Pune",
        "state": "Maharashtra",
    },
    2: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110002"),
        "name": "Desi Tomatoes",
        "variety": "Abhinav Hybrid",
        "category": "Vegetable",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000002"),  # Anita Patil
        "price_per_unit": 32.00,
        "location": "Niphad, Nashik",
        "district": "Nashik",
        "state": "Maharashtra",
    },
    3: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110003"),
        "name": "Basmati Rice",
        "variety": "Pusa 1121 Traditional",
        "category": "Grain",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000003"),  # Balvinder Singh
        "price_per_unit": 78.00,
        "location": "Samrala, Ludhiana",
        "district": "Ludhiana",
        "state": "Punjab",
    },
    4: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110004"),
        "name": "Red Onions",
        "variety": "Garwa Late Red",
        "category": "Vegetable",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000002"),  # Anita Patil
        "price_per_unit": 24.00,
        "location": "Lasalgaon, Nashik",
        "district": "Nashik",
        "state": "Maharashtra",
    },
    5: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110005"),
        "name": "Yellow Soybean",
        "variety": "JS 335",
        "category": "Oilseed",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000001"),  # Ramesh Kumar
        "price_per_unit": 46.50,
        "location": "Indapur, Pune",
        "district": "Pune",
        "state": "Maharashtra",
    },
    6: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110006"),
        "name": "BT Cotton",
        "variety": "Bollgard II",
        "category": "Commercial",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000003"),  # Balvinder Singh
        "price_per_unit": 68.00,
        "location": "Khanna, Ludhiana",
        "district": "Ludhiana",
        "state": "Punjab",
    },
    7: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110007"),
        "name": "Cotton",
        "variety": "Shankar-6 Hybrid",
        "category": "Commercial",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000003"),  # Balvinder Singh
        "price_per_unit": 61.24,
        "location": "Khanna, Ludhiana",
        "district": "Ludhiana",
        "state": "Punjab",
    },
    8: {
        "id": uuid.UUID("11111111-1111-1111-1111-111111110008"),
        "name": "Maize",
        "variety": "African Tall Hybrid",
        "category": "Grain",
        "farmer_id": uuid.UUID("00000000-0000-0000-0000-000000000001"),  # Ramesh Kumar
        "price_per_unit": 21.58,
        "location": "Baramati, Pune",
        "district": "Pune",
        "state": "Maharashtra",
    },
}

# Status translation mapping from orders.csv into PostgreSQL check constraints
STATUS_MAPPING = {
    "delivered": "delivered",
    "confirmed": "accepted",
    "accepted": "accepted",
    "pending": "pending",
    "cancelled": "cancelled",
    "processing": "processing",
    "ready_for_pickup": "ready_for_pickup",
    "picked_up": "picked_up",
    "in_transit": "in_transit",
}

PAYMENT_STATUS_MAPPING = {
    "delivered": "paid",
    "accepted": "escrow",
    "confirmed": "escrow",
    "pending": "pending",
    "cancelled": "refunded",
}


@dataclass
class OrderItemImportResult:
    """Detailed summary of the CSV import operation."""
    total_csv_rows: int = 0
    valid_csv_rows: int = 0
    invalid_csv_rows: int = 0
    inserted_order_items: int = 0
    updated_order_items: int = 0
    skipped_order_items: int = 0
    inserted_orders: int = 0
    updated_orders: int = 0
    skipped_orders: int = 0
    seeded_crops: int = 0
    initial_orders_count: int = 0
    final_orders_count: int = 0
    initial_order_items_count: int = 0
    final_order_items_count: int = 0
    initial_crops_count: int = 0
    final_crops_count: int = 0
    initial_users_count: int = 0
    final_users_count: int = 0
    errors: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "total_csv_rows": self.total_csv_rows,
            "valid_csv_rows": self.valid_csv_rows,
            "invalid_csv_rows": self.invalid_csv_rows,
            "inserted_order_items": self.inserted_order_items,
            "updated_order_items": self.updated_order_items,
            "skipped_order_items": self.skipped_order_items,
            "inserted_orders": self.inserted_orders,
            "updated_orders": self.updated_orders,
            "skipped_orders": self.skipped_orders,
            "seeded_crops": self.seeded_crops,
            "initial_orders_count": self.initial_orders_count,
            "final_orders_count": self.final_orders_count,
            "initial_order_items_count": self.initial_order_items_count,
            "final_order_items_count": self.final_order_items_count,
            "initial_crops_count": self.initial_crops_count,
            "final_crops_count": self.final_crops_count,
            "initial_users_count": self.initial_users_count,
            "final_users_count": self.final_users_count,
            "errors_count": len(self.errors),
        }


class OrderItemImportService:
    """
    Coordinates dependency-safe, idempotent ingestion of order_items.csv and parent orders.csv.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    @staticmethod
    def get_deterministic_order_uuid(order_id: Union[int, str]) -> uuid.UUID:
        """
        Generates a deterministic UUID based on the integer/string order_id.
        Ensures consistent, reproducible foreign key linking between orders and order_items.
        """
        if isinstance(order_id, str):
            try:
                return uuid.UUID(order_id)
            except ValueError:
                pass
        return uuid.uuid5(uuid.NAMESPACE_DNS, f"cropkart-order-{order_id}")

    @staticmethod
    def get_deterministic_order_item_uuid(order_item_id: Union[int, str]) -> uuid.UUID:
        """
        Generates a deterministic UUID based on the integer/string order_item_id.
        """
        if isinstance(order_item_id, str):
            try:
                return uuid.UUID(order_item_id)
            except ValueError:
                pass
        return uuid.uuid5(uuid.NAMESPACE_DNS, f"cropkart-order-item-{order_item_id}")

    def ensure_crops_exist(self) -> int:
        """
        Ensures all 8 catalog crops exist in the database with verified relationships.
        Adds crops 7 (Cotton) and 8 (Maize) if they are not already present.
        Returns the number of new crops created.
        """
        created = 0
        for crop_id_int, crop_meta in KNOWN_CROP_DEFINITIONS.items():
            existing = self.db.query(Crop).filter(Crop.id == crop_meta["id"]).first()
            if not existing:
                logger.info(f"Seeding missing catalog crop {crop_id_int}: {crop_meta['name']}")
                new_crop = Crop(
                    id=crop_meta["id"],
                    farmer_id=crop_meta["farmer_id"],
                    name=crop_meta["name"],
                    variety=crop_meta["variety"],
                    category=crop_meta["category"],
                    quantity=10000.0,
                    unit="kg",
                    price_per_unit=crop_meta["price_per_unit"],
                    quality_grade="Grade A",
                    organic=False,
                    location=crop_meta["location"],
                    district=crop_meta["district"],
                    state=crop_meta["state"],
                    status="available",
                )
                self.db.add(new_crop)
                created += 1

        if created > 0:
            self.db.flush()
        return created

    def validate_datasets(
        self,
        df_items: pd.DataFrame,
        df_orders: pd.DataFrame,
    ) -> List[str]:
        """
        Thoroughly validates all rows and foreign keys before any database writes.
        Returns list of validation error strings. If non-empty, import MUST NOT proceed.
        """
        errors = []

        # 1. Required columns check
        req_item_cols = {"order_item_id", "order_id", "crop_id", "quantity", "unit_price", "quality"}
        missing_item_cols = req_item_cols - set(df_items.columns)
        if missing_item_cols:
            errors.append(f"order_items.csv missing required columns: {missing_item_cols}")

        req_order_cols = {"order_id", "buyer_id", "order_date", "location_id", "status"}
        missing_order_cols = req_order_cols - set(df_orders.columns)
        if missing_order_cols:
            errors.append(f"orders.csv missing required columns: {missing_order_cols}")

        if errors:
            return errors

        # 2. Check counts and order_id parity
        item_orders = set(df_items["order_id"])
        order_orders = set(df_orders["order_id"])
        if item_orders != order_orders:
            diff = item_orders.symmetric_difference(order_orders)
            errors.append(f"Mismatch between order_items.csv and orders.csv order_id sets ({len(diff)} discrepancies)")

        # 3. Check for duplicates within CSVs
        if df_items["order_item_id"].duplicated().any():
            dups = df_items[df_items["order_item_id"].duplicated()]["order_item_id"].tolist()
            errors.append(f"Duplicate order_item_id found in CSV: {dups[:5]}")

        if df_orders["order_id"].duplicated().any():
            dups = df_orders[df_orders["order_id"].duplicated()]["order_id"].tolist()
            errors.append(f"Duplicate order_id found in orders.csv: {dups[:5]}")

        # 4. Check crop IDs are within 1 to 8
        invalid_crops = set(df_items["crop_id"]) - set(KNOWN_CROP_DEFINITIONS.keys())
        if invalid_crops:
            errors.append(f"Invalid crop_id values found in order_items.csv: {invalid_crops}")

        # 5. Check numeric positivity
        bad_qty = (df_items["quantity"] <= 0).sum()
        if bad_qty > 0:
            errors.append(f"Found {bad_qty} order items with quantity <= 0")

        bad_price = (df_items["unit_price"] <= 0).sum()
        if bad_price > 0:
            errors.append(f"Found {bad_price} order items with unit_price <= 0")

        # 6. Check quality values
        bad_quality = (~df_items["quality"].isin(["A", "B", "C"])).sum()
        if bad_quality > 0:
            errors.append(f"Found {bad_quality} order items with invalid quality grade")

        # 7. Check buyers exist in database
        unique_bids = df_orders["buyer_id"].unique()
        buyer_uuids = [BuyerProfileImportService.get_deterministic_buyer_uuid(bid) for bid in unique_bids]
        existing_user_ids = {
            r[0] for r in self.db.query(User.id).filter(User.id.in_(buyer_uuids)).all()
        }
        missing_buyers = [bid for bid, buuid in zip(unique_bids, buyer_uuids) if buuid not in existing_user_ids]
        if missing_buyers:
            errors.append(f"{len(missing_buyers)} buyers in orders.csv not found in database: {missing_buyers[:5]}")

        # 8. Check locations exist in database
        unique_lids = df_orders["location_id"].unique()
        existing_loc_ids = {
            r[0] for r in self.db.query(Location.id).filter(Location.id.in_([int(l) for l in unique_lids])).all()
        }
        missing_locs = [lid for lid in unique_lids if int(lid) not in existing_loc_ids]
        if missing_locs:
            errors.append(f"{len(missing_locs)} locations in orders.csv not found in database: {missing_locs}")

        return errors

    def import_order_items(
        self,
        items_csv_path: Union[str, Path],
        orders_csv_path: Union[str, Path],
        update_existing: bool = True,
    ) -> OrderItemImportResult:
        """
        Executes full validation and transactional import of orders and order items.
        Rolls back completely if any error occurs.
        """
        result = OrderItemImportResult()

        # 1. Record baseline database counts
        result.initial_orders_count = self.db.query(Order).count()
        result.initial_order_items_count = self.db.query(OrderItem).count()
        result.initial_crops_count = self.db.query(Crop).count()
        result.initial_users_count = self.db.query(User).count()

        items_file = Path(items_csv_path)
        orders_file = Path(orders_csv_path)

        if not items_file.exists():
            raise FileNotFoundError(f"order_items.csv does not exist: {items_file.resolve()}")
        if not orders_file.exists():
            raise FileNotFoundError(f"orders.csv does not exist: {orders_file.resolve()}")

        # 2. Read CSVs
        df_items = pd.read_csv(items_file)
        df_orders = pd.read_csv(orders_file)

        result.total_csv_rows = len(df_items)

        # 3. Full Pre-Validation
        validation_errors = self.validate_datasets(df_items, df_orders)
        if validation_errors:
            result.errors = validation_errors
            result.invalid_csv_rows = result.total_csv_rows
            logger.error(f"Validation failed with {len(validation_errors)} error(s): {validation_errors}")
            return result

        result.valid_csv_rows = result.total_csv_rows

        # Cache location names for delivery_location
        loc_map = {}
        for loc in self.db.query(Location).filter(Location.id.in_([1, 2, 3, 4, 5])).all():
            loc_map[loc.id] = f"{loc.market}, {loc.district}, {loc.state}"

        # 4. Transactional Write
        try:
            # Step A: Ensure Crops 7 and 8 exist
            result.seeded_crops = self.ensure_crops_exist()

            # Step B: Build orders lookup from df_orders
            orders_meta_map = {}
            for _, o_row in df_orders.iterrows():
                oid_int = int(o_row["order_id"])
                bid_int = int(o_row["buyer_id"])
                lid_int = int(o_row["location_id"])
                raw_status = str(o_row["status"]).strip().lower()
                norm_status = STATUS_MAPPING.get(raw_status, "pending")
                norm_pay_status = PAYMENT_STATUS_MAPPING.get(norm_status, "pending")
                
                try:
                    order_dt = datetime.fromisoformat(str(o_row["order_date"]))
                    if order_dt.tzinfo is None:
                        order_dt = order_dt.replace(tzinfo=timezone.utc)
                except Exception:
                    order_dt = datetime.now(timezone.utc)

                delivery_loc = loc_map.get(lid_int, f"APMC Market Yard {lid_int}")

                orders_meta_map[oid_int] = {
                    "buyer_id_int": bid_int,
                    "buyer_uuid": BuyerProfileImportService.get_deterministic_buyer_uuid(bid_int),
                    "location_id": lid_int,
                    "status": norm_status,
                    "payment_status": norm_pay_status,
                    "order_date": order_dt,
                    "delivery_location": delivery_loc,
                }

            # Pre-load existing orders into memory by ID
            existing_orders = {
                o.id: o for o in self.db.query(Order).all()
            }

            # Pre-load existing order items into memory by ID
            existing_items = {
                it.id: it for it in self.db.query(OrderItem).all()
            }

            # Step C: Process each order and order_item pair
            for _, item_row in df_items.iterrows():
                item_id_int = int(item_row["order_item_id"])
                order_id_int = int(item_row["order_id"])
                crop_id_int = int(item_row["crop_id"])
                qty = round(float(item_row["quantity"]), 2)
                unit_price = round(float(item_row["unit_price"]), 2)
                total_price = round(qty * unit_price, 2)

                crop_meta = KNOWN_CROP_DEFINITIONS[crop_id_int]
                order_meta = orders_meta_map[order_id_int]

                order_uuid = self.get_deterministic_order_uuid(order_id_int)
                item_uuid = self.get_deterministic_order_item_uuid(item_id_int)

                # --- Handle Parent Order ---
                order_num = f"CK-ORD-{order_id_int:05d}"
                existing_order = existing_orders.get(order_uuid)

                if existing_order:
                    if update_existing:
                        existing_order.buyer_id = order_meta["buyer_uuid"]
                        existing_order.farmer_id = crop_meta["farmer_id"]
                        existing_order.crop_id = crop_meta["id"]
                        existing_order.quantity = qty
                        existing_order.unit = "kg"
                        existing_order.price_per_unit = unit_price
                        existing_order.total_price = total_price
                        existing_order.pickup_location = crop_meta["location"]
                        existing_order.delivery_location = order_meta["delivery_location"]
                        existing_order.status = order_meta["status"]
                        existing_order.payment_status = order_meta["payment_status"]
                        existing_order.created_at = order_meta["order_date"]
                        existing_order.updated_at = order_meta["order_date"]
                        result.updated_orders += 1
                    else:
                        result.skipped_orders += 1
                else:
                    new_order = Order(
                        id=order_uuid,
                        order_number=order_num,
                        buyer_id=order_meta["buyer_uuid"],
                        farmer_id=crop_meta["farmer_id"],
                        crop_id=crop_meta["id"],
                        quantity=qty,
                        unit="kg",
                        price_per_unit=unit_price,
                        total_price=total_price,
                        pickup_location=crop_meta["location"],
                        delivery_location=order_meta["delivery_location"],
                        status=order_meta["status"],
                        payment_status=order_meta["payment_status"],
                        payment_method="upi",
                        notes=f"Imported from orders.csv (order #{order_id_int})",
                        created_at=order_meta["order_date"],
                        updated_at=order_meta["order_date"],
                    )
                    self.db.add(new_order)
                    existing_orders[order_uuid] = new_order
                    result.inserted_orders += 1

                # --- Handle Order Item ---
                existing_item = existing_items.get(item_uuid)
                if existing_item:
                    if update_existing:
                        existing_item.order_id = order_uuid
                        existing_item.crop_id = crop_meta["id"]
                        existing_item.crop_name = crop_meta["name"]
                        existing_item.quantity = qty
                        existing_item.unit_price = unit_price
                        existing_item.total_price = total_price
                        existing_item.seller_id = crop_meta["farmer_id"]
                        result.updated_order_items += 1
                    else:
                        result.skipped_order_items += 1
                else:
                    new_item = OrderItem(
                        id=item_uuid,
                        order_id=order_uuid,
                        crop_id=crop_meta["id"],
                        crop_name=crop_meta["name"],
                        quantity=qty,
                        unit_price=unit_price,
                        total_price=total_price,
                        seller_id=crop_meta["farmer_id"],
                    )
                    self.db.add(new_item)
                    existing_items[item_uuid] = new_item
                    result.inserted_order_items += 1

            # Commit the atomic transaction
            self.db.commit()
            logger.info("Successfully committed order_items and orders transaction.")

        except Exception as exc:
            self.db.rollback()
            logger.error(f"Error during import transaction, rolling back completely: {exc}", exc_info=True)
            result.errors.append(str(exc))
            raise

        # 5. Record final counts and verify integrity
        result.final_orders_count = self.db.query(Order).count()
        result.final_order_items_count = self.db.query(OrderItem).count()
        result.final_crops_count = self.db.query(Crop).count()
        result.final_users_count = self.db.query(User).count()

        # Invariant checks: Ensure pre-existing demo orders still exist
        demo_order_1 = uuid.UUID("33333333-3333-3333-3333-333333330001")
        demo_order_2 = uuid.UUID("33333333-3333-3333-3333-333333330002")
        demo1 = self.db.query(Order).filter(Order.id == demo_order_1).first()
        demo2 = self.db.query(Order).filter(Order.id == demo_order_2).first()
        if not demo1 or not demo2:
            logger.error("SAFETY INVARIANT VIOLATED: Pre-existing demo orders were affected!")
            raise RuntimeError("CRITICAL ERROR: Existing seed orders were missing after import!")

        logger.info(
            f"Import complete: {result.inserted_orders} orders inserted, "
            f"{result.inserted_order_items} items inserted, "
            f"{result.seeded_crops} crops seeded. "
            f"Total orders: {result.final_orders_count}, items: {result.final_order_items_count}."
        )

        return result
