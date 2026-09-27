"""
nominatim.py - OpenStreetMap Nominatim Geocoding Integration Adapter

Communicates strictly with the public Nominatim API.
Follows OpenStreetMap usage policy (custom User-Agent, timeouts, error isolation).
Contains NO CropKart business rules.
"""

import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional
from dotenv import load_dotenv
import httpx

# Load environment variables if not already loaded
_env_backend = Path(__file__).resolve().parent.parent.parent.parent / "backend" / ".env"
if _env_backend.exists():
    load_dotenv(dotenv_path=_env_backend)
load_dotenv()

logger = logging.getLogger(__name__)


class NominatimError(Exception):
    """Base exception for Nominatim integration errors."""
    pass


class NominatimTimeoutError(NominatimError):
    """Raised when Nominatim request exceeds configured timeout."""
    pass


class NominatimConnectionError(NominatimError):
    """Raised when network connection to Nominatim fails."""
    pass


class NominatimServiceError(NominatimError):
    """Raised when Nominatim returns an HTTP error status code."""
    pass


class NominatimAdapter:
    """
    HTTP client adapter for OpenStreetMap Nominatim geocoding service.
    
    Transforms text search queries into geographic coordinate payloads.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        user_agent: Optional[str] = None,
        timeout: Optional[float] = None
    ) -> None:
        self.base_url: str = (
            base_url
            or os.getenv("NOMINATIM_BASE_URL", "https://nominatim.openstreetmap.org")
        ).rstrip("/")
        self.user_agent: str = (
            user_agent
            or os.getenv(
                "NOMINATIM_USER_AGENT",
                "CropKart/1.0 (https://github.com/ayushidarode/CropKart)"
            )
        )
        self.timeout: float = float(
            timeout or os.getenv("NOMINATIM_TIMEOUT", "10.0")
        )

    async def search(self, address: str) -> Optional[Dict[str, Any]]:
        """
        Sends geocoding request to Nominatim API and extracts coordinates.

        Args:
            address: Human-readable location or landmark text.

        Returns:
            Dict with latitude, longitude, and display_name, or None if no match.

        Raises:
            NominatimTimeoutError: When external request times out.
            NominatimConnectionError: When network connection fails.
            NominatimServiceError: When external server returns an HTTP error.
        """
        endpoint = f"{self.base_url}/search"
        params = {
            "q": address,
            "format": "jsonv2",
            "limit": 1,
            "addressdetails": 1,
        }
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(endpoint, params=params, headers=headers)

            if response.status_code != 200:
                logger.warning(
                    f"Nominatim returned non-200 status: {response.status_code}"
                )
                raise NominatimServiceError(
                    f"Nominatim service responded with status {response.status_code}"
                )

            data = response.json()

        except httpx.TimeoutException as exc:
            logger.error(f"Nominatim request timed out: {exc}")
            raise NominatimTimeoutError("Nominatim geocoding request timed out") from exc
        except httpx.RequestError as exc:
            logger.error(f"Nominatim connection error: {exc}")
            raise NominatimConnectionError("Failed to connect to Nominatim service") from exc
        except (ValueError, KeyError) as exc:
            logger.error(f"Failed to parse Nominatim response: {exc}")
            raise NominatimServiceError("Invalid JSON response received from Nominatim") from exc

        if not isinstance(data, list) or len(data) == 0:
            return None

        top_match = data[0]
        try:
            return {
                "latitude": float(top_match["lat"]),
                "longitude": float(top_match["lon"]),
                "display_name": top_match.get("display_name", address),
            }
        except (KeyError, ValueError, TypeError) as exc:
            logger.error(f"Malformed coordinate data in Nominatim match: {exc}")
            raise NominatimServiceError("Malformed coordinate data from Nominatim") from exc
