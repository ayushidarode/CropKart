"""
data_ingestion_service.py - End-to-End Data Ingestion Service

WHY THIS FILE EXISTS:
This file is the captain of the ship.
It coordinates the fetcher, validator, cleaner, and transformer,
and saves the cleaned records permanently into Supabase PostgreSQL.

WHAT THIS FILE DOES:
1. Calls DataFetcher to get records from internet.
2. Calls DataValidator to filter out junk.
3. Calls DataCleaner to normalize names, prices, and dates.
4. Calls DataTransformer to compute unique fingerprints.
5. Saves or updates records in Supabase PostgreSQL (Duplicate Protection).
6. Returns a clear summary report.

WHAT GOES IN:
- Optional custom data source URL
- Commodity filter (e.g. "Wheat")
- Record limit (e.g. 100)
- Optional database session

WHAT COMES OUT:
- Dictionary report:
  {
    "success": true,
    "source": "agmarknet_open_data",
    "records_fetched": 100,
    "records_valid": 98,
    "records_stored": 98,
    "records_skipped": 2,
    "message": "..."
  }
"""

from datetime import datetime, timezone
import logging
import os
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

try:
    from app.database import SessionLocal, init_db, test_db_connection
    from app.models import AgriculturalMarketData, DataSource, Grain, Location
    from app.data.fetcher import (
        DataFetcher,
        FetchError,
        CedaRateLimitError,
        CedaAuthError,
        CedaNetworkError,
        CedaApiError,
    )
    from app.data.validator import DataValidator
    from app.data.cleaner import DataCleaner
    from app.data.transformer import DataTransformer
except ImportError:
    from database import SessionLocal, init_db, test_db_connection
    from models import AgriculturalMarketData, DataSource, Grain, Location
    from data.fetcher import (
        DataFetcher,
        FetchError,
        CedaRateLimitError,
        CedaAuthError,
        CedaNetworkError,
        CedaApiError,
    )
    from data.validator import DataValidator
    from data.cleaner import DataCleaner
    from data.transformer import DataTransformer

logger = logging.getLogger(__name__)


class DataIngestionService:
    """
    Coordinates data pipeline and executes duplicate-safe upserts into Supabase.
    """

    def __init__(
        self,
        fetcher: Optional[DataFetcher] = None,
        validator: Optional[DataValidator] = None,
        cleaner: Optional[DataCleaner] = None,
        transformer: Optional[DataTransformer] = None,
    ):
        self.fetcher = fetcher or DataFetcher()
        self.validator = validator or DataValidator()
        self.cleaner = cleaner or DataCleaner()
        self.transformer = transformer or DataTransformer()

    async def check_health(self) -> Dict[str, Any]:
        """
        Verifies health of backend, data source, and database connection.
        """
        # Ensure tables exist
        try:
            init_db()
        except Exception as exc:
            logger.warning(f"init_db check warning: {exc}")

        data_source_ok = await self.fetcher.check_health()
        db_connected = test_db_connection()

        supabase_url = os.getenv("SUPABASE_URL", "")
        supabase_key = os.getenv("SUPABASE_KEY", "")
        db_url = os.getenv("DATABASE_URL", "")

        is_supabase_configured = bool(
            (supabase_url and supabase_key)
            or ("supabase" in db_url.lower())
            or ("pooler" in db_url.lower())
        )

        overall_status = "ok" if (db_connected and data_source_ok) else "degraded"

        return {
            "status": overall_status,
            "backend": True,
            "data_source_reachable": data_source_ok,
            "database_connected": db_connected,
            "supabase_configured": is_supabase_configured,
            "details": {
                "database_type": "postgresql" if ("postgres" in db_url.lower()) else "sqlite",
                "default_commodity": "Wheat",
                "target": "Supabase PostgreSQL",
            },
        }

    async def ingest_market_data(
        self,
        source_url: Optional[str] = None,
        commodity: str = "Wheat",
        limit: int = 100,
        source: Optional[str] = "ceda",
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        db: Optional[Session] = None,
        dry_run: bool = False,
    ) -> Dict[str, Any]:
        """
        Runs the full agricultural data pipeline:
        FETCH (CEDA / Open Data) -> VALIDATE -> CLEAN -> NORMALIZE -> STORE (UPSERT)
        """
        # Step 1: FETCH
        logger.info(
            f"API request started: source={source}, commodity={commodity}, "
            f"state={state}, district={district}, market={market}, dates={from_date} to {to_date}"
        )
        try:
            raw_records, source_name, target_url = await self.fetcher.fetch_source_data(
                source_url=source_url,
                commodity=commodity,
                limit=limit,
                source=source,
                state=state,
                district=district,
                market=market,
                from_date=from_date,
                to_date=to_date,
            )
        except CedaRateLimitError as exc:
            logger.warning(f"CEDA rate limit encountered: {exc}")
            return {
                "success": False,
                "source": "ceda_agmarknet_api",
                "dry_run": dry_run,
                "records_fetched": 0,
                "records_received": 0,
                "records_valid": 0,
                "records_rejected": 0,
                "records_stored": 0,
                "records_inserted": 0,
                "records_skipped": 0,
                "records_skipped_as_duplicates": 0,
                "message": f"Rate limit reached: {str(exc)}",
            }
        except FetchError as exc:
            logger.error(f"Data fetch error: {exc}")
            return {
                "success": False,
                "source": "external_api",
                "dry_run": dry_run,
                "records_fetched": 0,
                "records_received": 0,
                "records_valid": 0,
                "records_rejected": 0,
                "records_stored": 0,
                "records_inserted": 0,
                "records_skipped": 0,
                "records_skipped_as_duplicates": 0,
                "message": f"Fetch failed: {str(exc)}",
            }

        total_fetched = len(raw_records)
        logger.info(f"Number of records received: {total_fetched}")

        close_session = False
        if db is None:
            try:
                init_db()
            except Exception as exc:
                logger.warning(f"init_db check warning: {exc}")
            db = SessionLocal()
            close_session = True

        try:
            if total_fetched == 0:
                final_db_count = db.query(AgriculturalMarketData).count()
                logger.info(f"Number of valid records: 0")
                logger.info(f"Number rejected: 0")
                logger.info(f"Number inserted: 0")
                logger.info(f"Number skipped as duplicates: 0")
                logger.info(f"Final database count: {final_db_count}")
                return {
                    "success": True,
                    "source": source_name,
                    "dry_run": dry_run,
                    "records_fetched": 0,
                    "records_received": 0,
                    "records_valid": 0,
                    "records_rejected": 0,
                    "records_stored": 0,
                    "records_inserted": 0,
                    "records_skipped": 0,
                    "records_skipped_as_duplicates": 0,
                    "final_database_count": final_db_count,
                    "message": "Data source reachable = YES, Data available = NO (0 records)",
                }

            # Step 2: VALIDATE
            valid_records, skipped_records, _ = self.validator.validate_records(raw_records)
            total_valid = len(valid_records)
            total_invalid = len(skipped_records)
            logger.info(f"Number of valid records: {total_valid}")
            logger.info(f"Number rejected: {total_invalid}")

            if total_valid == 0:
                final_db_count = db.query(AgriculturalMarketData).count()
                logger.info(f"Number inserted: 0")
                logger.info(f"Number skipped as duplicates: 0")
                logger.info(f"Final database count: {final_db_count}")
                return {
                    "success": False,
                    "source": source_name,
                    "dry_run": dry_run,
                    "records_fetched": total_fetched,
                    "records_received": total_fetched,
                    "records_valid": 0,
                    "records_rejected": total_invalid,
                    "records_stored": 0,
                    "records_inserted": 0,
                    "records_skipped": total_fetched,
                    "records_skipped_as_duplicates": 0,
                    "final_database_count": final_db_count,
                    "message": "All fetched records were invalid",
                }

            # Step 3: CLEAN
            cleaned_records = self.cleaner.clean_records(valid_records)

            # Step 4: TRANSFORM (Deterministic IDs)
            transformed_records = self.transformer.transform_records(cleaned_records)

            # Step 5: STORE (Supabase / PostgreSQL)
            if dry_run:
                # Dry run: check which records exist without inserting or updating
                source_record_ids = [r["source_record_id"] for r in transformed_records]
                existing_count = (
                    db.query(AgriculturalMarketData)
                    .filter(AgriculturalMarketData.source_record_id.in_(source_record_ids))
                    .count()
                )
                would_insert = total_valid - existing_count
                would_update = existing_count
                final_db_count = db.query(AgriculturalMarketData).count()
                logger.info(f"Number inserted: {would_insert} (dry run)")
                logger.info(f"Number skipped as duplicates: {would_update} (dry run)")
                logger.info(f"Final database count: {final_db_count}")
                return {
                    "success": True,
                    "source": source_name,
                    "dry_run": True,
                    "records_fetched": total_fetched,
                    "records_received": total_fetched,
                    "records_valid": total_valid,
                    "records_rejected": total_invalid,
                    "records_stored": would_insert,
                    "records_inserted": would_insert,
                    "records_skipped": total_invalid + would_update,
                    "records_skipped_as_duplicates": would_update,
                    "records_would_insert": would_insert,
                    "records_would_update": would_update,
                    "final_database_count": final_db_count,
                    "message": (
                        f"[DRY RUN] Processed {total_fetched} records: {would_insert} would be inserted, "
                        f"{would_update} would be updated, {total_invalid} invalid skipped."
                    ),
                }

            stored_count, duplicate_count = self._store_records_in_db(
                db=db,
                source_name=source_name,
                source_url=target_url,
                records=transformed_records,
            )
            total_skipped = total_invalid + duplicate_count
            final_db_count = db.query(AgriculturalMarketData).count()

            logger.info(f"Number inserted: {stored_count}")
            logger.info(f"Number skipped as duplicates: {duplicate_count}")
            logger.info(f"Final database count: {final_db_count}")

            return {
                "success": True,
                "source": source_name,
                "dry_run": False,
                "records_fetched": total_fetched,
                "records_received": total_fetched,
                "records_valid": total_valid,
                "records_rejected": total_invalid,
                "records_stored": stored_count,
                "records_inserted": stored_count,
                "records_skipped": total_skipped,
                "records_skipped_as_duplicates": duplicate_count,
                "final_database_count": final_db_count,
                "message": (
                    f"Processed {total_fetched} records: {stored_count} stored in Supabase, "
                    f"{duplicate_count} existing duplicates skipped/updated, {total_invalid} invalid records skipped."
                ),
            }
        except Exception as exc:
            db.rollback()
            logger.error(f"Failed to store records in Supabase: {exc}", exc_info=True)
            return {
                "success": False,
                "source": source_name,
                "records_fetched": total_fetched,
                "records_received": total_fetched,
                "records_valid": total_valid,
                "records_rejected": total_invalid if 'total_invalid' in locals() else 0,
                "records_stored": 0,
                "records_inserted": 0,
                "records_skipped": total_fetched,
                "records_skipped_as_duplicates": 0,
                "message": f"Database storage error: {str(exc)}",
            }
        finally:
            if close_session:
                db.close()

    def _store_records_in_db(
        self,
        db: Session,
        source_name: str,
        source_url: str,
        records: List[Dict[str, Any]],
    ) -> (int, int):
        """
        Saves records into database using duplicate-safe logic.
        Returns (stored_count, duplicate_count).
        """
        # 1. Resolve or create DataSource
        source = db.query(DataSource).filter(DataSource.name == source_name).first()
        if not source:
            source = DataSource(
                name=source_name,
                source_url=source_url,
                source_type="json_api" if "api" in source_name else "csv",
            )
            db.add(source)
            db.flush()

        # 2. Cache & Resolve Grains
        grain_names = {r["commodity"] for r in records}
        existing_grains = {
            g.name: g for g in db.query(Grain).filter(Grain.name.in_(grain_names)).all()
        }
        for g_name in grain_names:
            if g_name not in existing_grains:
                new_grain = Grain(name=g_name)
                db.add(new_grain)
                db.flush()
                existing_grains[g_name] = new_grain

        # 3. Cache & Resolve Locations (state, district, market)
        loc_tuples = {(r["state"], r["district"], r["market"]) for r in records}
        existing_locs = {}
        for s, d, m in loc_tuples:
            loc = (
                db.query(Location)
                .filter(Location.state == s, Location.district == d, Location.market == m)
                .first()
            )
            if loc:
                existing_locs[(s, d, m)] = loc
            else:
                new_loc = Location(state=s, district=d, market=m)
                db.add(new_loc)
                db.flush()
                existing_locs[(s, d, m)] = new_loc

        # 4. Find existing records to prevent duplicate insertion
        record_ids = [r["source_record_id"] for r in records]
        existing_market_records = {
            m.source_record_id: m
            for m in db.query(AgriculturalMarketData)
            .filter(
                AgriculturalMarketData.source_id == source.id,
                AgriculturalMarketData.source_record_id.in_(record_ids),
            )
            .all()
        }

        stored_count = 0
        duplicate_count = 0
        now_utc = datetime.now(timezone.utc)

        for r in records:
            rec_id = r["source_record_id"]
            grain_obj = existing_grains[r["commodity"]]
            loc_obj = existing_locs[(r["state"], r["district"], r["market"])]

            if rec_id in existing_market_records:
                # Existing record: update prices and timestamp if newer (UPSERT)
                existing = existing_market_records[rec_id]
                existing.arrival_quantity = r["arrival_quantity"]
                existing.minimum_price = r["minimum_price"]
                existing.maximum_price = r["maximum_price"]
                existing.modal_price = r["modal_price"]
                existing.variety = r["variety"]
                existing.collected_at = now_utc
                existing.updated_at = now_utc
                duplicate_count += 1
            else:
                # New record: insert with fetch timestamp
                new_entry = AgriculturalMarketData(
                    source_id=source.id,
                    grain_id=grain_obj.id,
                    location_id=loc_obj.id,
                    record_date=r["record_date"],
                    variety=r["variety"],
                    arrival_quantity=r["arrival_quantity"],
                    minimum_price=r["minimum_price"],
                    maximum_price=r["maximum_price"],
                    modal_price=r["modal_price"],
                    source_record_id=rec_id,
                    collected_at=now_utc,
                )
                db.add(new_entry)
                existing_market_records[rec_id] = new_entry
                stored_count += 1

        db.commit()
        logger.info(f"Database commit successful: {stored_count} new, {duplicate_count} existing")
        return stored_count, duplicate_count

    # =================================================================
    # Direct CEDA Endpoints Delegate Methods
    # =================================================================

    async def get_ceda_commodities(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """Delegates commodity retrieval to CEDA fetcher."""
        return await self.fetcher.ceda_fetcher.get_commodities(force_refresh=force_refresh)

    async def get_ceda_geographies(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """Delegates geography retrieval to CEDA fetcher."""
        return await self.fetcher.ceda_fetcher.get_geographies(force_refresh=force_refresh)

    async def get_ceda_markets(
        self,
        commodity_id: int,
        state_id: int,
        district_id: Optional[int] = None,
        indicator: str = "price",
    ) -> List[Dict[str, Any]]:
        """Delegates market retrieval to CEDA fetcher."""
        return await self.fetcher.ceda_fetcher.get_markets(
            commodity_id=commodity_id,
            state_id=state_id,
            district_id=district_id,
            indicator=indicator,
        )

    async def get_ceda_prices(
        self,
        commodity_id: int,
        state_id: int,
        from_date: str,
        to_date: str,
        district_id: Optional[int] = None,
        market_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Delegates price retrieval to CEDA fetcher."""
        return await self.fetcher.ceda_fetcher.get_prices(
            commodity_id=commodity_id,
            state_id=state_id,
            from_date=from_date,
            to_date=to_date,
            district_id=district_id,
            market_id=market_id,
        )

    async def get_ceda_quantities(
        self,
        commodity_id: int,
        state_id: int,
        from_date: str,
        to_date: str,
        district_id: Optional[int] = None,
        market_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """Delegates quantity retrieval to CEDA fetcher."""
        return await self.fetcher.ceda_fetcher.get_quantities(
            commodity_id=commodity_id,
            state_id=state_id,
            from_date=from_date,
            to_date=to_date,
            district_id=district_id,
            market_id=market_id,
        )

    def get_market_summary(self, db: Session) -> Dict[str, Any]:
        """Returns aggregate metrics of stored agricultural market data."""
        total_records = db.query(AgriculturalMarketData).count()
        total_grains = db.query(Grain).count()
        total_locations = db.query(Location).count()

        latest_record = (
            db.query(AgriculturalMarketData)
            .order_by(AgriculturalMarketData.record_date.desc())
            .first()
        )
        latest_date = str(latest_record.record_date) if latest_record else None

        return {
            "total_records": total_records,
            "total_grains": total_grains,
            "total_locations": total_locations,
            "latest_date": latest_date,
        }


# Singleton service instance
data_ingestion_service = DataIngestionService()
