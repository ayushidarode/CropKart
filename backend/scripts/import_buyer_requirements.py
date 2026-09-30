"""
import_buyer_requirements.py - CLI Script for Importing buyer_requirements (2).csv

Safely maps, validates, and ingests buyer requirements into the CropKart database.
Usage:
    python backend/scripts/import_buyer_requirements.py [--csv PATH] [--no-update] [--dry-run]
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
from app.services.buyer_requirement_import_service import BuyerRequirementImportService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("import_buyer_requirements")


def find_default_csv() -> Path:
    candidates = [
        WORKSPACE_DIR / "buyer_requirements (2).csv",
        WORKSPACE_DIR / "buyer_requirements.csv",
        Path.home() / "Downloads" / "buyer_requirements (2).csv",
        Path.home() / "Downloads" / "buyer_requirements.csv",
    ]
    for p in candidates:
        if p.exists():
            return p
    return WORKSPACE_DIR / "buyer_requirements (2).csv"


def main():
    parser = argparse.ArgumentParser(description="Import buyer requirements into CropKart database.")
    parser.add_argument(
        "--csv",
        type=str,
        default=str(find_default_csv()),
        help="Path to buyer_requirements CSV file",
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
    csv_file = Path(args.csv)

    logger.info("=" * 65)
    logger.info("CropKart Buyer Requirements Ingestion Pipeline")
    logger.info(f"Target CSV:      {csv_file.resolve()}")
    logger.info(f"Target Database: {engine.url.render_as_string(hide_password=True)}")
    logger.info(f"Dry Run Mode:    {args.dry_run}")
    logger.info("=" * 65)

    if not csv_file.exists():
        logger.error(f"Buyer requirements CSV file not found: {csv_file.resolve()}")
        sys.exit(1)

    if not test_db_connection():
        logger.error("Failed to connect to database. Please check DATABASE_URL in backend/.env")
        sys.exit(1)

    db = SessionLocal()
    try:
        service = BuyerRequirementImportService(db=db)

        if args.dry_run:
            logger.info("Executing Pre-Validation DRY RUN...")
            import pandas as pd
            df = pd.read_csv(csv_file)
            errors = service.validate_dataset(df)
            if errors:
                logger.error(f"DRY RUN FAILED: Found {len(errors)} validation error(s):")
                for err in errors:
                    logger.error(f"  - {err}")
                sys.exit(1)
            else:
                logger.info(f"DRY RUN PASSED: All {len(df)} rows and foreign-key dependencies are 100% valid!")
                sys.exit(0)

        result = service.import_requirements(
            csv_path=csv_file,
            update_existing=not args.no_update,
        )

        logger.info("\n" + "=" * 65)
        logger.info("BUYER REQUIREMENTS INGESTION SUMMARY")
        logger.info("=" * 65)
        logger.info(f"  Total CSV Rows Processed:       {result.total_csv_rows}")
        logger.info(f"  Valid Rows:                     {result.valid_csv_rows}")
        logger.info(f"  Invalid / Rejected Rows:        {result.invalid_csv_rows}")
        logger.info(f"  Inserted Requirements:          {result.inserted_requirements}")
        logger.info(f"  Updated Requirements:           {result.updated_requirements}")
        logger.info(f"  Skipped Requirements:           {result.skipped_requirements}")
        logger.info(f"  Initial Table Count:            {result.initial_table_count}")
        logger.info(f"  Final Table Count:              {result.final_table_count}")
        logger.info(f"  Orphaned Buyer IDs:             {result.orphaned_buyers_count}")
        logger.info(f"  Orphaned Crop IDs:              {result.orphaned_crops_count}")
        logger.info("=" * 65)

        if result.errors:
            logger.error(f"Encountered {len(result.errors)} error(s):")
            for err in result.errors:
                logger.error(f"  - {err}")
            sys.exit(1)
        else:
            logger.info("SUCCESS: All buyer requirements imported cleanly.")

    except Exception as exc:
        logger.error(f"Unhandled exception during import execution: {exc}", exc_info=True)
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
