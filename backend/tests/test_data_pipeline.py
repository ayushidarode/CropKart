"""
test_data_pipeline.py - Comprehensive Unit & Integration Tests for Data Pipeline

Tests:
1. API fetch parsing (CSV & JSON)
2. Empty response handling
3. Invalid records handling
4. Data cleaning & normalization
5. Deterministic unique record ID generation
6. Supabase / PostgreSQL database insertion
7. Duplicate protection (idempotency / UPSERT)
8. FastAPI endpoints (/api/data/health, /api/data/collect, /api/data/market-summary)
"""

import os
import sys
import unittest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Ensure backend root is in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.database import Base
from app.models import AgriculturalMarketData, DataSource, Grain, Location
from app.data.fetcher import DataFetcher
from app.data.validator import DataValidator
from app.data.cleaner import DataCleaner
from app.data.transformer import DataTransformer
from app.services.data_ingestion_service import DataIngestionService
from fastapi.testclient import TestClient
from app.main import app


class TestDataPipeline(unittest.TestCase):
    """Unit and integration tests for CropKart agricultural data pipeline."""

    def setUp(self):
        """Set up an isolated in-memory SQLite database for test runs."""
        from sqlalchemy.pool import StaticPool
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False
        )
        Base.metadata.create_all(bind=self.engine)
        self.SessionTest = sessionmaker(bind=self.engine, autocommit=False, autoflush=False)
        self.db = self.SessionTest()

        self.validator = DataValidator()
        self.cleaner = DataCleaner()
        self.transformer = DataTransformer()
        self.service = DataIngestionService(
            validator=self.validator,
            cleaner=self.cleaner,
            transformer=self.transformer,
        )

        from app.database import get_db
        app.dependency_overrides[get_db] = lambda: self.db

    def tearDown(self):
        """Clean up database session and drop all tables."""
        from app.database import get_db
        app.dependency_overrides.pop(get_db, None)
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    # 1. Validator Tests
    def test_validator_valid_record(self):
        """Verify valid agricultural record passes validation."""
        valid_sample = {
            "State Name": "Madhya Pradesh",
            "District Name": "Indore",
            "Market Name": "Indore Mandi",
            "commodity": "Wheat",
            "Reported Date": "01 Jan 2017",
            "Modal Price (Rs./Quintal)": "1850",
            "Arrivals (Tonnes)": "45.5",
        }
        is_valid, reason = self.validator.validate_record(valid_sample)
        self.assertTrue(is_valid)
        self.assertEqual(reason, "Valid")

    def test_validator_missing_required_fields(self):
        """Verify record with missing mandatory field is rejected."""
        # Missing market name
        missing_market = {
            "State Name": "Gujarat",
            "District Name": "Surat",
            "commodity": "Wheat",
            "Reported Date": "01 Jan 2017",
            "Modal Price (Rs./Quintal)": "1700",
        }
        is_valid, reason = self.validator.validate_record(missing_market)
        self.assertFalse(is_valid)
        self.assertIn("Missing required field: market", reason)

    def test_validator_invalid_prices(self):
        """Verify record with no valid price is safely rejected."""
        no_price = {
            "State Name": "Punjab",
            "District Name": "Ludhiana",
            "Market Name": "Khanna",
            "commodity": "Wheat",
            "Reported Date": "01 Jan 2017",
            "Modal Price (Rs./Quintal)": "invalid_price",
        }
        is_valid, reason = self.validator.validate_record(no_price)
        self.assertFalse(is_valid)
        self.assertIn("No valid positive price found", reason)

    # 2. Cleaner Tests
    def test_cleaner_normalization(self):
        """Verify string trimming, title casing, and numeric parsing."""
        raw_record = {
            "State Name": "  madhya pradesh  ",
            "District Name": "INDORE",
            "Market Name": "indore mandi ",
            "commodity": " wheat ",
            "Variety": "lokwan",
            "Reported Date": "01 Jan 2017",
            "Arrivals (Tonnes)": " 12.50 ",
            "Min Price (Rs./Quintal)": " 1,750.00 ",
            "Max Price (Rs./Quintal)": " 1,950.00 ",
            "Modal Price (Rs./Quintal)": " 1,850.00 ",
        }
        cleaned = self.cleaner.clean_record(raw_record)

        self.assertEqual(cleaned["state"], "Madhya Pradesh")
        self.assertEqual(cleaned["district"], "Indore")
        self.assertEqual(cleaned["market"], "Indore Mandi")
        self.assertEqual(cleaned["commodity"], "Wheat")
        self.assertEqual(cleaned["variety"], "Lokwan")
        self.assertEqual(cleaned["record_date"], date(2017, 1, 1))
        self.assertEqual(cleaned["arrival_quantity"], 12.50)
        self.assertEqual(cleaned["minimum_price"], 1750.00)
        self.assertEqual(cleaned["maximum_price"], 1950.00)
        self.assertEqual(cleaned["modal_price"], 1850.00)

    # 3. Transformer & Deterministic Uniqueness Tests
    def test_transformer_deterministic_uniqueness(self):
        """Verify deterministic SHA-256 fingerprint remains identical for same inputs."""
        clean_rec = {
            "state": "Maharashtra",
            "district": "Pune",
            "market": "Pune APMC",
            "commodity": "Wheat",
            "variety": "Lokwan",
            "record_date": date(2017, 1, 1),
            "modal_price": 2000.0,
        }
        id_1 = self.transformer.generate_source_record_id(clean_rec)
        id_2 = self.transformer.generate_source_record_id(clean_rec)
        self.assertEqual(id_1, id_2)
        self.assertEqual(len(id_1), 64)

        # Different date produces different hash
        clean_rec_2 = {**clean_rec, "record_date": date(2017, 1, 2)}
        id_3 = self.transformer.generate_source_record_id(clean_rec_2)
        self.assertNotEqual(id_1, id_3)

    # 4. Fetcher Parsing Tests
    def test_fetcher_parse_csv_headerless(self):
        """Verify Agmarknet headerless CSV format is properly mapped to fields."""
        fetcher = DataFetcher()
        csv_sample = (
            "Gujarat,Mehsana,Kadi,Other,Cereals,13.60,1725,2075,1950,01 Jan 2017\n"
            "Gujarat,Surat,Mandvi,Other,Cereals,0.07,1250,1250,1250,01 Jan 2017"
        )
        records = fetcher._parse_csv(csv_sample, default_commodity="Wheat")
        self.assertEqual(len(records), 2)
        self.assertEqual(records[0]["State Name"], "Gujarat")
        self.assertEqual(records[0]["Market Name"], "Kadi")
        self.assertEqual(records[0]["Modal Price (Rs./Quintal)"], "1950")
        self.assertEqual(records[0]["commodity"], "Wheat")

    def test_fetcher_parse_json(self):
        """Verify JSON with records wrapper is parsed."""
        fetcher = DataFetcher()
        json_sample = '{"records": [{"state": "Punjab", "district": "Patiala", "market": "Nabha", "commodity": "Wheat", "modal_price": 1800, "date": "2017-01-01"}]}'
        records = fetcher._parse_json(json_sample)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["state"], "Punjab")

    def test_fetcher_empty_response(self):
        """Verify empty CSV and empty JSON return empty lists without crashing."""
        fetcher = DataFetcher()
        self.assertEqual(fetcher._parse_csv(""), [])
        self.assertEqual(fetcher._parse_json("[]"), [])
        self.assertEqual(fetcher._parse_json('{"records": []}'), [])


    # 5. Database Insertion & Duplicate Protection (UPSERT) Tests
    def test_database_storage_and_duplicate_protection(self):
        """Verify records are inserted, and re-inserting identical records does not create duplicates."""
        sample_records = [
            {
                "commodity": "Wheat",
                "variety": "Lokwan",
                "state": "Madhya Pradesh",
                "district": "Indore",
                "market": "Indore Market",
                "record_date": date(2017, 1, 1),
                "arrival_quantity": 50.0,
                "minimum_price": 1700.0,
                "maximum_price": 1800.0,
                "modal_price": 1750.0,
                "source_record_id": "test_hash_001",
            },
            {
                "commodity": "Wheat",
                "variety": "Sharbati",
                "state": "Madhya Pradesh",
                "district": "Sehore",
                "market": "Sehore Market",
                "record_date": date(2017, 1, 1),
                "arrival_quantity": 30.0,
                "minimum_price": 2100.0,
                "maximum_price": 2300.0,
                "modal_price": 2200.0,
                "source_record_id": "test_hash_002",
            },
        ]

        # First ingestion
        stored_1, dups_1 = self.service._store_records_in_db(
            db=self.db,
            source_name="test_source",
            source_url="http://test.url",
            records=sample_records,
        )
        self.assertEqual(stored_1, 2)
        self.assertEqual(dups_1, 0)
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 2)
        self.assertEqual(self.db.query(Grain).count(), 1)
        self.assertEqual(self.db.query(Location).count(), 2)

        # Second ingestion with EXACT same records (Idempotency test)
        stored_2, dups_2 = self.service._store_records_in_db(
            db=self.db,
            source_name="test_source",
            source_url="http://test.url",
            records=sample_records,
        )
        # Should NOT add any new rows
        self.assertEqual(stored_2, 0)
        self.assertEqual(dups_2, 2)
        # Total count in database MUST still be exactly 2
        self.assertEqual(self.db.query(AgriculturalMarketData).count(), 2)

    # 6. FastAPI Endpoints Tests
    def test_fastapi_data_endpoints(self):
        """Verify /api/data/health, /api/data/market-summary, and /api/data/records endpoints."""
        client = TestClient(app)

        # Health endpoint
        health_resp = client.get("/api/data/health")
        self.assertEqual(health_resp.status_code, 200)
        health_data = health_resp.json()
        self.assertTrue(health_data["backend"])
        self.assertIn("database_connected", health_data)
        self.assertIn("data_source_reachable", health_data)

        # Market summary endpoint
        summary_resp = client.get("/api/data/market-summary")
        self.assertEqual(summary_resp.status_code, 200)
        summary_data = summary_resp.json()
        self.assertIn("total_records", summary_data)

        # Status endpoint (Section 17 requirement)
        status_resp = client.get("/api/data/status")
        self.assertEqual(status_resp.status_code, 200)
        status_data = status_resp.json()
        self.assertIn("source", status_data)
        self.assertIn("database", status_data)
        self.assertIn("records_stored", status_data)

        # List records endpoint
        records_resp = client.get("/api/data/records?limit=5")
        self.assertEqual(records_resp.status_code, 200)
        self.assertIsInstance(records_resp.json(), list)


if __name__ == "__main__":
    unittest.main()
