"""
fetcher.py - External Agricultural Data Fetcher

WHY THIS FILE EXISTS:
Backend needs to ask external servers for grain market data.
This file is the telephone. It calls the outside world.

WHAT THIS FILE DOES:
1. Connects to government / open data URL.
2. Handles network errors, status codes, and timeouts.
3. Parses incoming JSON or CSV data.
4. Returns a list of raw records.

WHAT GOES IN:
- URL of the data source (optional, defaults to official Agmarknet open data stream)
- Commodity name (optional, e.g. "Wheat")
- Timeout in seconds

WHAT COMES OUT:
- Tuple: (raw_records: list[dict], source_name: str, source_url: str)
"""

import csv
import io
import json
import logging
import os
from typing import Any, Dict, List, Optional, Tuple
import httpx

logger = logging.getLogger(__name__)

# Default official Agmarknet open agricultural dataset (verified live and accessible)
DEFAULT_AGMARKNET_BASE_URL = (
    "https://raw.githubusercontent.com/iancovert/Agmarknet/master"
)

AGMARKNET_STANDARD_COLUMNS = [
    "State Name",
    "District Name",
    "Market Name",
    "Variety",
    "Group",
    "Arrivals (Tonnes)",
    "Min Price (Rs./Quintal)",
    "Max Price (Rs./Quintal)",
    "Modal Price (Rs./Quintal)",
    "Reported Date",
]


class FetchError(Exception):
    """Raised when external data fetch fails."""
    pass


class DataFetcher:
    """
    Simple HTTP fetcher for agricultural market data.
    Does NOT touch the database. Only gets data from the internet.
    """

    def __init__(self, timeout_seconds: float = 15.0):
        self.timeout_seconds = timeout_seconds

    def get_default_url_for_commodity(self, commodity: str = "Wheat") -> str:
        """
        Builds default URL for a requested commodity.
        Example: Wheat -> https://.../Agmarknet/master/Wheat/2017.csv
        """
        # Read from environment if custom URL configured
        env_url = os.getenv("DATA_SOURCE_URL")
        if env_url:
            return env_url

        commodity_clean = commodity.strip().capitalize()
        # Default to 2017 baseline Agmarknet wholesale dataset
        return f"{DEFAULT_AGMARKNET_BASE_URL}/{commodity_clean}/2017.csv"

    async def fetch_source_data(
        self,
        source_url: Optional[str] = None,
        commodity: str = "Wheat",
        limit: Optional[int] = 100,
    ) -> Tuple[List[Dict[str, Any]], str, str]:
        """
        Fetches raw data from external source and returns list of raw dicts.
        """
        target_url = source_url or self.get_default_url_for_commodity(commodity)
        source_name = "agmarknet_open_data"

        logger.info(f"Fetching agricultural market data from source: {target_url}")

        headers = {
            "User-Agent": "CropKart-DataIngestion/1.0",
            "Accept": "application/json, text/csv, text/plain, */*",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.get(target_url, headers=headers)
        except httpx.TimeoutException as exc:
            logger.error(f"Timeout while fetching data from {target_url}: {exc}")
            raise FetchError(f"Data source timed out after {self.timeout_seconds} seconds") from exc
        except httpx.RequestError as exc:
            logger.error(f"Network error while fetching data from {target_url}: {exc}")
            raise FetchError(f"Network error connecting to data source: {str(exc)}") from exc

        if response.status_code != 200:
            logger.error(f"Data source returned HTTP {response.status_code}")
            raise FetchError(f"Data source returned HTTP status {response.status_code}")

        content_text = response.text
        if not content_text or not content_text.strip():
            logger.warning("Data source returned an empty response body")
            return [], source_name, target_url

        # Check whether response is JSON or CSV
        content_type = response.headers.get("content-type", "").lower()
        if "application/json" in content_type or content_text.strip().startswith(("{", "[")):
            raw_records = self._parse_json(content_text)
            source_name = "data_gov_in_api" if "data.gov.in" in target_url else "json_market_api"
        else:
            raw_records = self._parse_csv(content_text, default_commodity=commodity)
            source_name = "agmarknet_csv"

        if limit and limit > 0:
            raw_records = raw_records[:limit]

        logger.info(f"Successfully fetched {len(raw_records)} raw records from {source_name}")
        return raw_records, source_name, target_url

    def _parse_json(self, json_text: str) -> List[Dict[str, Any]]:
        """Parses JSON content into list of dictionaries."""
        try:
            payload = json.loads(json_text)
        except json.JSONDecodeError as exc:
            raise FetchError(f"Failed to parse JSON response: {str(exc)}") from exc

        # Handle data.gov.in response schema: {"records": [...]}
        if isinstance(payload, dict):
            if "records" in payload and isinstance(payload["records"], list):
                return payload["records"]
            if "data" in payload and isinstance(payload["data"], list):
                return payload["data"]
            # Single object wrapped in dict
            return [payload]
        elif isinstance(payload, list):
            return payload

        return []

    def _parse_csv(self, csv_text: str, default_commodity: str = "Wheat") -> List[Dict[str, Any]]:
        """Parses CSV content into list of dictionaries."""
        lines = [line for line in csv_text.splitlines() if line.strip()]
        if not lines:
            return []

        first_line = lines[0]
        # Check if first line is a header
        has_header = any(col.lower() in first_line.lower() for col in ["state", "market", "district", "modal"])

        records: List[Dict[str, Any]] = []
        if has_header:
            reader = csv.DictReader(io.StringIO(csv_text))
            for row in reader:
                if not row.get("commodity") and not row.get("Commodity"):
                    row["commodity"] = default_commodity
                records.append(dict(row))
        else:
            # Agmarknet format without header line
            reader = csv.reader(io.StringIO(csv_text))
            for row in reader:
                if len(row) >= 10:
                    record = {
                        "State Name": row[0],
                        "District Name": row[1],
                        "Market Name": row[2],
                        "Variety": row[3],
                        "Group": row[4],
                        "Arrivals (Tonnes)": row[5],
                        "Min Price (Rs./Quintal)": row[6],
                        "Max Price (Rs./Quintal)": row[7],
                        "Modal Price (Rs./Quintal)": row[8],
                        "Reported Date": row[9],
                        "commodity": default_commodity,
                    }
                    records.append(record)
                elif len(row) > 0:
                    logger.debug(f"Skipping malformed CSV line with {len(row)} columns")

        return records

    async def check_health(self, test_url: Optional[str] = None) -> bool:
        """
        Quick check whether the agricultural data source is reachable.
        """
        url = test_url or self.get_default_url_for_commodity("Wheat")
        headers = {"User-Agent": "CropKart-HealthCheck/1.0"}
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.head(url, headers=headers)
                if response.status_code in (200, 301, 302, 405):
                    return True
                # If HEAD is not supported, try GET with small Range
                response = await client.get(url, headers={**headers, "Range": "bytes=0-100"})
                return response.status_code in (200, 206)
        except Exception as exc:
            logger.warning(f"Data source health check failed for {url}: {exc}")
            return False
