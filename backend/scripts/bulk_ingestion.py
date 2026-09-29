"""
bulk_ingestion.py - Controlled Production Bulk Ingestion Script for CropKart

Ingests 1000–1500 real agricultural market records from CEDA Agmarknet API
into Supabase PostgreSQL via the existing data pipeline:
CEDA API -> DataFetcher -> DataValidator -> DataCleaner -> DataTransformer -> SQLAlchemy -> Supabase

Features:
- Batched ingestion across high-volume agricultural states & commodities
- Idempotency & duplicate protection via deterministic SHA-256 source_record_id
- Rate limit compliance (sleep intervals between requests, respects 40 req/hr tier)
- Dry-run mode (--dry-run) to inspect what would be inserted without committing
- Real-time progress logging (requests, fetched, validated, inserted, duplicates, errors)
- Preserves existing data (no automated deletions)
- Safe credential handling (never logs or prints API tokens)
"""

import argparse
import asyncio
import logging
import os
from pathlib import Path
import sys
import time
from typing import Any, Dict, List, Optional

# Ensure backend root is in sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from dotenv import load_dotenv

# Load backend/.env
env_path = BACKEND_DIR / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

from app.database import SessionLocal, init_db, test_db_connection
from app.models import AgriculturalMarketData
from app.services.data_ingestion_service import DataIngestionService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("bulk_ingestion")

# Pre-defined batches designed to collect ~1000–1500 real CEDA records safely
DEFAULT_BATCHES = [
    {
        "name": "Maharashtra - Nagpur Wheat",
        "commodity": "Wheat",
        "state": "Maharashtra",
        "district": "Nagpur",
        "from_date": "2025-01-01",
        "to_date": "2025-06-01",
        "limit": 450,
    },
    {
        "name": "Maharashtra - Pune Wheat",
        "commodity": "Wheat",
        "state": "Maharashtra",
        "district": "Pune",
        "from_date": "2025-01-01",
        "to_date": "2025-06-01",
        "limit": 400,
    },
    {
        "name": "Maharashtra - Nashik Wheat",
        "commodity": "Wheat",
        "state": "Maharashtra",
        "district": "Nashik",
        "from_date": "2025-01-01",
        "to_date": "2025-06-01",
        "limit": 400,
    },
    {
        "name": "Punjab - Gurdaspur Wheat (Harvest Season)",
        "commodity": "Wheat",
        "state": "Punjab",
        "district": "Gurdaspur",
        "from_date": "2018-04-01",
        "to_date": "2018-06-30",
        "limit": 300,
    },
    {
        "name": "Punjab - Ludhiana Paddy / Rice",
        "commodity": "Paddy(Dhan)(Common)",
        "state": "Punjab",
        "district": "Ludhiana",
        "from_date": "2018-09-01",
        "to_date": "2018-11-30",
        "limit": 300,
    },
]


def get_current_record_count() -> int:
    """Queries current row count in agricultural_market_data table."""
    db = SessionLocal()
    try:
        return db.query(AgriculturalMarketData).count()
    except Exception as exc:
        logger.warning(f"Could not read database count: {exc}")
        return 0
    finally:
        db.close()


async def run_bulk_ingestion(
    target_records: int = 1200,
    dry_run: bool = False,
    batch_delay: float = 2.5,
    custom_batches: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Executes controlled bulk ingestion using the existing DataIngestionService.
    """
    logger.info("=" * 70)
    logger.info(
        f"STARTING CROPKART BULK DATA INGESTION {'[DRY RUN]' if dry_run else '[LIVE MODE]'}"
    )
    logger.info(f"Target record count: {target_records}")
    logger.info(f"Batch delay between requests: {batch_delay}s")
    logger.info("=" * 70)

    # 1. Verify database connectivity
    if not test_db_connection():
        raise RuntimeError("Database connection failed. Verify DATABASE_URL.")

    # 2. Ensure tables exist
    init_db()

    initial_db_count = get_current_record_count()
    logger.info(f"Initial records in Supabase 'agricultural_market_data': {initial_db_count}")

    # 3. Instantiate pipeline service
    service = DataIngestionService()

    # 4. Progress trackers
    stats = {
        "requests_made": 0,
        "records_fetched": 0,
        "records_valid": 0,
        "records_inserted": 0,
        "records_updated_skipped": 0,
        "errors": 0,
        "initial_database_count": initial_db_count,
        "final_database_count": initial_db_count,
        "batches_completed": 0,
        "dry_run": dry_run,
    }

    batches = custom_batches or DEFAULT_BATCHES
    total_effective_stored = 0

    for idx, batch_cfg in enumerate(batches, start=1):
        # Stop condition: check if target is met
        if total_effective_stored >= target_records:
            logger.info(
                f"Target record threshold ({target_records}) reached. Stopping ingestion gracefully."
            )
            break

        b_name = batch_cfg.get("name", f"Batch {idx}")
        commodity = batch_cfg["commodity"]
        state = batch_cfg["state"]
        district = batch_cfg.get("district")
        from_date = batch_cfg.get("from_date")
        to_date = batch_cfg.get("to_date")
        limit = batch_cfg.get("limit", 400)

        # Remaining capacity to target
        remaining = target_records - total_effective_stored
        current_limit = min(limit, remaining)

        logger.info("-" * 60)
        logger.info(
            f"Processing Batch {idx}/{len(batches)}: '{b_name}' "
            f"({commodity}, {state}, {district}) [Limit: {current_limit}]"
        )
        logger.info("-" * 60)

        stats["requests_made"] += 1
        start_time = time.time()

        try:
            result = await service.ingest_market_data(
                commodity=commodity,
                state=state,
                district=district,
                from_date=from_date,
                to_date=to_date,
                limit=current_limit,
                source="ceda",
                dry_run=dry_run,
            )

            elapsed = round(time.time() - start_time, 2)

            if result.get("success"):
                fetched = result.get("records_fetched", 0)
                valid = result.get("records_valid", 0)
                stored = result.get("records_stored", 0)
                skipped = result.get("records_skipped", 0)

                stats["records_fetched"] += fetched
                stats["records_valid"] += valid
                stats["records_inserted"] += stored
                stats["records_updated_skipped"] += skipped
                stats["batches_completed"] += 1
                total_effective_stored += stored

                logger.info(
                    f"[OK] Batch {idx} finished in {elapsed}s: "
                    f"Fetched={fetched}, Valid={valid}, "
                    f"{'Would Insert' if dry_run else 'Inserted'}={stored}, "
                    f"Duplicates/Skipped={skipped}"
                )
            else:
                stats["errors"] += 1
                msg = result.get("message", "")
                logger.error(f"[FAIL] Batch {idx} failed: {msg}")
                if "rate limit" in str(msg).lower():
                    logger.warning(
                        "[RATE LIMIT] CEDA 40 requests/hour quota reached. "
                        "Halting subsequent batches to respect provider quotas."
                    )
                    break

        except Exception as exc:
            stats["errors"] += 1
            logger.error(f"[FAIL] Unexpected error in Batch {idx}: {exc}", exc_info=True)

        # Rate-limiting delay before next batch (respects CEDA 40 req/hr tier)
        if idx < len(batches) and total_effective_stored < target_records:
            logger.info(f"Pausing {batch_delay}s to respect API rate limits...")
            await asyncio.sleep(batch_delay)

    # Final database count verification
    final_db_count = get_current_record_count()
    stats["final_database_count"] = final_db_count

    logger.info("=" * 70)
    logger.info(f"BULK INGESTION SUMMARY {'[DRY RUN - NO COMMITS]' if dry_run else '[COMPLETED]'}")
    logger.info(f"- Requests Made            : {stats['requests_made']}")
    logger.info(f"- Records Fetched          : {stats['records_fetched']}")
    logger.info(f"- Records Validated        : {stats['records_valid']}")
    logger.info(f"- Records Inserted (New)   : {stats['records_inserted']}")
    logger.info(f"- Records Updated/Skipped  : {stats['records_updated_skipped']}")
    logger.info(f"- Batches Completed        : {stats['batches_completed']}")
    logger.info(f"- Errors Encountered       : {stats['errors']}")
    logger.info(f"- Initial Database Rows    : {stats['initial_database_count']}")
    logger.info(f"- Final Database Rows      : {stats['final_database_count']}")
    logger.info("=" * 70)

    return stats


def parse_args():
    parser = argparse.ArgumentParser(description="CropKart CEDA Bulk Data Ingestion")
    parser.add_argument(
        "--target",
        type=int,
        default=1200,
        help="Target number of records to ingest (default: 1200, range: 1000–1500)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate full ingestion without committing to database",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=2.5,
        help="Sleep delay in seconds between batches (default: 2.5s)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(
        run_bulk_ingestion(
            target_records=args.target,
            dry_run=args.dry_run,
            batch_delay=args.delay,
        )
    )
