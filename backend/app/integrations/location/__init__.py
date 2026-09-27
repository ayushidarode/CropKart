"""Location integrations package."""
from .nominatim import (
    NominatimAdapter,
    NominatimConnectionError,
    NominatimError,
    NominatimServiceError,
    NominatimTimeoutError,
)

__all__ = [
    "NominatimAdapter",
    "NominatimError",
    "NominatimTimeoutError",
    "NominatimConnectionError",
    "NominatimServiceError",
]
