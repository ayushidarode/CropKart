"""
validator.py - Agricultural Record Validation

WHY THIS FILE EXISTS:
Not all records from government sources are good.
Some records have empty market names.
Some records have broken prices like "N/A" or negative numbers.
Some records have unreadable dates.
This file is the bouncer. It lets good records in and keeps junk out.

WHAT THIS FILE DOES:
1. Checks that required fields exist (state, district, market, commodity, date).
2. Verifies price and quantity values are numeric and sensible.
3. Does not crash when a record is bad; safely skips it and logs why.

WHAT GOES IN:
- List of raw record dictionaries.

WHAT COMES OUT:
- Tuple: (valid_records, skipped_records, reasons)
"""

import logging
from typing import Any, Dict, List, Tuple

logger = logging.getLogger(__name__)


class DataValidator:
    """
    Validates raw agricultural market records against business constraints.
    """

    @staticmethod
    def _extract_field(record: Dict[str, Any], *candidate_keys: str) -> Any:
        """Finds field value across possible column key variations."""
        for key in candidate_keys:
            if key in record and record[key] is not None:
                val = record[key]
                if isinstance(val, str) and not val.strip():
                    continue
                return val
            # Also try lowercased comparison
            for k, v in record.items():
                if k.lower() == key.lower() and v is not None:
                    if isinstance(v, str) and not v.strip():
                        continue
                    return v
        return None

    def validate_record(self, record: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validates a single raw record.
        Returns (is_valid: bool, reason: str).
        """
        if not isinstance(record, dict):
            return False, "Record is not a dictionary"

        # 1. State
        state = self._extract_field(record, "State Name", "state", "state_name")
        if not state:
            return False, "Missing required field: state"

        # 2. District
        district = self._extract_field(record, "District Name", "district", "district_name")
        if not district:
            return False, "Missing required field: district"

        # 3. Market
        market = self._extract_field(record, "Market Name", "market", "market_name", "mandi")
        if not market:
            return False, "Missing required field: market"

        # 4. Commodity / Grain
        commodity = self._extract_field(record, "commodity", "Commodity", "grain", "crop")
        if not commodity:
            return False, "Missing required field: commodity"

        # 5. Date
        raw_date = self._extract_field(record, "Reported Date", "arrival_date", "date", "record_date")
        if not raw_date:
            return False, "Missing required field: date"

        # 6. Price verification (at least one valid price: modal, min, or max)
        raw_modal = self._extract_field(record, "Modal Price (Rs./Quintal)", "modal_price", "modal")
        raw_min = self._extract_field(record, "Min Price (Rs./Quintal)", "min_price", "minimum_price")
        raw_max = self._extract_field(record, "Max Price (Rs./Quintal)", "max_price", "maximum_price")

        prices = [raw_modal, raw_min, raw_max]
        has_any_price = False
        for p in prices:
            if p is not None:
                try:
                    p_val = float(str(p).replace(",", "").strip())
                    if p_val > 0:
                        has_any_price = True
                        break
                except (ValueError, TypeError):
                    continue

        if not has_any_price:
            return False, "No valid positive price found (modal, min, or max)"

        # 7. Quantity verification (if present, must be non-negative)
        raw_quantity = self._extract_field(record, "Arrivals (Tonnes)", "arrival_quantity", "arrivals", "quantity")
        if raw_quantity is not None:
            try:
                q_val = float(str(raw_quantity).replace(",", "").strip())
                if q_val < 0:
                    return False, f"Negative arrival quantity: {q_val}"
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
