"""
backend/app/services/demand_service.py

Demand forecasting service for CropKart.
Bridges API endpoints and the ML inference engine:
FastAPI Route -> Demand Service -> ML Inference -> Supabase Database
"""

import logging
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

try:
    from backend.app.ml.inference import (
        predict_demand,
        DemandForecastingError,
        ModelUnavailableError,
        InsufficientDataError,
        InvalidInputError,
        DatabaseError,
    )
except ImportError:
    try:
        from app.ml.inference import (
            predict_demand,
            DemandForecastingError,
            ModelUnavailableError,
            InsufficientDataError,
            InvalidInputError,
            DatabaseError,
        )
    except ImportError:
        from ml.inference import (
            predict_demand,
            DemandForecastingError,
            ModelUnavailableError,
            InsufficientDataError,
            InvalidInputError,
            DatabaseError,
        )

logger = logging.getLogger(__name__)


def get_demand_forecast(
    crop: str,
    location: str,
    days: int = 30,
    db: Optional[Session] = None,
) -> Dict[str, Any]:
    """
    Generates a machine learning demand forecast for the specified crop, location, and horizon.
    Calls the 37-feature Ridge pipeline with real market and demand history from Supabase.
    """
    crop = (crop or "").strip()
    location = (location or "").strip()

    if not crop:
        raise InvalidInputError("Crop name is required.", code="INVALID_INPUT")

    if not location:
        raise InvalidInputError("Location is required.", code="INVALID_INPUT")

    if days < 1 or days > 365:
        raise InvalidInputError("Forecast days must be between 1 and 365.", code="INVALID_INPUT")

    logger.info(
        "Demand forecast requested: crop=%s location=%s days=%s",
        crop,
        location,
        days,
    )

    try:
        result = predict_demand(
            crop=crop,
            location=location,
            days=days,
            db=db,
        )
        return result

    except DemandForecastingError as exc:
        logger.warning(
            "Demand forecasting error [%s] for crop=%s location=%s: %s",
            exc.code,
            crop,
            location,
            exc,
        )
        raise
    except Exception as exc:
        logger.error(
            "Unexpected error in demand service: %s",
            exc,
            exc_info=True,
        )
        raise DemandForecastingError(
            f"Demand service failure: {str(exc)}",
            code="PREDICTION_ERROR",
        ) from exc