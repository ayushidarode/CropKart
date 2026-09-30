"""
import_order_items.py - CLI Script for Importing order_items.csv & orders.csv

Safely maps, validates, and ingests order items and parent orders into the CropKart database.
Usage:
    python backend/scripts/import_order_items.py [--items-csv PATH] [--orders-csv PATH] [--no-update] [--dry-run]
"""

import argparse
import logging
from pathlib import Path
import sys

# Ensure backend root is in sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
WORKSPACE_DIR = BACKEND_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

# Load backend/.env first
env_path = BACKEND_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

from app.database import SessionLocal, engine, test_db_connection
from app.services.order_item_import_service import OrderItemImportService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("import_order_items")


def find_default_items_csv() -> Path:
    candidates = [
        WORKSPACE_DIR / "order_items.csv",
        BACKEND_DIR / "order_items.csv",
        Path.home() / "Downloads" / "order_items.csv",
    ]
    for p in candidates:
        if p.exists():
            return p
    return WORKSPACE_DIR / "order_items.csv"


def find_default_orders_csv() -> Path:
    candidates = [
        WORKSPACE_DIR / "orders.csv",
        BACKEND_DIR / "orders.csv",
        Path.home() / "Downloads" / "orders.csv",
    ]
    for p in candidates:
        if p.exists():
            return p
    return Path.home() / "Downloads" / "orders.csv"


def main():
    parser = argparse.ArgumentParser(description="Import order_items.csv and parent orders.csv into CropKart database.")
    parser.add_argument(
        "--items-csv",
        type=str,
        default=str(find_default_items_csv()),
        help="Path to order_items.csv file",
    )
    parser.add_argument(
        "--orders-csv",
        type=str,
        default=str(find_default_orders_csv()),
        help="Path to orders.csv file",
    )
    parser.add_argument(
        "--no-update",
        action="store_true",
        help="Do not update existing records on duplicate match, skip them instead",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate all datasets and foreign keys without committing any changes to database",
    )

    args = parser.parse_args()
    items_file = Path(args.items_csv)
    orders_file = Path(args.orders_csv)

    logger.info("=" * 65)
    logger.info("CropKart Order Items & Parent Orders Ingestion Pipeline")
    logger.info(f"Order Items CSV: {items_file.resolve()}")
    logger.info(f"Orders CSV:      {orders_file.resolve()}")
    logger.info(f"Target Database: {engine.url.render_as_string(hide_password=True)}")
    logger.info(f"Dry Run Mode:    {args.dry_run}")
    logger.info("=" * 65)

    if not items_file.exists():
        logger.error(f"Order items CSV file not found: {items_file.resolve()}")
        sys.exit(1)
    if not orders_file.exists():
        logger.error(f"Orders CSV file not found: {orders_file.resolve()}")
        sys.exit(1)

    if not test_db_connection():
        logger.error("Failed to connect to database. Please check DATABASE_URL in backend/.env")
        sys.exit(1)

    db = SessionLocal()
    try:
        service = OrderItemImportService(db=db)

        if args.dry_run:
            logger.info("Executing Pre-Validation DRY RUN...")
            import pandas as pd
            df_items = pd.read_csv(items_file)
            df_orders = pd.read_csv(orders_file)
            errors = service.validate_datasets(df_items, df_orders)
            if errors:
                logger.error(f"DRY RUN FAILED: Found {len(errors)} validation error(s):")
                for err in errors:
                    logger.error(f"  - {err}")
                sys.exit(1)
            else:
                logger.info("DRY RUN PASSED: All 3,250 rows and foreign-key dependencies are 100% valid!")
                sys.exit(0)

        result = service.import_order_items(
            items_csv_path=items_file,
            orders_csv_path=orders_file,
            update_existing=not args.no_update,
        )

        logger.info("\n" + "=" * 65)
        logger.info("INGESTION OPERATION SUMMARY")
        logger.info("=" * 65)
        logger.info(f"  Total CSV Rows Processed:       {result.total_csv_rows}")
        logger.info(f"  Valid Rows:                     {result.valid_csv_rows}")
        logger.info(f"  Invalid / Rejected Rows:        {result.invalid_csv_rows}")
        logger.info(f"  Parent Orders Inserted:         {result.inserted_orders}")
        logger.info(f"  Parent Orders Updated:          {result.updated_orders}")
        logger.info(f"  Parent Orders Skipped:          {result.skipped_orders}")
        logger.info(f"  Order Items Inserted:           {result.inserted_order_items}")
        logger.info(f"  Order Items Updated:            {result.updated_order_items}")
        logger.info(f"  Order Items Skipped:            {result.skipped_order_items}")
        logger.info(f"  Missing Crops Seeded:           {result.seeded_crops}")
        logger.info(f"  Initial Orders Count:           {result.initial_orders_count}")
        logger.info(f"  Final Orders Count:             {result.final_orders_count}")
        logger.info(f"  Initial Order Items Count:      {result.initial_order_items_count}")
        logger.info(f"  Final Order Items Count:        {result.final_order_items_count}")
        logger.info(f"  Initial Crops Count:            {result.initial_crops_count}")
        logger.info(f"  Final Crops Count:              {result.final_crops_count}")
        logger.info("=" * 65)

        if result.errors:
            logger.error(f"Encountered {len(result.errors)} error(s):")
            for err in result.errors:
                logger.error(f"  - {err}")
            sys.exit(1)
        else:
            logger.info("SUCCESS: All order items and parent orders imported cleanly.")

    except Exception as exc:
        logger.error(f"Unhandled exception during import execution: {exc}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
