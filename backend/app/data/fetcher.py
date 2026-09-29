"""
fetcher.py - External Agricultural Data Fetcher (CEDA Agmarknet & Open Data)

WHY THIS FILE EXISTS:
Backend needs to retrieve real agricultural market data from external servers.
This file is the communication gateway for external market data sources:
1. CEDA Agmarknet API (Centre for Economic Data and Analysis, Ashoka University)
2. Government / open data Agmarknet fallback

SECURITY & CREDENTIAL INTEGRITY:
- CEDA API token is loaded ONLY from the environment variable `CEDA_API_TOKEN`.
- The token is NEVER logged, formatted into user-visible error strings, or printed.
"""

import asyncio
import csv
import io
import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
from dotenv import load_dotenv
import httpx

logger = logging.getLogger(__name__)

# Ensure backend .env is loaded
_backend_env = Path(__file__).resolve().parent.parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env)
else:
    load_dotenv()

# Base URLs
CEDA_BASE_URL = "https://api.ceda.ashoka.edu.in/v1"
DEFAULT_AGMARKNET_BASE_URL = (
    "https://raw.githubusercontent.com/iancovert/Agmarknet/master"
)


# =====================================================================
# Custom Exceptions
# =====================================================================

class FetchError(Exception):
    """Base exception for all external data fetching failures."""
    pass


class CedaAuthError(FetchError):
    """Raised when CEDA API authentication fails or token is missing."""
    pass


class CedaRateLimitError(FetchError):
    """Raised when CEDA API rate limit (40 requests/hour) is exceeded."""
    def __init__(self, message: str, retry_after: Optional[int] = None):
        super().__init__(message)
        self.retry_after = retry_after


class CedaNetworkError(FetchError):
    """Raised for network or connectivity failures when reaching CEDA API."""
    pass


class CedaApiError(FetchError):
    """Raised when CEDA API returns an unexpected error status or malformed body."""
    pass


# =====================================================================
# CEDA Agmarknet Data Fetcher
# =====================================================================

class CedaDataFetcher:
    """
    Dedicated client for CEDA Agmarknet Data Portal API.
    Interacts with:
    - GET  /agmarknet/commodities
    - GET  /agmarknet/geographies
    - POST /agmarknet/markets
    - POST /agmarknet/prices
    - POST /agmarknet/quantities
    """

    def __init__(
        self,
        base_url: str = CEDA_BASE_URL,
        timeout_seconds: float = 45.0,
        max_retries: int = 3,
    ):
        self.base_url = base_url.rstrip("/")
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries

        # In-memory caches to respect the 40 requests/hour rate limit
        self._commodities_cache: Optional[List[Dict[str, Any]]] = None
        self._commodities_cache_time: float = 0.0
        self._geographies_cache: Optional[List[Dict[str, Any]]] = None
        self._geographies_cache_time: float = 0.0
        self._markets_cache: Dict[str, List[Dict[str, Any]]] = {}

        # Cache TTL: 24 hours for static reference datasets
        self._cache_ttl_seconds: float = 86400.0

    @staticmethod
    def _get_api_token() -> str:
        """
        Reads CEDA API token strictly from environment variable CEDA_API_TOKEN (or CEDA_API_KEY fallback).
        NEVER logs or prints the token value.
        """
        token = os.getenv("CEDA_API_TOKEN", "").strip() or os.getenv("CEDA_API_KEY", "").strip()
        if not token:
            raise CedaAuthError(
                "CEDA_API_TOKEN environment variable is not configured. "
                "Please configure CEDA_API_TOKEN in your backend environment."
            )
        return token

    def _get_auth_headers(self) -> Dict[str, str]:
        """Builds request headers with Bearer token authentication."""
        token = self._get_api_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "CropKart-MarketData/1.0",
        }

    async def _make_request(
        self,
        method: str,
        path: str,
        json_body: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
        timeout_seconds: Optional[float] = None,
        max_retries: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Executes HTTP request to CEDA API with timeout, exponential backoff retries,
        and strict error handling.
        """
        url = f"{self.base_url}/{path.lstrip('/')}"
        headers = self._get_auth_headers()

        req_timeout = timeout_seconds if timeout_seconds is not None else self.timeout_seconds
        req_retries = max_retries if max_retries is not None else self.max_retries

        backoff = 0.5
        last_exception: Optional[Exception] = None

        for attempt in range(1, req_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=req_timeout) as client:
                    if method.upper() == "GET":
                        response = await client.get(url, headers=headers, params=params)
                    elif method.upper() == "POST":
                        response = await client.post(url, headers=headers, json=json_body or {})
                    else:
                        raise ValueError(f"Unsupported HTTP method: {method}")

                # Check HTTP status codes
                status_code = response.status_code

                if status_code == 200:
                    try:
                        return response.json()
                    except json.JSONDecodeError as exc:
                        raise CedaApiError(f"CEDA API returned malformed JSON from {path}") from exc

                elif status_code == 429:
                    retry_after_hdr = response.headers.get("retry-after")
                    retry_after = int(retry_after_hdr) if retry_after_hdr and retry_after_hdr.isdigit() else None
                    msg = (
                        f"CEDA API rate limit reached (40 requests/hour)."
                        + (f" Retry in {retry_after} seconds." if retry_after else " Please retry later.")
                    )
                    logger.warning(msg)
                    raise CedaRateLimitError(msg, retry_after=retry_after)

                elif status_code in (401, 403):
                    logger.error(f"CEDA API authentication failed with HTTP {status_code}")
                    raise CedaAuthError("CEDA API authentication failed. Verify CEDA_API_TOKEN.")

                elif status_code in (500, 502, 503, 504):
                    logger.warning(
                        f"Transient HTTP {status_code} from CEDA API on attempt {attempt}/{self.max_retries}"
                    )
                    if attempt < self.max_retries:
                        await asyncio.sleep(backoff)
                        backoff *= 2.0
                        continue
                    raise CedaApiError(f"CEDA API server error (HTTP {status_code}) after {self.max_retries} attempts")

                else:
                    err_text = response.text[:200]
                    raise CedaApiError(f"CEDA API request to {path} returned HTTP {status_code}: {err_text}")

            except (httpx.TimeoutException, httpx.ConnectError) as net_err:
                last_exception = net_err
                logger.warning(
                    f"CEDA API network error on attempt {attempt}/{self.max_retries}: {net_err.__class__.__name__}"
                )
                if attempt < self.max_retries:
                    await asyncio.sleep(backoff)
                    backoff *= 2.0
                    continue
                raise CedaNetworkError(
                    f"Could not connect to CEDA API after {self.max_retries} attempts: {str(net_err)}"
                ) from net_err

        if last_exception:
            raise CedaNetworkError(f"CEDA request failed: {str(last_exception)}") from last_exception
        raise CedaApiError("CEDA request failed with unhandled state")

    async def get_commodities(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Retrieves list of agricultural commodities from CEDA.
        Caches in-memory to conserve API rate limits.
        """
        now = time.time()
        if (
            not force_refresh
            and self._commodities_cache is not None
            and (now - self._commodities_cache_time) < self._cache_ttl_seconds
        ):
            return self._commodities_cache

        data = await self._make_request("GET", "/agmarknet/commodities")
        output = data.get("output", {})
        commodities = output.get("data", []) if isinstance(output, dict) else []

        self._commodities_cache = commodities
        self._commodities_cache_time = now
        logger.info(f"Retrieved and cached {len(commodities)} commodities from CEDA")
        return commodities

    async def get_geographies(self, force_refresh: bool = False) -> List[Dict[str, Any]]:
        """
        Retrieves states and districts geography mapping from CEDA.
        Caches in-memory to conserve API rate limits.
        """
        now = time.time()
        if (
            not force_refresh
            and self._geographies_cache is not None
            and (now - self._geographies_cache_time) < self._cache_ttl_seconds
        ):
            return self._geographies_cache

        data = await self._make_request("GET", "/agmarknet/geographies")
        output = data.get("output", {})
        geographies = output.get("data", []) if isinstance(output, dict) else []

        self._geographies_cache = geographies
        self._geographies_cache_time = now
        logger.info(f"Retrieved and cached {len(geographies)} geographies from CEDA")
        return geographies

    async def get_markets(
        self,
        commodity_id: int,
        state_id: int,
        district_id: Optional[int] = None,
        indicator: str = "price",
    ) -> List[Dict[str, Any]]:
        """
        Retrieves list of markets / mandis for a commodity and geography.
        """
        cache_key = f"{commodity_id}:{state_id}:{district_id}:{indicator}"
        if cache_key in self._markets_cache:
            return self._markets_cache[cache_key]

        payload: Dict[str, Any] = {
            "indicator": indicator,
            "commodity_id": commodity_id,
            "state_id": state_id,
        }
        if district_id is not None:
            payload["district_id"] = district_id

        data = await self._make_request("POST", "/agmarknet/markets", json_body=payload)
        output = data.get("output", {})
        markets = output.get("data", []) if isinstance(output, dict) else []

        self._markets_cache[cache_key] = markets
        logger.info(
            f"Retrieved {len(markets)} markets from CEDA for commodity {commodity_id}, state {state_id}"
        )
        return markets

    async def get_prices(
        self,
        commodity_id: int,
        state_id: int,
        from_date: str,
        to_date: str,
        district_id: Optional[int] = None,
        market_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves wholesale price records from CEDA for given filters.
        """
        payload: Dict[str, Any] = {
            "commodity_id": commodity_id,
            "state_id": state_id,
            "from_date": from_date,
            "to_date": to_date,
        }
        if district_id is not None:
            payload["district_id"] = [district_id] if isinstance(district_id, (int, str)) else district_id
        if market_id is not None:
            payload["market_id"] = [market_id] if isinstance(market_id, (int, str)) else market_id

        data = await self._make_request("POST", "/agmarknet/prices", json_body=payload)
        output = data.get("output", {})
        return output.get("data", []) if isinstance(output, dict) else []

    async def get_quantities(
        self,
        commodity_id: int,
        state_id: int,
        from_date: str,
        to_date: str,
        district_id: Optional[int] = None,
        market_id: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        """
        Retrieves arrival quantity records from CEDA for given filters.
        """
        payload: Dict[str, Any] = {
            "commodity_id": commodity_id,
            "state_id": state_id,
            "from_date": from_date,
            "to_date": to_date,
        }
        if district_id is not None:
            payload["district_id"] = [district_id] if isinstance(district_id, (int, str)) else district_id
        if market_id is not None:
            payload["market_id"] = [market_id] if isinstance(market_id, (int, str)) else market_id

        data = await self._make_request(
            "POST",
            "/agmarknet/quantities",
            json_body=payload,
            timeout_seconds=12.0,
            max_retries=1,
        )
        output = data.get("output", {})
        return output.get("data", []) if isinstance(output, dict) else []

    async def resolve_commodity_id(self, commodity_name: str) -> Tuple[int, str]:
        """
        Resolves a commodity name string (e.g. 'Wheat', 'Rice') to CEDA commodity_id and canonical name.
        """
        commodities = await self.get_commodities()
        target = commodity_name.strip().lower()

        # Exact match
        for c in commodities:
            c_name = c.get("commodity_name", "")
            if c_name.lower() == target:
                return int(c["commodity_id"]), c_name

        # Starts with or contains match
        for c in commodities:
            c_name = c.get("commodity_name", "")
            if target in c_name.lower():
                return int(c["commodity_id"]), c_name

        # Default fallback to Wheat (ID 1)
        return 1, "Wheat"

    async def resolve_geography(
        self, state_name: Optional[str] = None, district_name: Optional[str] = None
    ) -> Tuple[int, str, Optional[int], Optional[str]]:
        """
        Resolves state and district names to CEDA census IDs and canonical names.
        """
        geos = await self.get_geographies()

        target_state = (state_name or "").strip().lower()
        target_dist = (district_name or "").strip().lower()

        matched_state_id = None
        matched_state_name = None
        matched_dist_id = None
        matched_dist_name = None

        if target_state:
            for g in geos:
                s_name = g.get("census_state_name", "")
                if target_state in s_name.lower():
                    matched_state_id = int(g["census_state_id"])
                    matched_state_name = s_name
                    break

        if matched_state_id is not None and target_dist:
            for g in geos:
                if int(g["census_state_id"]) == matched_state_id:
                    d_name = g.get("census_district_name", "")
                    if target_dist in d_name.lower():
                        matched_dist_id = int(g["census_district_id"])
                        matched_dist_name = d_name
                        break

        # Defaults if not matched: Punjab (ID 3), Gurdaspur (ID 35)
        if matched_state_id is None:
            matched_state_id = 3
            matched_state_name = "Punjab"
        if matched_dist_id is None and target_dist:
            matched_dist_id = 35
            matched_dist_name = "Gurdaspur"

        return matched_state_id, matched_state_name, matched_dist_id, matched_dist_name

    async def fetch_market_records(
        self,
        commodity: str = "Wheat",
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        limit: Optional[int] = 100,
    ) -> Tuple[List[Dict[str, Any]], str, str]:
        """
        Full high-level fetch flow:
        1. Resolves commodity and geography IDs.
        2. Retrieves prices and quantities from CEDA.
        3. Merges prices with arrival quantities.
        4. Enriches with human-readable state, district, market, commodity names.
        5. Preserves source metadata and returns raw records.
        """
        source_name = "ceda_agmarknet_api"
        source_url = self.base_url

        # 1. Resolve IDs
        commodity_id, canonical_crop = await self.resolve_commodity_id(commodity)
        state_id, state_name, district_id, district_name = await self.resolve_geography(state, district)

        # 2. Date range defaults (Wheat active window if unspecified)
        start_dt = from_date or "2018-04-01"
        end_dt = to_date or "2018-04-30"

        # 3. Market resolution if specified
        market_id = None
        canonical_market = market
        market_map: Dict[int, str] = {}
        if district_id is not None:
            markets = await self.get_markets(
                commodity_id=commodity_id,
                state_id=state_id,
                district_id=district_id,
                indicator="price",
            )
            for m in markets:
                if "market_id" in m and "market_name" in m:
                    market_map[int(m["market_id"])] = m["market_name"]

            if market:
                for m in markets:
                    m_name = m.get("market_name", "")
                    if market.lower() in m_name.lower():
                        market_id = int(m["market_id"])
                        canonical_market = m_name
                        break
            elif markets:
                # Query all available mandis in the district
                market_id = [int(m["market_id"]) for m in markets]
                canonical_market = markets[0]["market_name"]

        # 4. Fetch price records
        price_items = await self.get_prices(
            commodity_id=commodity_id,
            state_id=state_id,
            from_date=start_dt,
            to_date=end_dt,
            district_id=district_id,
            market_id=market_id,
        )

        # 5. Fetch quantity records
        try:
            quantity_items = await self.get_quantities(
                commodity_id=commodity_id,
                state_id=state_id,
                from_date=start_dt,
                to_date=end_dt,
                district_id=district_id,
                market_id=market_id,
            )
        except Exception as q_exc:
            logger.warning(f"Could not retrieve quantities from CEDA: {q_exc}")
            quantity_items = []

        # Map quantities by (date, market_id, district_id)
        qty_map: Dict[Tuple[str, Optional[int], Optional[int]], float] = {}
        for q in quantity_items:
            q_date = str(q.get("date", ""))[:10]
            q_mkt = q.get("market_id")
            q_dst = q.get("census_district_id")
            q_val = q.get("quantity")
            if q_val is not None:
                qty_map[(q_date, q_mkt, q_dst)] = float(q_val)

        # 6. Build combined market records
        records: List[Dict[str, Any]] = []
        for p in price_items:
            p_date_raw = str(p.get("date", ""))
            p_date_key = p_date_raw[:10]
            p_mkt = p.get("market_id")
            p_dst = p.get("census_district_id", district_id)

            qty = qty_map.get((p_date_key, p_mkt, p_dst))
            if qty is None:
                qty = qty_map.get((p_date_key, None, None))

            actual_mkt_name = (
                market_map.get(int(p_mkt)) if p_mkt is not None and int(p_mkt) in market_map else None
            ) or canonical_market or "Central Mandi"

            record = {
                "commodity": canonical_crop,
                "state": state_name,
                "district": district_name or "General",
                "market": actual_mkt_name,
                "record_date": p_date_raw,
                "minimum_price": p.get("min_price"),
                "maximum_price": p.get("max_price"),
                "modal_price": p.get("modal_price"),
                "arrival_quantity": qty,
                "variety": "Standard",
                "source_id_code": f"ceda_{commodity_id}_{state_id}_{p_mkt}_{p_date_key}",
            }
            records.append(record)

        if limit and limit > 0:
            records = records[:limit]

        logger.info(
            f"Successfully prepared {len(records)} CEDA market records for {canonical_crop}"
        )
        return records, source_name, source_url

    async def check_health(self) -> bool:
        """Verifies whether CEDA API is reachable using configured credentials."""
        try:
            commodities = await self.get_commodities()
            return len(commodities) > 0
        except Exception as exc:
            logger.warning(f"CEDA API health check failed: {exc}")
            return False


# =====================================================================
# General Data Fetcher (Coordinates CEDA and CSV Open Data)
# =====================================================================

class DataFetcher:
    """
    HTTP fetcher for agricultural market data.
    Automatically prioritizes CEDA Agmarknet API when CEDA_API_TOKEN is available,
    with seamless fallback to Agmarknet open data CSV when requested or token is missing.
    """

    def __init__(self, timeout_seconds: float = 45.0):
        self.timeout_seconds = timeout_seconds
        self.ceda_fetcher = CedaDataFetcher(timeout_seconds=timeout_seconds)

    def get_default_url_for_commodity(self, commodity: str = "Wheat") -> str:
        """Builds default Agmarknet CSV open data URL."""
        env_url = os.getenv("DATA_SOURCE_URL")
        if env_url:
            return env_url
        commodity_clean = commodity.strip().capitalize()
        return f"{DEFAULT_AGMARKNET_BASE_URL}/{commodity_clean}/2017.csv"

    async def fetch_source_data(
        self,
        source_url: Optional[str] = None,
        commodity: str = "Wheat",
        limit: Optional[int] = 100,
        source: Optional[str] = "ceda",
        state: Optional[str] = None,
        district: Optional[str] = None,
        market: Optional[str] = None,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], str, str]:
        """
        Fetches agricultural records from CEDA API (if token present and not forced to CSV),
        or falls back to CSV open data.
        """
        has_ceda_token = bool(
            os.getenv("CEDA_API_TOKEN", "").strip() or os.getenv("CEDA_API_KEY", "").strip()
        )
        use_ceda = (source == "ceda" or not source_url) and has_ceda_token

        if use_ceda:
            try:
                return await self.ceda_fetcher.fetch_market_records(
                    commodity=commodity,
                    state=state,
                    district=district,
                    market=market,
                    from_date=from_date,
                    to_date=to_date,
                    limit=limit,
                )
            except CedaRateLimitError:
                raise
            except (CedaAuthError, CedaNetworkError, CedaApiError) as ceda_err:
                logger.warning(
                    f"CEDA fetch encountered {ceda_err.__class__.__name__}: {ceda_err}. "
                    "Falling back to open data stream."
                )

        # Fallback to CSV / Open Data
        target_url = source_url or self.get_default_url_for_commodity(commodity)
        source_name = "agmarknet_open_data"

        logger.info(f"Fetching agricultural market data from open data source: {target_url}")

        headers = {
            "User-Agent": "CropKart-DataIngestion/1.0",
            "Accept": "application/json, text/csv, text/plain, */*",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.get(target_url, headers=headers)
        except httpx.TimeoutException as exc:
            raise FetchError(f"Data source timed out after {self.timeout_seconds} seconds") from exc
        except httpx.RequestError as exc:
            raise FetchError(f"Network error connecting to data source: {str(exc)}") from exc

        if response.status_code != 200:
            raise FetchError(f"Data source returned HTTP status {response.status_code}")

        content_text = response.text
        if not content_text or not content_text.strip():
            return [], source_name, target_url

        content_type = response.headers.get("content-type", "").lower()
        if "application/json" in content_type or content_text.strip().startswith(("{", "[")):
            raw_records = self._parse_json(content_text)
            source_name = "json_market_api"
        else:
            raw_records = self._parse_csv(content_text, default_commodity=commodity)
            source_name = "agmarknet_csv"

        if limit and limit > 0:
            raw_records = raw_records[:limit]

        return raw_records, source_name, target_url

    def _parse_json(self, json_text: str) -> List[Dict[str, Any]]:
        """Parses JSON content into list of dictionaries."""
        try:
            payload = json.loads(json_text)
        except json.JSONDecodeError as exc:
            raise FetchError(f"Failed to parse JSON response: {str(exc)}") from exc

        if isinstance(payload, dict):
            if "records" in payload and isinstance(payload["records"], list):
                return payload["records"]
            if "data" in payload and isinstance(payload["data"], list):
                return payload["data"]
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
        has_header = any(col.lower() in first_line.lower() for col in ["state", "market", "district", "modal"])

        records: List[Dict[str, Any]] = []
        if has_header:
            reader = csv.DictReader(io.StringIO(csv_text))
            for row in reader:
                if not row.get("commodity") and not row.get("Commodity"):
                    row["commodity"] = default_commodity
                records.append(dict(row))
        else:
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
        return records

    async def check_health(self, test_url: Optional[str] = None) -> bool:
        """Verifies health of configured agricultural data source."""
        if bool(os.getenv("CEDA_API_TOKEN", "").strip() or os.getenv("CEDA_API_KEY", "").strip()):
            return await self.ceda_fetcher.check_health()

        url = test_url or self.get_default_url_for_commodity("Wheat")
        headers = {"User-Agent": "CropKart-HealthCheck/1.0"}
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.head(url, headers=headers)
                return response.status_code in (200, 301, 302, 405)
        except Exception:
            return False
