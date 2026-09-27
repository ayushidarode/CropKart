"""
transformer.py - Data Transformation and Deterministic ID Generation

WHY THIS FILE EXISTS:
Government datasets rarely provide a permanent unique database ID for each mandi row.
If we run data collection twice, we must NOT insert duplicate records into Supabase.
This file generates a unique fingerprint for each record.

WHAT THIS FILE DOES:
1. Calculates a deterministic SHA-256 hash `source_record_id` using:
   (state + district + market + commodity + variety + record_date).
2. Structures records so they match Supabase table columns.

WHAT GOES IN:
- Cleaned records.

WHAT COMES OUT:
- Transformed records with unique `source_record_id`.
"""

import hashlib
import logging
from typing import Any, Dict, List

logger = logging.getLogger(__name__)


class DataTransformer:
    """
    Prepares cleaned agricultural records for database insertion.
    Generates deterministic unique IDs to prevent duplicate inserts.
    """

    @staticmethod
    def generate_source_record_id(record: Dict[str, Any]) -> str:
        """
        Creates a deterministic hash fingerprint from record fields.
        Same mandi + crop + variety + date will ALWAYS produce the exact same ID.
        """
        raw_key = (
            f"{record['state']}|"
            f"{record['district']}|"
            f"{record['market']}|"
            f"{record['commodity']}|"
            f"{record.get('variety', '')}|"
            f"{record['record_date']}"
        ).lower()

        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    def transform_record(self, clean_record: Dict[str, Any]) -> Dict[str, Any]:
        """Adds source_record_id and returns database-ready record."""
        record_id = self.generate_source_record_id(clean_record)
        return {
            **clean_record,
            "source_record_id": record_id,
        }

    def transform_records(self, clean_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transforms a list of cleaned records."""
        transformed = [self.transform_record(r) for r in clean_records]
        logger.info(f"Transformed {len(transformed)} records with deterministic IDs")
        return transformed
