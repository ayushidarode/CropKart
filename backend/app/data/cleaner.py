"""
cleaner.py - Agricultural Record Cleaning and Normalization

WHY THIS FILE EXISTS:
Raw government data is messy:
- Extra spaces: "  Wheat  "
- Different capitalizations: "WHEAT", "wheat", "Wheat"
- Dates in many formats: "01 Jan 2017", "2017-01-01", "01/01/2017"
- Prices formatted with commas: "1,725.00"
This file washes the data clean.

WHAT THIS FILE DOES:
1. Strips leading and trailing whitespace.
2. Normalizes grain and location names (Title Case).
3. Parses dates into standard date objects (YYYY-MM-DD).
4. Converts prices and quantities to clean floats.

WHAT GOES IN:
- Validated record dictionaries.

WHAT COMES OUT:
- Cleaned record dictionaries with standardized fields.
"""

from datetime import date, datetime
import logging
import re
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

# Common date formats found in Indian government and Agmarknet data
SUPPORTED_DATE_FORMATS = [
    "%d %b %Y",  # 01 Jan 2017
    "%d %B %Y",  # 01 January 2017
    "%d-%m-%Y",  # 01-01-2017
    "%d/%m/%Y",  # 01/01/2017
    "%Y-%m-%d",  # 2017-01-01
    "%Y/%m/%d",  # 2017/01/01
    "%d-%b-%Y",  # 01-Jan-2017
]


class DataCleaner:
    """
    Cleans, strips, parses, and normalizes agricultural market records.
    """

    @staticmethod
    def clean_string(val: Any) -> str:
        """Strips whitespace and normalizes empty strings."""
        if val is None:
            return ""
        s = str(val).strip()
        # Collapse multiple internal spaces into single space
        return re.sub(r"\s+", " ", s)

    @classmethod
    def clean_name(cls, val: Any) -> str:
        """Normalizes names to Title Case."""
        clean = cls.clean_string(val)
        return clean.title() if clean else ""

    @classmethod
    def parse_float(cls, val: Any) -> Optional[float]:
        """Safely parses float numbers, stripping commas and currency symbols."""
        if val is None:
            return None
        s = str(val).strip().replace(",", "").replace("₹", "").replace("Rs.", "")
        if not s or s.lower() in ("null", "none", "na", "n/a", "-"):
            return None
        try:
            return round(float(s), 2)
        except (ValueError, TypeError):
            return None

    @classmethod
    def parse_date(cls, val: Any) -> date:
        """Parses diverse date formats into a standard date object."""
        if isinstance(val, date):
            return val
        if isinstance(val, datetime):
            return val.date()

        s = cls.clean_string(val)
        for fmt in SUPPORTED_DATE_FORMATS:
            try:
                return datetime.strptime(s, fmt).date()
            except ValueError:
                continue

        # Fallback: try ISO string prefix YYYY-MM-DD
        if len(s) >= 10 and s[:4].isdigit() and s[4] == "-":
            try:
                return datetime.strptime(s[:10], "%Y-%m-%d").date()
            except ValueError:
                pass

        logger.warning(f"Could not parse date '{s}', falling back to today's date")
        return date.today()

    def clean_record(self, raw: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes a single validated record and produces a clean internal dictionary.
        """
        # Helper to extract from various column naming conventions
        def get_field(*keys: str) -> Any:
            for k in keys:
                if k in raw and raw[k] is not None:
                    return raw[k]
                for actual_k, actual_v in raw.items():
                    if actual_k.lower() == k.lower() and actual_v is not None:
                        return actual_v
            return None

        # Clean fields
        state = self.clean_name(get_field("State Name", "state", "state_name"))
        district = self.clean_name(get_field("District Name", "district", "district_name"))
        market = self.clean_name(get_field("Market Name", "market", "market_name", "mandi"))
        commodity = self.clean_name(get_field("commodity", "Commodity", "grain", "crop"))
        variety = self.clean_name(get_field("Variety", "variety")) or "Standard"

        record_date = self.parse_date(
            get_field("Reported Date", "arrival_date", "date", "record_date")
        )

        modal_price = self.parse_float(
            get_field("Modal Price (Rs./Quintal)", "modal_price", "modal")
        )
        min_price = self.parse_float(
            get_field("Min Price (Rs./Quintal)", "min_price", "minimum_price")
        )
        max_price = self.parse_float(
            get_field("Max Price (Rs./Quintal)", "max_price", "maximum_price")
        )
        arrival_quantity = self.parse_float(
            get_field("Arrivals (Tonnes)", "arrival_quantity", "arrivals", "quantity")
        )

        # Fallback price logic: if modal is missing, calculate average of min and max
        if modal_price is None:
            if min_price is not None and max_price is not None:
                modal_price = round((min_price + max_price) / 2.0, 2)
            elif min_price is not None:
                modal_price = min_price
            elif max_price is not None:
                modal_price = max_price

        # If min or max missing, default to modal
        if min_price is None and modal_price is not None:
            min_price = modal_price
        if max_price is None and modal_price is not None:
            max_price = modal_price

        return {
            "commodity": commodity,
            "variety": variety,
            "state": state,
            "district": district,
            "market": market,
            "record_date": record_date,
            "arrival_quantity": arrival_quantity,
            "minimum_price": min_price,
            "maximum_price": max_price,
            "modal_price": modal_price,
        }

    def clean_records(self, valid_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleans a list of validated records."""
        cleaned_list = [self.clean_record(rec) for rec in valid_records]
        logger.info(f"Cleaned {len(cleaned_list)} agricultural records")
        return cleaned_list
