"""
validator.py - Agricultural Record Validation

WHY THIS FILE EXISTS:
Not all records from government sources are good:
- Missing market, state, district, commodity, or date fields.
- Placeholder strings ("N/A", "null", "-", "?").
- Corrupted prices (negative, zero, non-numeric, or min > max).
- Out-of-range dates (unparseable, year < 1990 or future).
This file validates every record against business constraints before cleaning.

WHAT THIS FILE DOES:
1. Checks that required fields exist and are not empty placeholders.
2. Validates commodity, state, district, and market naming.
3. Verifies date validity and realistic year range.
4. Verifies price and arrival quantity values are numeric and physically plausible.
5. Safely skips invalid records and logs descriptive reasons.

WHAT GOES IN:
- List of raw record dictionaries.

WHAT COMES OUT:
- Tuple: (valid_records, skipped_records, reasons)
"""

from datetime import date, datetime
import logging
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

INVALID_PLACEHOLDERS = {
    "n/a", "na", "null", "none", "-", "--", "?", "unknown", "undefined", ""
}

SUPPORTED_DATE_FORMATS = [
    "%d %b %Y",
    "%d %B %Y",
    "%d-%m-%Y",
    "%d/%m/%Y",
    "%Y-%m-%d",
    "%Y/%m/%d",
    "%d-%b-%Y",
    "%Y-%m-%dT%H:%M:%S",
    "%Y-%m-%d %H:%M:%S",
]


class DataValidator:
    """
    Validates raw agricultural market records against business constraints.
    """

    @staticmethod
    def _extract_field(record: Dict[str, Any], *candidate_keys: str) -> Any:
        """Finds non-placeholder field value across possible column key variations."""
        for key in candidate_keys:
            if key in record and record[key] is not None:
                val = record[key]
                if isinstance(val, str):
                    clean_str = val.strip()
                    if not clean_str or clean_str.lower() in INVALID_PLACEHOLDERS:
                        continue
                    return clean_str
                return val

            # Also try case-insensitive key search
            for k, v in record.items():
                if k.lower() == key.lower() and v is not None:
                    if isinstance(v, str):
                        clean_str = v.strip()
                        if not clean_str or clean_str.lower() in INVALID_PLACEHOLDERS:
                            continue
                        return clean_str
                    return v
        return None

    @staticmethod
    def _validate_and_parse_date(val: Any) -> Optional[date]:
        """Attempts to parse date and verify validity."""
        if val is None:
            return None
        if isinstance(val, date) and not isinstance(val, datetime):
            return val
        if isinstance(val, datetime):
            return val.date()

        s = str(val).strip()
        for fmt in SUPPORTED_DATE_FORMATS:
            try:
                return datetime.strptime(s, fmt).date()
            except ValueError:
                continue

        # Try ISO prefix YYYY-MM-DD
        if len(s) >= 10 and s[:4].isdigit() and s[4] == "-":
            try:
                return datetime.strptime(s[:10], "%Y-%m-%d").date()
            except ValueError:
                pass

        return None

    def validate_record(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validates a single raw agricultural record.
        Returns (is_valid: bool, reason: str).
        """
        if not isinstance(record, dict):
            return False, "Record is not a dictionary"

        # 1. State
        state = self._extract_field(record, "State Name", "state", "state_name", "census_state_name")
        if not state:
            return False, "Missing required field: state"
        s_str = str(state).strip()
        if len(s_str) < 2 or s_str.isdigit():
            return False, f"Invalid state name: '{s_str}'"

        # 2. District
        district = self._extract_field(record, "District Name", "district", "district_name", "census_district_name")
        if not district:
            return False, "Missing required field: district"
        d_str = str(district).strip()
        if len(d_str) < 2 or d_str.isdigit():
            return False, f"Invalid district name: '{d_str}'"

        # 3. Market
        market = self._extract_field(record, "Market Name", "market", "market_name", "mandi")
        if not market:
            return False, "Missing required field: market"
        m_str = str(market).strip()
        if len(m_str) < 2 or m_str.isdigit():
            return False, f"Invalid market name: '{m_str}'"

        # 4. Commodity / Grain
        commodity = self._extract_field(record, "commodity", "Commodity", "grain", "crop", "commodity_name")
        if not commodity:
            return False, "Missing required field: commodity"
        c_str = str(commodity).strip()
        if len(c_str) < 2 or c_str.isdigit():
            return False, f"Invalid commodity name: '{c_str}'"

        # 5. Date
        raw_date = self._extract_field(record, "Reported Date", "arrival_date", "date", "record_date")
        if not raw_date:
            return False, "Missing required field: date"

        parsed_date = self._validate_and_parse_date(raw_date)
        if parsed_date is None:
            return False, f"Invalid date value or format: '{raw_date}'"
        current_year = datetime.now().year
        if parsed_date.year < 1990 or parsed_date.year > (current_year + 1):
            return False, f"Date out of valid range (1990-{current_year + 1}): {parsed_date}"

        # 6. Price verification (at least one valid positive price: modal, min, or max)
        raw_modal = self._extract_field(record, "Modal Price (Rs./Quintal)", "modal_price", "modal")
        raw_min = self._extract_field(record, "Min Price (Rs./Quintal)", "min_price", "minimum_price")
        raw_max = self._extract_field(record, "Max Price (Rs./Quintal)", "max_price", "maximum_price")

        prices = [("modal_price", raw_modal), ("min_price", raw_min), ("max_price", raw_max)]
        parsed_prices: Dict[str, float] = {}

        for p_name, p_val in prices:
            if p_val is not None:
                try:
                    num = float(str(p_val).replace(",", "").replace("₹", "").replace("Rs.", "").strip())
                    if num <= 0:
                        return False, f"Non-positive price for {p_name}: {num}"
                    if num > 1000000:
                        return False, f"Unreasonably high price for {p_name}: {num}"
                    parsed_prices[p_name] = num
                except (ValueError, TypeError):
                    continue

        if not parsed_prices:
            return False, "No valid positive price found (modal, min, or max)"

        # Check min_price <= max_price if both are provided
        if "min_price" in parsed_prices and "max_price" in parsed_prices:
            if parsed_prices["min_price"] > parsed_prices["max_price"]:
                return False, f"Min price ({parsed_prices['min_price']}) cannot exceed max price ({parsed_prices['max_price']})"

        # 7. Quantity verification (if present, must be non-negative and plausible)
        raw_quantity = self._extract_field(record, "Arrivals (Tonnes)", "arrival_quantity", "arrivals", "quantity")
        if raw_quantity is not None:
            try:
                q_val = float(str(raw_quantity).replace(",", "").strip())
                if q_val < 0:
                    return False, f"Negative arrival quantity: {q_val}"
                if q_val > 1000000:
                    return False, f"Unreasonably high arrival quantity: {q_val}"
            except (ValueError, TypeError):
                # Ignore non-parseable quantity rather than rejecting whole record if prices exist
                pass

        return True, "Valid"

    def validate_records(
        self, raw_records: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[str]]:
        """
        Filters a list of raw records into valid and skipped lists.
        """
        valid_records: List[Dict[str, Any]] = []
        skipped_records: List[Dict[str, Any]] = []
        reasons: List[str] = []

        for index, record in enumerate(raw_records):
            is_valid, reason = self.validate_record(record)
            if is_valid:
                valid_records.append(record)
            else:
                skipped_records.append(record)
                reasons.append(f"Row {index}: {reason}")
                logger.debug(f"Skipping record {index}: {reason}")

        logger.info(
            f"Validation finished: {len(valid_records)} valid records, "
            f"{len(skipped_records)} skipped records"
        )
        return valid_records, skipped_records, reasons
