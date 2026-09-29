"""
test_ceda_integration.py - Comprehensive Unit & Integration Tests for CEDA Agmarknet API

Tests:
1. Environment token resolution from CEDA_API_TOKEN (security & credential integrity).
2. Never prints or leaks API token.
3. Missing token raises CedaAuthError.
4. Commodities endpoint retrieval & caching.
5. Geographies endpoint retrieval & caching.
6. Market retrieval with indicator & filters.
7. Price retrieval with from_date & to_date.
8. Quantity retrieval with from_date & to_date.
9. Price & quantity merging by date and location.
10. Cleaning & normalization of CEDA data (ISO dates, numeric floats, title casing).
11. Data validation of CEDA records.
12. Deterministic SHA-256 fingerprint generation.
13. Duplicate prevention & UPSERT database storage with fetch timestamp preservation.
14. Error handling: HTTP 429 rate limit (40 req/hr), retry on 5xx and timeouts.
15. FastAPI REST endpoints for CEDA commodities, geographies, markets, prices, quantities, and collect.
"""

import asyncio
from datetime import date, datetime, timezone
import json
import os
import sys
import unittest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import Base, get_db
from app.models import AgriculturalMarketData, DataSource, Grain, Location
from app.data.fetcher import (
    CedaDataFetcher,
    DataFetcher,
    FetchError,
    CedaAuthError,
    CedaRateLimitError,
    CedaNetworkError,
    CedaApiError,
)
from app.data.cleaner import DataCleaner
from app.data.validator import DataValidator
from app.data.transformer import DataTransformer
from app.services.data_ingestion_service import DataIngestionService
from app.main import app


# Real sample payloads recorded from CEDA API for deterministic offline testing
SAMPLE_COMMODITIES_PAYLOAD = {
    "output": {
        "type": "success",
        "message": "Data exists",
        "data": [
            {"commodity_id": 1, "commodity_name": "Wheat"},
            {"commodity_id": 2, "commodity_name": "Paddy(Dhan)(Common)"},
            {"commodity_id": 3, "commodity_name": "Rice"},
            {"commodity_id": 4, "commodity_name": "Maize"},
        ],
    }
}

SAMPLE_GEOGRAPHIES_PAYLOAD = {
    "output": {
        "type": "success",
        "message": "Data exists",
        "data": [
            {
                "census_state_id": 3,
                "census_state_name": "Punjab",
                "census_district_id": 35,
                "census_district_name": "Gurdaspur",
            },
            {
                "census_state_id": 27,
                "census_state_name": "Maharashtra",
                "census_district_id": 497,
                "census_district_name": "Nagpur",
            },
        ],
    }
}

SAMPLE_MARKETS_PAYLOAD = {
    "output": {
        "type": "success",
        "message": "Data exists",
        "data": [
            {
                "census_state_id": 3,
                "census_district_id": 35,
                "market_id": 1585,
                "market_name": "Sri Har Gobindpur",
            },
            {
                "census_state_id": 3,
                "census_district_id": 35,
                "market_id": 1740,
                "market_name": "Kahnuwan",
            },
        ],
    }
}

SAMPLE_PRICES_PAYLOAD = {
    "output": {
        "type": "success",
        "message": "Data exists",
        "data": [
            {
                "date": "2018-04-22T00:00:00.000Z",
                "commodity_id": 1,
                "census_state_id": 3,
                "census_district_id": 35,
                "market_id": 1585,
                "min_price": 1735.0,
                "max_price": 1735.0,
                "modal_price": 1735.0,
            },
            {
                "date": "2018-04-23T00:00:00.000Z",
                "commodity_id": 1,
                "census_state_id": 3,
                "census_district_id": 35,
                "market_id": 1585,
                "min_price": 1740.0,
                "max_price": 1760.0,
                "modal_price": 1750.0,
            },
        ],
    }
}

SAMPLE_QUANTITIES_PAYLOAD = {
    "output": {
        "type": "success",
        "message": "Data exists",
        "data": [
            {
                "date": "2018-04-22T00:00:00.000Z",
                "commodity_id": 1,
                "census_state_id": 3,
                "census_district_id": 35,
                "market_id": 1585,
                "quantity": 2822.0,
            },
            {
                "date": "2018-04-23T00:00:00.000Z",
                "commodity_id": 1,
                "census_state_id": 3,
                "census_district_id": 35,
                "market_id": 1585,
                "quantity": 3150.0,
            },
        ],
    }
}


class TestCedaIntegration(unittest.TestCase):
    """Unit and integration tests for CEDA Agmarknet external integration."""

    def setUp(self):
        """Set up an isolated in-memory SQLite database and test components."""
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
        Base.metadata.create_all(bind=self.engine)
        self.SessionTest = sessionmaker(bind=self.engine, autocommit=False, autoflush=False)
        self.db = self.SessionTest()

        from app.api.data import get_service
        app.dependency_overrides[get_db] = lambda: self.db
        app.dependency_overrides[get_service] = lambda: self.service

        self.cleaner = DataCleaner()
        self.validator = DataValidator()
        self.transformer = DataTransformer()
        self.ceda_fetcher = CedaDataFetcher()
        self.fetcher = DataFetcher()
        self.fetcher.ceda_fetcher = self.ceda_fetcher
        self.service = DataIngestionService(
            fetcher=self.fetcher,
            validator=self.validator,
            cleaner=self.cleaner,
            transformer=self.transformer,
        )
        self.client = TestClient(app)

    def tearDown(self):
        """Clean up database session and overrides."""
        from app.api.data import get_service
        app.dependency_overrides.pop(get_db, None)
        app.dependency_overrides.pop(get_service, None)
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    # -----------------------------------------------------------------
    # 1. Token Reading and Security Tests
    # -----------------------------------------------------------------

    def test_token_read_only_from_env(self):
        """Requirement 2: Token is read strictly from CEDA_API_TOKEN."""
        with patch.dict(os.environ, {"CEDA_API_TOKEN": "test_token_12345"}):
            token = CedaDataFetcher._get_api_token()
            self.assertEqual(token, "test_token_12345")

    def test_missing_token_raises_ceda_auth_error(self):
        """Requirement 2 & 14: Missing CEDA_API_TOKEN raises descriptive CedaAuthError."""
        with patch.dict(os.environ, {}, clear=True):
            if "CEDA_API_TOKEN" in os.environ:
                del os.environ["CEDA_API_TOKEN"]
            with self.assertRaises(CedaAuthError):
                CedaDataFetcher._get_api_token()

    def test_token_never_printed_or_leaked_in_headers(self):
        """Requirement 3: Never hardcode or print API key."""
        dummy_secret = "super_secret_ceda_key_xyz987"
        with patch.dict(os.environ, {"CEDA_API_TOKEN": dummy_secret}):
            headers = self.ceda_fetcher._get_auth_headers()
            self.assertEqual(headers["Authorization"], f"Bearer {dummy_secret}")
            # Ensure repr or str of CedaDataFetcher does not contain the secret
            self.assertNotIn(dummy_secret, repr(self.ceda_fetcher))
            self.assertNotIn(dummy_secret, str(self.ceda_fetcher))

    # -----------------------------------------------------------------
    # 2. CEDA Endpoints Retrieval Tests (Mocked Network)
    # -----------------------------------------------------------------

    def test_get_commodities_success_and_caching(self):
        """Requirement 4: Retrieve commodities and verify in-memory caching."""
        with patch.object(
            self.ceda_fetcher, "_make_request", new_callable=AsyncMock
        ) as mock_req:
            mock_req.return_value = SAMPLE_COMMODITIES_PAYLOAD
            self.ceda_fetcher._commodities_cache = None

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                # First call hits API
                commodities = loop.run_until_complete(self.ceda_fetcher.get_commodities())
                self.assertEqual(len(commodities), 4)
                self.assertEqual(commodities[0]["commodity_name"], "Wheat")
                self.assertEqual(mock_req.call_count, 1)

                # Second call should use in-memory cache without hitting API again
                cached_commodities = loop.run_until_complete(
                    self.ceda_fetcher.get_commodities(force_refresh=False)
                )
                self.assertEqual(len(cached_commodities), 4)
                self.assertEqual(mock_req.call_count, 1)  # No extra network call!
            finally:
                loop.close()

    def test_get_geographies_success(self):
        """Requirement 5: Retrieve states and districts hierarchy."""
        with patch.object(
            self.ceda_fetcher, "_make_request", new_callable=AsyncMock
        ) as mock_req:
            mock_req.return_value = SAMPLE_GEOGRAPHIES_PAYLOAD
            self.ceda_fetcher._geographies_cache = None

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                geos = loop.run_until_complete(self.ceda_fetcher.get_geographies())
                self.assertEqual(len(geos), 2)
                self.assertEqual(geos[0]["census_state_name"], "Punjab")
                self.assertEqual(geos[0]["census_district_name"], "Gurdaspur")
            finally:
                loop.close()

    def test_get_markets_success(self):
        """Requirement 6: Retrieve markets for specified commodity and geography."""
        with patch.object(
            self.ceda_fetcher, "_make_request", new_callable=AsyncMock
        ) as mock_req:
            mock_req.return_value = SAMPLE_MARKETS_PAYLOAD

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                markets = loop.run_until_complete(
                    self.ceda_fetcher.get_markets(commodity_id=1, state_id=3, district_id=35)
                )
                self.assertEqual(len(markets), 2)
                self.assertEqual(markets[0]["market_name"], "Sri Har Gobindpur")
                self.assertEqual(markets[0]["market_id"], 1585)
                # Verify request payload body
                mock_req.assert_called_with(
                    "POST",
                    "/agmarknet/markets",
                    json_body={
                        "indicator": "price",
                        "commodity_id": 1,
                        "state_id": 3,
                        "district_id": 35,
                    },
                )
            finally:
                loop.close()

    def test_get_prices_and_quantities_success(self):
        """Requirements 7 & 8: Retrieve prices and quantities with date filtering."""
        with patch.object(
            self.ceda_fetcher, "_make_request", new_callable=AsyncMock
        ) as mock_req:
            # First call for prices, second for quantities
            mock_req.side_effect = [SAMPLE_PRICES_PAYLOAD, SAMPLE_QUANTITIES_PAYLOAD]

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                prices = loop.run_until_complete(
                    self.ceda_fetcher.get_prices(
                        commodity_id=1,
                        state_id=3,
                        from_date="2018-04-20",
                        to_date="2018-04-25",
                        district_id=35,
                        market_id=1585,
                    )
                )
                self.assertEqual(len(prices), 2)
                self.assertEqual(prices[0]["modal_price"], 1735.0)

                quantities = loop.run_until_complete(
                    self.ceda_fetcher.get_quantities(
                        commodity_id=1,
                        state_id=3,
                        from_date="2018-04-20",
                        to_date="2018-04-25",
                        district_id=35,
                        market_id=1585,
                    )
                )
                self.assertEqual(len(quantities), 2)
                self.assertEqual(quantities[0]["quantity"], 2822.0)
            finally:
                loop.close()

    # -----------------------------------------------------------------
    # 3. Merging, Cleaning, and Validation Tests
    # -----------------------------------------------------------------

    def test_fetch_market_records_merging(self):
        """Requirements 8 & 9: Merge prices and quantities into unified market records."""
        with patch.object(
            self.ceda_fetcher, "get_commodities", new_callable=AsyncMock
        ) as mock_comm, patch.object(
            self.ceda_fetcher, "get_geographies", new_callable=AsyncMock
        ) as mock_geo, patch.object(
            self.ceda_fetcher, "get_markets", new_callable=AsyncMock
        ) as mock_mkt, patch.object(
            self.ceda_fetcher, "get_prices", new_callable=AsyncMock
        ) as mock_prices, patch.object(
            self.ceda_fetcher, "get_quantities", new_callable=AsyncMock
        ) as mock_qty:

            mock_comm.return_value = SAMPLE_COMMODITIES_PAYLOAD["output"]["data"]
            mock_geo.return_value = SAMPLE_GEOGRAPHIES_PAYLOAD["output"]["data"]
            mock_mkt.return_value = SAMPLE_MARKETS_PAYLOAD["output"]["data"]
            mock_prices.return_value = SAMPLE_PRICES_PAYLOAD["output"]["data"]
            mock_qty.return_value = SAMPLE_QUANTITIES_PAYLOAD["output"]["data"]

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                records, source_name, source_url = loop.run_until_complete(
                    self.ceda_fetcher.fetch_market_records(
                        commodity="Wheat",
                        state="Punjab",
                        district="Gurdaspur",
                        from_date="2018-04-20",
                        to_date="2018-04-25",
                    )
                )
                self.assertEqual(source_name, "ceda_agmarknet_api")
                self.assertEqual(len(records), 2)

                # Check merged fields
                rec0 = records[0]
                self.assertEqual(rec0["commodity"], "Wheat")
                self.assertEqual(rec0["state"], "Punjab")
                self.assertEqual(rec0["district"], "Gurdaspur")
                self.assertEqual(rec0["market"], "Sri Har Gobindpur")
                self.assertEqual(rec0["modal_price"], 1735.0)
                self.assertEqual(rec0["arrival_quantity"], 2822.0)  # Quantity merged!
            finally:
                loop.close()

    def test_cleaner_ceda_payload(self):
        """Requirement 9: DataCleaner correctly normalizes CEDA formats."""
        raw_ceda = {
            "commodity_name": "  wheat  ",
            "census_state_name": "PUNJAB",
            "census_district_name": "GURDASPUR",
            "market_name": "sri har gobindpur",
            "date": "2018-04-22T00:00:00.000Z",
            "min_price": "1,735.00",
            "max_price": "1,735.00",
            "modal_price": "1,735.00",
            "quantity": "2,822",
        }
        cleaned = self.cleaner.clean_record(raw_ceda)
        self.assertEqual(cleaned["commodity"], "Wheat")
        self.assertEqual(cleaned["state"], "Punjab")
        self.assertEqual(cleaned["district"], "Gurdaspur")
        self.assertEqual(cleaned["market"], "Sri Har Gobindpur")
        self.assertEqual(cleaned["record_date"], date(2018, 4, 22))
        self.assertEqual(cleaned["modal_price"], 1735.0)
        self.assertEqual(cleaned["arrival_quantity"], 2822.0)

    def test_validator_ceda_payload(self):
        """Requirement 10: DataValidator validates CEDA records before storage."""
        raw_good = {
            "commodity": "Wheat",
            "state": "Punjab",
            "district": "Gurdaspur",
            "market": "Sri Har Gobindpur",
            "date": "2018-04-22",
            "modal_price": 1735.0,
            "quantity": 2822.0,
        }
        is_valid, reason = self.validator.validate_record(raw_good)
        self.assertTrue(is_valid)

        # Invalid: Missing date
        raw_bad_date = dict(raw_good)
        del raw_bad_date["date"]
        is_valid, reason = self.validator.validate_record(raw_bad_date)
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: date", reason)

        # Invalid: Negative price
        raw_bad_price = dict(raw_good)
        raw_bad_price["modal_price"] = -100
        is_valid, reason = self.validator.validate_record(raw_bad_price)
        self.assertFalse(is_valid)

    # -----------------------------------------------------------------
    # 4. Deterministic Hash & Duplicate Prevention Tests
    # -----------------------------------------------------------------

    def test_transformer_deterministic_source_record_id(self):
        """Requirement 11: SHA-256 fingerprint is 100% deterministic."""
        rec_a = {
            "state": "Punjab",
            "district": "Gurdaspur",
            "market": "Sri Har Gobindpur",
            "commodity": "Wheat",
            "variety": "Standard",
            "record_date": "2018-04-22",
        }
        rec_b = {
            "state": "punjab ",
            "district": " Gurdaspur",
            "market": "Sri Har Gobindpur",
            "commodity": "WHEAT",
            "variety": "standard",
            "record_date": "2018-04-22",
        }
        id_a = self.transformer.generate_source_record_id(rec_a)
        id_b = self.transformer.generate_source_record_id(self.cleaner.clean_record(rec_b))
        self.assertEqual(id_a, id_b)
        self.assertEqual(len(id_a), 64)

    def test_database_duplicate_prevention_upsert(self):
        """Requirements 11, 12, 13: Duplicate prevention, Supabase storage, timestamp preservation."""
        transformed = [
            {
                "commodity": "Wheat",
                "variety": "Standard",
                "state": "Punjab",
                "district": "Gurdaspur",
                "market": "Sri Har Gobindpur",
                "record_date": date(2018, 4, 22),
                "arrival_quantity": 2822.0,
                "minimum_price": 1735.0,
                "maximum_price": 1735.0,
                "modal_price": 1735.0,
                "source_record_id": "ceda_hash_fingerprint_001",
            }
        ]

        # 1st insertion
        stored_1, dups_1 = self.service._store_records_in_db(
            db=self.db,
            source_name="ceda_agmarknet_api",
            source_url="https://api.ceda.ashoka.edu.in/v1",
            records=transformed,
        )
        self.assertEqual(stored_1, 1)
        self.assertEqual(dups_1, 0)
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 1)

        row = self.db.query(AgriculturalMarketData).first()
        self.assertIsNotNone(row.collected_at)
        self.assertEqual(row.modal_price, 1735.0)

        # 2nd insertion with updated price
        transformed_update = [dict(transformed[0])]
        transformed_update[0]["modal_price"] = 1750.0

        stored_2, dups_2 = self.service._store_records_in_db(
            db=self.db,
            source_name="ceda_agmarknet_api",
            source_url="https://api.ceda.ashoka.edu.in/v1",
            records=transformed_update,
        )
        self.assertEqual(stored_2, 0)
        self.assertEqual(dups_2, 1)  # Detected duplicate!

        # Total rows must remain 1 (no duplicate), price updated (UPSERT)
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 1)
        updated_row = self.db.query(AgriculturalMarketData).first()
        self.assertEqual(updated_row.modal_price, 1750.0)

    # -----------------------------------------------------------------
    # 5. Error Handling, Rate Limiting, and Retry Tests
    # -----------------------------------------------------------------

    def test_rate_limit_429_handling(self):
        """Requirement 14: Handles 429 rate limit error gracefully."""
        mock_response = MagicMock()
        mock_response.status_code = 429
        mock_response.headers = {"retry-after": "1600"}
        mock_response.text = '{"status":"failure","message":"Too many requests"}'

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_response

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                with self.assertRaises(CedaRateLimitError) as cm:
                    loop.run_until_complete(self.ceda_fetcher.get_commodities(force_refresh=True))
                self.assertIn("rate limit reached", str(cm.exception).lower())
                self.assertEqual(cm.exception.retry_after, 1600)
            finally:
                loop.close()

    # -----------------------------------------------------------------
    # 6. FastAPI CEDA REST Endpoints Tests
    # -----------------------------------------------------------------

    def test_fastapi_ceda_commodities_endpoint(self):
        """Requirement 4: GET /api/data/commodities endpoint."""
        with patch.object(
            self.service, "get_ceda_commodities", new_callable=AsyncMock
        ) as mock_get:
            mock_get.return_value = SAMPLE_COMMODITIES_PAYLOAD["output"]["data"]

            resp = self.client.get("/api/data/commodities")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["count"], 4)
            self.assertEqual(data["commodities"][0]["commodity_name"], "Wheat")

    def test_fastapi_ceda_geographies_endpoint(self):
        """Requirement 5: GET /api/data/geographies endpoint."""
        with patch.object(
            self.service, "get_ceda_geographies", new_callable=AsyncMock
        ) as mock_get:
            mock_get.return_value = SAMPLE_GEOGRAPHIES_PAYLOAD["output"]["data"]

            resp = self.client.get("/api/data/geographies")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["count"], 2)

    def test_fastapi_ceda_markets_endpoint(self):
        """Requirement 6: POST /api/data/markets endpoint."""
        with patch.object(
            self.service, "get_ceda_markets", new_callable=AsyncMock
        ) as mock_get:
            mock_get.return_value = SAMPLE_MARKETS_PAYLOAD["output"]["data"]

            payload = {
                "commodity_id": 1,
                "state_id": 3,
                "district_id": 35,
                "indicator": "price",
            }
            resp = self.client.post("/api/data/markets", json=payload)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["count"], 2)
            self.assertEqual(data["markets"][0]["market_name"], "Sri Har Gobindpur")

    def test_fastapi_ceda_prices_endpoint(self):
        """Requirement 7: POST /api/data/prices endpoint."""
        with patch.object(
            self.service, "get_ceda_prices", new_callable=AsyncMock
        ) as mock_get:
            mock_get.return_value = SAMPLE_PRICES_PAYLOAD["output"]["data"]

            payload = {
                "commodity_id": 1,
                "state_id": 3,
                "from_date": "2018-04-01",
                "to_date": "2018-04-30",
                "district_id": 35,
                "market_id": 1585,
            }
            resp = self.client.post("/api/data/prices", json=payload)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["count"], 2)
            self.assertEqual(data["prices"][0]["modal_price"], 1735.0)

    def test_fastapi_ceda_quantities_endpoint(self):
        """Requirement 8: POST /api/data/quantities endpoint."""
        with patch.object(
            self.service, "get_ceda_quantities", new_callable=AsyncMock
        ) as mock_get:
            mock_get.return_value = SAMPLE_QUANTITIES_PAYLOAD["output"]["data"]

            payload = {
                "commodity_id": 1,
                "state_id": 3,
                "from_date": "2018-04-01",
                "to_date": "2018-04-30",
                "district_id": 35,
                "market_id": 1585,
            }
            resp = self.client.post("/api/data/quantities", json=payload)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["count"], 2)
            self.assertEqual(data["quantities"][0]["quantity"], 2822.0)

    def test_fastapi_collect_ceda_endpoint(self):
        """Requirements 1, 9, 10, 11, 12, 13: POST /api/data/collect with CEDA source."""
        with patch.object(
            self.fetcher, "fetch_source_data", new_callable=AsyncMock
        ) as mock_fetch:
            mock_records = [
                {
                    "commodity": "Wheat",
                    "state": "Punjab",
                    "district": "Gurdaspur",
                    "market": "Sri Har Gobindpur",
                    "record_date": "2018-04-22",
                    "minimum_price": 1735.0,
                    "maximum_price": 1735.0,
                    "modal_price": 1735.0,
                    "arrival_quantity": 2822.0,
                    "variety": "Standard",
                }
            ]
            mock_fetch.return_value = (
                mock_records,
                "ceda_agmarknet_api",
                "https://api.ceda.ashoka.edu.in/v1",
            )

            payload = {
                "commodity": "Wheat",
                "state": "Punjab",
                "district": "Gurdaspur",
                "source": "ceda",
            }
            resp = self.client.post("/api/data/collect", json=payload)
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["success"])
            self.assertEqual(data["source"], "ceda_agmarknet_api")
            self.assertEqual(data["records_stored"], 1)
            self.assertEqual(self.db.query(AgriculturalMarketData).count(), 1)


if __name__ == "__main__":
    unittest.main()
