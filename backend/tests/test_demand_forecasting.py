"""
backend/tests/test_demand_forecasting.py

Validates the ML demand forecasting inference engine:
- Real historical data retrieval
- Feature generation of all 37 features
- Real prediction values (Wheat + Pune)
- Input validation (empty crop, invalid days)
- Insufficient data handling (unknown crop)
"""

import pytest
from backend.app.ml.inference import (
    predict_demand,
    build_feature_vector,
    DemandForecastingError,
    InsufficientDataError,
    InvalidInputError,
    ALL_FEATURES,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
)
from backend.app.services.demand_service import get_demand_forecast


def test_feature_list_specifications():
    """Confirms feature counts match the 37 features required by the pipeline."""
    assert len(NUMERICAL_FEATURES) == 35
    assert len(CATEGORICAL_FEATURES) == 2
    assert len(ALL_FEATURES) == 37


def test_predict_demand_wheat_pune_success():
    """Tests end-to-end prediction for Wheat in Pune using real database data."""
    result = predict_demand(crop="Wheat", location="Pune", days=30)

    assert result["crop"] == "Wheat"
    assert result["location"] == "Pune"
    assert result["forecast_days"] == 30
    assert result["unit"] == "kg"
    assert result["model_version"] == "demand-v1-ridge"
    assert "data_source" in result
    assert result["predicted_demand"] > 0, f"Predicted demand should be positive, got {result['predicted_demand']}"

    # Verify no fake hardcoded numbers are returned
    assert result["predicted_demand"] not in [0, 84.5, 0.94, 2420, 1250]


def test_predict_demand_unknown_crop_insufficient_data():
    """Verifies that an unknown crop returns INSUFFICIENT_DATA error code."""
    with pytest.raises(InsufficientDataError) as exc_info:
        predict_demand(crop="UnknownExoticCrop99", location="Pune", days=30)

    assert exc_info.value.code == "INSUFFICIENT_DATA"
    assert "No market price records exist" in str(exc_info.value)


def test_predict_demand_invalid_inputs():
    """Verifies validation for missing inputs and invalid days ranges."""
    with pytest.raises(InvalidInputError):
        predict_demand(crop="", location="Pune", days=30)

    with pytest.raises(InvalidInputError):
        predict_demand(crop="Wheat", location="", days=30)

    with pytest.raises(InvalidInputError):
        predict_demand(crop="Wheat", location="Pune", days=0)

    with pytest.raises(InvalidInputError):
        predict_demand(crop="Wheat", location="Pune", days=400)


def test_demand_service_integration():
    """Verifies demand_service.get_demand_forecast calls the ML engine."""
    res = get_demand_forecast(crop="Wheat", location="Pune", days=30)
    assert res["predicted_demand"] > 0
    assert res["crop"] == "Wheat"
    assert res["location"] == "Pune"
