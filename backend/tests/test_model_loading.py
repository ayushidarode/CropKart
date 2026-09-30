"""
backend/tests/test_model_loading.py

Validates model loading safety, corruption detection, and pipeline architecture:
- demand_forecasting_model (1).joblib -> VALID Ridge pipeline with 37 features
- best_demand_forecasting_model.joblib -> CORRUPTED binary stream (documented as unusable)
"""

import pytest
import joblib
from pathlib import Path

MODELS_DIR = Path(__file__).resolve().parent.parent / "app" / "ml" / "models"


def test_primary_ridge_model_loads_successfully():
    """Verifies that the verified Ridge pipeline loads and has expected steps."""
    model_path = MODELS_DIR / "demand_forecasting_model (1).joblib"
    assert model_path.exists(), f"Model file not found at {model_path}"

    pipeline = joblib.load(model_path)
    assert hasattr(pipeline, "named_steps"), "Loaded object is not a scikit-learn Pipeline"
    assert "preprocessor" in pipeline.named_steps, "Missing preprocessor in pipeline"
    assert "regressor" in pipeline.named_steps, "Missing regressor in pipeline"

    prep = pipeline.named_steps["preprocessor"]
    num_cols = prep.transformers_[0][2]
    cat_cols = prep.transformers_[1][2]

    assert len(num_cols) == 35, f"Expected 35 numerical columns, got {len(num_cols)}"
    assert len(cat_cols) == 2, f"Expected 2 categorical columns, got {len(cat_cols)}"
    assert cat_cols == ["crop_name", "location_name"]


def test_corrupted_xgboost_model_fails_gracefully():
    """
    Empirically verifies that best_demand_forecasting_model.joblib is corrupted.
    Ensures our system never attempts to serve this unusable model.
    """
    corrupted_path = MODELS_DIR / "best_demand_forecasting_model.joblib"
    assert corrupted_path.exists(), f"Corrupted model file expected at {corrupted_path}"

    with pytest.raises(Exception) as exc_info:
        joblib.load(corrupted_path)

    # Confirm it failed with stream corruption
    assert "corrupted" in str(exc_info.value).lower() or "pickle" in str(exc_info.value).lower()


def test_model_loader_singleton():
    """Verifies the DemandModelLoader singleton in inference.py."""
    from backend.app.ml.inference import model_loader, DemandModelLoader

    loader2 = DemandModelLoader()
    assert model_loader is loader2, "DemandModelLoader must be a singleton"

    model = model_loader.load_model()
    assert model is not None
    assert model_loader.model_version == "demand-v1-ridge"
