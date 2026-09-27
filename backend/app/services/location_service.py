"""
location_service.py - Location Business Logic Layer for CropKart

Coordinates location queries, normalizes input, and delegates geocoding
to external adapters (e.g. Nominatim).
Keeps business logic separate from raw HTTP requests and routing.
"""

import logging
from typing import Any, Dict, Optional

try:
    from app.integrations.location.nominatim import (
        NominatimAdapter,
        NominatimConnectionError,
        NominatimError,
        NominatimServiceError,
        NominatimTimeoutError,
    )
except ImportError:
    from integrations.location.nominatim import (
        NominatimAdapter,
        NominatimConnectionError,
        NominatimError,
        NominatimServiceError,
        NominatimTimeoutError,
    )

logger = logging.getLogger(__name__)


class LocationServiceError(Exception):
    """Base exception for location service operations."""
    pass


class LocationServiceUnavailableError(LocationServiceError):
    """Raised when external geocoding provider is unreachable or times out."""
    pass


class LocationService:
    """
    Business service for managing CropKart location and geocoding operations.
    """

    def __init__(self, adapter: Optional[NominatimAdapter] = None) -> None:
        self.adapter: NominatimAdapter = adapter or NominatimAdapter()

    async def geocode_address(self, address: str) -> Dict[str, Any]:
        """
        Geocodes a human-readable address into geographic coordinates.

        Args:
            address: Human-readable location text.

        Returns:
            Dict containing success flag, coordinates, display name, and message.

        Raises:
            LocationServiceUnavailableError: If external provider fails or times out.
            LocationServiceError: For unexpected service errors.
        """
        cleaned_address = address.strip()

        try:
            result = await self.adapter.search(cleaned_address)
        except (NominatimTimeoutError, NominatimConnectionError) as exc:
            logger.error(f"Geocoding service unavailable for '{cleaned_address}': {exc}")
            raise LocationServiceUnavailableError(
                "Location service is temporarily unavailable. Please try again later."
            ) from exc
        except NominatimServiceError as exc:
            logger.error(f"Geocoding service failure for '{cleaned_address}': {exc}")
            raise LocationServiceUnavailableError(
                "Location service error occurred while resolving address."
            ) from exc
        except Exception as exc:
            logger.error(f"Unexpected error in location service: {exc}", exc_info=True)
            raise LocationServiceError("An unexpected error occurred in location service.") from exc

        if not result:
            return {
                "success": False,
                "address": cleaned_address,
                "latitude": None,
                "longitude": None,
                "display_name": None,
                "message": "Location not found",
            }

        return {
            "success": True,
            "address": cleaned_address,
            "latitude": result["latitude"],
            "longitude": result["longitude"],
            "display_name": result["display_name"],
            "message": None,
        }


# Singleton instance for simple dependency reuse
location_service = LocationService()
