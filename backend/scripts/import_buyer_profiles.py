"""
import_buyer_profiles.py - CLI Script for Importing buyer_profiles.csv

Safely maps and ingests buyer profiles from CSV into the existing database.
Usage:
    python backend/scripts/import_buyer_profiles.py [--csv PATH_TO_CSV]
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

# Load backend/.env first (for Supabase PostgreSQL connection), fallback to root .env
env_path = BACKEND_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

from app.database import SessionLocal, engine, test_db_connection
from app.services.buyer_profile_import_service import BuyerProfileImportService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("import_buyer_profiles")


def find_default_csv_path() -> Path:
    """Finds buyer_profiles.csv in standard locations."""
    candidate_paths = [
        WORKSPACE_DIR / "buyer_profiles.csv",
        BACKEND_DIR / "buyer_profiles.csv",
        BACKEND_DIR / "app" / "data" / "buyer_profiles.csv",
        Path.home() / "Downloads" / "buyer_profiles.csv",
    ]
    for p in candidate_paths:
        if p.exists():
            return p
    return WORKSPACE_DIR / "buyer_profiles.csv"


def main():
    parser = argparse.ArgumentParser(description="Import buyer_profiles.csv into CropKart database.")
    parser.add_argument(
        "--csv",
        type=str,
        default=str(find_default_csv_path()),
        help="Path to buyer_profiles.csv file",
    )
    parser.add_argument(
        "--no-update",
        action="store_true",
        help="Do not update existing profiles on match, only insert new ones",
    )
    parser.add_argument(
        "--replace",
        action="store_true",
        help="Safely replace existing imported buyer-profile dataset with new CSV records",
    )

    args = parser.parse_args()
    csv_file = Path(args.csv)

    if not csv_file.exists():
        logger.error(f"Target CSV file does not exist: {csv_file.resolve()}")
        sys.exit(1)

    logger.info("=" * 60)
    logger.info("CropKart Buyer Profiles Ingestion")
    logger.info(f"Target CSV: {csv_file.resolve()}")
    logger.info(f"Target Database: {engine.url}")
    logger.info(f"Mode: {'SAFE DATASET REPLACEMENT' if args.replace else 'SAFE UPSERT'}")
    logger.info("=" * 60)

    if not test_db_connection():
        logger.error("Failed to connect to database. Please check DATABASE_URL in .env")
        sys.exit(1)

    db = SessionLocal()
    try:
        service = BuyerProfileImportService(db=db)
        result = service.import_csv(
            csv_source=csv_file,
            update_existing=not args.no_update,
            replace_existing_dataset=args.replace,
        )

        logger.info("\n" + "=" * 60)
        logger.info("IMPORT EXECUTION SUMMARY")
        logger.info("=" * 60)
        logger.info(f"Total CSV rows:         {result.total_csv_rows}")
        logger.info(f"Valid rows:             {result.valid_rows}")
        logger.info(f"Invalid rows:           {result.invalid_rows}")
        logger.info(f"Old records removed:    {result.old_records_removed}")
        logger.info(f"Inserted rows:          {result.inserted_rows}")
        logger.info(f"Updated rows:           {result.updated_rows}")
        logger.info(f"Skipped duplicate rows: {result.skipped_duplicate_rows}")
        logger.info(f"Failed rows:            {result.failed_rows}")
        logger.info(f"Initial table count:    {result.initial_table_count}")
        logger.info(f"Final table count:      {result.final_table_count}")
        logger.info("=" * 60)

        if result.rejected_records:
            logger.warning(f"Rejected records ({len(result.rejected_records)}):")
            for rej in result.rejected_records:
                logger.warning(f"  Row {rej['row']}: {rej['error']}")

        print("\nSUCCESS: Buyer profiles import completed successfully.")

    except Exception as e:
        logger.error(f"Fatal error during import: {e}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
