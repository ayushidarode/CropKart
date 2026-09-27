"""
location.py - FastAPI Location Router

Exposes endpoints for geocoding and location-based operations.
Delegates business logic to LocationService and returns validated Pydantic responses.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

try:
    from app.schemas import GeocodeRequest, GeocodeResponse
    from app.services.location_service import (
        LocationService,
        LocationServiceError,
        LocationServiceUnavailableError,
        location_service,
    )
except ImportError:
    from schemas import GeocodeRequest, GeocodeResponse
    from services.location_service import (
        LocationService,
        LocationServiceError,
        LocationServiceUnavailableError,
        location_service,
    )

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/location",
    tags=["Location Services"]
)


def get_location_service() -> LocationService:
    """Dependency provider for LocationService."""
    return location_service


@router.post(
    "/geocode",
    response_model=GeocodeResponse,
    status_code=status.HTTP_200_OK,
    summary="Geocode address to geographic coordinates",
    description="Converts a human-readable address into latitude and longitude coordinates using OpenStreetMap Nominatim."
)
async def geocode(
    request: GeocodeRequest,
    service: LocationService = Depends(get_location_service),
) -> GeocodeResponse:
    """
    Geocode a human-readable address.

    - **address**: Text address or landmark name (e.g., 'Nagpur, Maharashtra')
    - Returns coordinates (latitude, longitude) and resolved display name.
    """
    try:
        result = await service.geocode_address(request.address)
        return GeocodeResponse(
            success=result["success"],
            address=result["address"],
            latitude=result["latitude"],
            longitude=result["longitude"],
            display_name=result["display_name"],
            message=result["message"],
        )
    except LocationServiceUnavailableError as exc:
        logger.warning(f"Geocoding service unavailable: {exc}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc)
        )
    except LocationServiceError as exc:
        logger.error(f"Geocoding service error: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to resolve address due to an internal service error."
        )
    except Exception as exc:
        logger.error(f"Unexpected error in geocode endpoint: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing the location request."
        )
