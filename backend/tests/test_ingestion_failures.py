"""
test_ingestion_failures.py - Rigorous Failure Case Tests for CropKart Ingestion Pipeline

Covers Task 11 requirements:
1. API unavailable (network timeout / connection failure)
2. Empty API response (0 records returned)
3. Malformed records (missing fields, bad dates, min > max price, placeholders, negative values)
4. Duplicate records (idempotency, no duplicate rows, UPSERT handling)
5. Database insertion failure (SQLAlchemy rollback on DB error)
"""

import os
import sys
import unittest
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import SQLAlchemyError

# Ensure backend root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import Base
from app.models import AgriculturalMarketData, DataSource, Grain, Location
from app.data.fetcher import (
    DataFetcher,
    FetchError,
    CedaNetworkError,
    CedaRateLimitError,
    CedaApiError,
)
from app.data.validator import DataValidator
from app.data.cleaner import DataCleaner
from app.data.transformer import DataTransformer
from app.services.data_ingestion_service import DataIngestionService


class TestIngestionFailures(unittest.IsolatedAsyncioTestCase):
    """Failure and edge-case test suite for data ingestion pipeline."""

    def setUp(self):
        """Set up in-memory SQLite database for isolated test execution."""
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
        Base.metadata.create_all(bind=self.engine)
        self.SessionTest = sessionmaker(bind=self.engine, autocommit=False, autoflush=False)
        self.db = self.SessionTest()

        self.validator = DataValidator()
        self.cleaner = DataCleaner()
        self.transformer = DataTransformer()
        self.mock_fetcher = MagicMock(spec=DataFetcher)
        self.service = DataIngestionService(
            fetcher=self.mock_fetcher,
            validator=self.validator,
            cleaner=self.cleaner,
            transformer=self.transformer,
        )

    def tearDown(self):
        """Clean up database session and drop tables."""
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    # -----------------------------------------------------------------
    # 1. API Unavailable
    # -----------------------------------------------------------------
    async def test_failure_api_unavailable_network_error(self):
        """Pipeline must handle external API network failure gracefully."""
        self.mock_fetcher.fetch_source_data = AsyncMock(
            side_effect=FetchError("Connection timed out after 45 seconds")
        )

        result = await self.service.ingest_market_data(
            commodity="Wheat",
            source="ceda",
            db=self.db,
        )

        self.assertFalse(result["success"])
        self.assertEqual(result["records_fetched"], 0)
        self.assertEqual(result["records_stored"], 0)
        self.assertIn("Fetch failed", result["message"])
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 0)

    async def test_failure_api_rate_limit_exceeded(self):
        """Pipeline must handle 429 rate limit error gracefully."""
        self.mock_fetcher.fetch_source_data = AsyncMock(
            side_effect=CedaRateLimitError("CEDA API rate limit reached (40 requests/hour)")
        )

        result = await self.service.ingest_market_data(
            commodity="Wheat",
            source="ceda",
            db=self.db,
        )

        self.assertFalse(result["success"])
        self.assertEqual(result["records_fetched"], 0)
        self.assertEqual(result["records_stored"], 0)
        self.assertIn("Rate limit reached", result["message"])

    # -----------------------------------------------------------------
    # 2. Empty API Response
    # -----------------------------------------------------------------
    async def test_empty_api_response(self):
        """Pipeline must handle empty data response (0 records) cleanly."""
        self.mock_fetcher.fetch_source_data = AsyncMock(
            return_value=([], "ceda_agmarknet_api", "https://api.ceda.ashoka.edu.in/v1")
        )

        result = await self.service.ingest_market_data(
            commodity="Wheat",
            source="ceda",
            db=self.db,
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["records_fetched"], 0)
        self.assertEqual(result["records_valid"], 0)
        self.assertEqual(result["records_stored"], 0)
        self.assertIn("0 records", result["message"])
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 0)

    # -----------------------------------------------------------------
    # 3. Malformed Records Validation
    # -----------------------------------------------------------------
    def test_malformed_record_missing_required_fields(self):
        """Records missing state, district, market, or commodity must be rejected."""
        # Missing state
        is_valid, reason = self.validator.validate_record({
            "district": "Pune", "market": "Pune APMC", "commodity": "Wheat",
            "date": "2025-01-01", "modal_price": 2400,
        })
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: state", reason)

        # Missing district
        is_valid, reason = self.validator.validate_record({
            "state": "Maharashtra", "market": "Pune APMC", "commodity": "Wheat",
            "date": "2025-01-01", "modal_price": 2400,
        })
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: district", reason)

        # Missing market
        is_valid, reason = self.validator.validate_record({
            "state": "Maharashtra", "district": "Pune", "commodity": "Wheat",
            "date": "2025-01-01", "modal_price": 2400,
        })
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: market", reason)

        # Missing commodity
        is_valid, reason = self.validator.validate_record({
            "state": "Maharashtra", "district": "Pune", "market": "Pune APMC",
            "date": "2025-01-01", "modal_price": 2400,
        })
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: commodity", reason)

    def test_malformed_record_placeholder_values(self):
        """Records containing placeholder junk ('N/A', '-', 'null') must be rejected."""
        placeholder_record = {
            "state": "Maharashtra",
            "district": "Pune",
            "market": "N/A",  # placeholder
            "commodity": "Wheat",
            "date": "2025-01-01",
            "modal_price": 2400,
        }
        is_valid, reason = self.validator.validate_record(placeholder_record)
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: market", reason)

    def test_malformed_record_out_of_range_or_invalid_date(self):
        """Unparseable dates or years before 1990 must be rejected."""
        # Unparseable
        is_valid, reason = self.validator.validate_record({
            "state": "Maharashtra", "district": "Pune", "market": "Pune APMC",
            "commodity": "Wheat", "date": "not-a-valid-date", "modal_price": 2400,
        })
        self.assertFalse(is_valid)
        self.assertIn("Invalid date", reason)

        # Year 1850 (too old)
        is_valid, reason = self.validator.validate_record({
            "state": "Maharashtra", "district": "Pune", "market": "Pune APMC",
            "commodity": "Wheat", "date": "1850-05-01", "modal_price": 2400,
        })
        self.assertFalse(is_valid)
        self.assertIn("Date out of valid range", reason)

    def test_malformed_record_min_price_exceeds_max_price(self):
        """Records where min_price > max_price must be rejected as logically corrupted."""
        inverted_record = {
            "state": "Maharashtra", "district": "Pune", "market": "Pune APMC",
            "commodity": "Wheat", "date": "2025-01-01",
            "min_price": 3000.0,
            "max_price": 2000.0,  # Min > Max
            "modal_price": 2500.0,
        }
        is_valid, reason = self.validator.validate_record(inverted_record)
        self.assertFalse(is_valid)
        self.assertIn("Min price", reason)
        self.assertIn("cannot exceed max price", reason)

    def test_malformed_record_negative_or_zero_price(self):
        """Records with negative or zero price must be rejected."""
        zero_record = {
            "state": "Maharashtra", "district": "Pune", "market": "Pune APMC",
            "commodity": "Wheat", "date": "2025-01-01",
            "modal_price": 0,
        }
        is_valid, reason = self.validator.validate_record(zero_record)
        self.assertFalse(is_valid)
        self.assertIn("Non-positive price", reason)

    def test_malformed_record_negative_arrival_quantity(self):
        """Records with negative arrival quantity must be rejected."""
        neg_qty_record = {
            "state": "Maharashtra", "district": "Pune", "market": "Pune APMC",
            "commodity": "Wheat", "date": "2025-01-01",
            "modal_price": 2400,
            "arrival_quantity": -15.5,
        }
        is_valid, reason = self.validator.validate_record(neg_qty_record)
        self.assertFalse(is_valid)
        self.assertIn("Negative arrival quantity", reason)

    # -----------------------------------------------------------------
    # 4. Duplicate Records (Idempotency & Re-run Protection)
    # -----------------------------------------------------------------
    async def test_duplicate_protection_and_idempotency(self):
        """
        Re-running ingestion with identical data must NOT create new records.
        Must report duplicate count and perform UPSERT update cleanly.
        """
        raw_test_data = [
            {
                "state": "Punjab",
                "district": "Gurdaspur",
                "market": "Batala",
                "commodity": "Wheat",
                "date": "2025-04-10",
                "min_price": 2200,
                "max_price": 2400,
                "modal_price": 2300,
                "variety": "Standard",
                "arrival_quantity": 40.0,
            },
            {
                "state": "Punjab",
                "district": "Gurdaspur",
                "market": "Dera Baba Nanak",
                "commodity": "Wheat",
                "date": "2025-04-10",
                "min_price": 2250,
                "max_price": 2450,
                "modal_price": 2350,
                "variety": "Standard",
                "arrival_quantity": 25.0,
            },
        ]

        self.mock_fetcher.fetch_source_data = AsyncMock(
            return_value=(raw_test_data, "ceda_agmarknet_api", "https://api.ceda.ashoka.edu.in/v1")
        )

        # First run: 2 records inserted
        run_1 = await self.service.ingest_market_data(
            commodity="Wheat",
            source="ceda",
            db=self.db,
        )
        self.assertTrue(run_1["success"])
        self.assertEqual(run_1["records_inserted"], 2)
        self.assertEqual(run_1["records_skipped_as_duplicates"], 0)
        self.assertEqual(run_1["final_database_count"], 2)
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 2)

        # Second run with EXACT same data: 0 new inserted, 2 skipped as duplicates
        run_2 = await self.service.ingest_market_data(
            commodity="Wheat",
            source="ceda",
            db=self.db,
        )
        self.assertTrue(run_2["success"])
        self.assertEqual(run_2["records_inserted"], 0)
        self.assertEqual(run_2["records_skipped_as_duplicates"], 2)
        # Database count must remain unchanged at exactly 2
        self.assertEqual(run_2["final_database_count"], 2)
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 2)

    # -----------------------------------------------------------------
    # 5. Database Insertion Failure (Rollback Integrity)
    # -----------------------------------------------------------------
    async def test_database_insertion_failure_triggers_rollback(self):
        """Database exception during storage must trigger rollback and return clean error."""
        raw_test_data = [
            {
                "state": "Punjab",
                "district": "Ludhiana",
                "market": "Khanna",
                "commodity": "Wheat",
                "date": "2025-04-10",
                "modal_price": 2300,
            }
        ]
        self.mock_fetcher.fetch_source_data = AsyncMock(
            return_value=(raw_test_data, "ceda_agmarknet_api", "https://api.ceda.ashoka.edu.in/v1")
        )

        # Mock db.commit to raise SQLAlchemyError
        mock_db = MagicMock(spec=self.db)
        mock_db.query.side_effect = SQLAlchemyError("Database connection dropped during query")

        result = await self.service.ingest_market_data(
            commodity="Wheat",
            source="ceda",
            db=mock_db,
        )

        self.assertFalse(result["success"])
        self.assertEqual(result["records_stored"], 0)
        self.assertIn("Database storage error", result["message"])
        # Verify rollback was called
        mock_db.rollback.assert_called_once()


if __name__ == "__main__":
    unittest.main()
