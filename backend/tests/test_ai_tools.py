"""
backend/tests/test_ai_tools.py

Integration tests for the 4 LangFlow backend tool endpoints:
1. POST /api/tools/v1/demand-forecast
2. GET  /api/tools/v1/market-prices
3. GET  /api/tools/v1/crop-listings
4. GET  /api/tools/v1/buyer-requirements

Verifies:
- Standardized tool success/failure envelope
- Service-to-service key authentication
- Real database querying (CEDA, market_data, crops, buyer_requirements)
- Error handling for invalid inputs and missing data
"""

import os
import pytest
from dotenv import dotenv_values
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)

# Load configured tool authorization key
env = dotenv_values("backend/.env")
AUTH_KEY = env.get("LANGFLOW_API_KEY") or env.get("CROPSATHI_TOOL_KEY") or "test-key"
AUTH_HEADERS = {"X-CropSathi-Tool-Key": AUTH_KEY}


# ---------------------------------------------------------------------------
# Authentication Tests
# ---------------------------------------------------------------------------

def test_tool_endpoints_require_authentication():
    """Verifies unauthenticated calls to tool endpoints are rejected with 401."""
    if not AUTH_KEY:
        pytest.skip("No tool key configured in environment")

    # Demand forecast tool without key
    r = client.post("/api/tools/v1/demand-forecast", json={"crop": "Wheat", "location": "Pune", "days": 30})
    assert r.status_code == 401
    assert r.json()["detail"]["error"]["code"] == "UNAUTHORIZED"

    # Market prices tool without key
    r = client.get("/api/tools/v1/market-prices?crop=Wheat")
    assert r.status_code == 401

    # Crop listings tool without key
    r = client.get("/api/tools/v1/crop-listings")
    assert r.status_code == 401

    # Buyer requirements tool without key
    r = client.get("/api/tools/v1/buyer-requirements")
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# 1. Demand Forecast Tool
# ---------------------------------------------------------------------------

def test_demand_forecast_tool_success():
    """Verifies POST /api/tools/v1/demand-forecast returns real ML prediction."""
    payload = {"crop": "Wheat", "location": "Pune", "days": 30}
    r = client.post("/api/tools/v1/demand-forecast", json=payload, headers=AUTH_HEADERS)

    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["tool"] == "demand_forecast"

    data = body["data"]
    assert data["crop"] == "Wheat"
    assert data["location"] == "Pune"
    assert data["forecast_days"] == 30
    assert data["predicted_demand"] > 0
    assert data["unit"] == "kg"
    assert data["model_version"] == "demand-v1-ridge"
    assert "data_source" in data


def test_demand_forecast_tool_invalid_crop():
    """Verifies that an unknown crop returns 404 with INSUFFICIENT_DATA."""
    payload = {"crop": "NonExistentCrop123", "location": "Pune", "days": 30}
    r = client.post("/api/tools/v1/demand-forecast", json=payload, headers=AUTH_HEADERS)

    assert r.status_code == 404
    body = r.json()
    assert body["success"] is False
    assert body["tool"] == "demand_forecast"
    assert body["error"]["code"] == "INSUFFICIENT_DATA"


def test_demand_forecast_tool_invalid_input():
    """Verifies validation error for empty location or bad input."""
    payload = {"crop": "Wheat", "location": "", "days": 30}
    r = client.post("/api/tools/v1/demand-forecast", json=payload, headers=AUTH_HEADERS)

    assert r.status_code in [400, 422]


# ---------------------------------------------------------------------------
# 2. Market Prices Tool
# ---------------------------------------------------------------------------

def test_market_prices_tool_ceda_data():
    """Verifies GET /api/tools/v1/market-prices returns real CEDA Agmarknet prices."""
    r = client.get("/api/tools/v1/market-prices?crop=Wheat&location=Pune&limit=5", headers=AUTH_HEADERS)

    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["tool"] == "market_prices"

    data = body["data"]
    assert data["crop"] == "Wheat"
    assert data["count"] > 0
    assert len(data["records"]) > 0

    record = data["records"][0]
    assert "modal_price" in record
    assert record["modal_price"] > 0
    assert "mandi" in record
    assert "data_source" in record


def test_market_prices_tool_not_found():
    """Verifies 404 returned when no prices exist for an unknown crop."""
    r = client.get("/api/tools/v1/market-prices?crop=NonExistentExoticCrop", headers=AUTH_HEADERS)

    assert r.status_code == 404
    body = r.json()
    assert body["success"] is False
    assert body["tool"] == "market_prices"
    assert body["error"]["code"] == "NOT_FOUND"


# ---------------------------------------------------------------------------
# 3. Crop Listings Tool
# ---------------------------------------------------------------------------

def test_crop_listings_tool():
    """Verifies GET /api/tools/v1/crop-listings queries the marketplace crops table."""
    r = client.get("/api/tools/v1/crop-listings?limit=5", headers=AUTH_HEADERS)

    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["tool"] == "crop_listings"

    data = body["data"]
    assert "listings" in data
    assert data["count"] > 0

    listing = data["listings"][0]
    assert "name" in listing
    assert "quantity" in listing
    assert "price_per_unit" in listing
    assert "status" in listing


# ---------------------------------------------------------------------------
# 4. Buyer Requirements Tool
# ---------------------------------------------------------------------------

def test_buyer_requirements_tool():
    """Verifies GET /api/tools/v1/buyer-requirements returns active wholesale demands."""
    r = client.get("/api/tools/v1/buyer-requirements?crop=Wheat&limit=5", headers=AUTH_HEADERS)

    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["tool"] == "buyer_requirements"

    data = body["data"]
    assert data["count"] > 0
    assert len(data["requirements"]) > 0

    req = data["requirements"][0]
    assert req["crop_name"] == "Wheat"
    assert "quantity" in req
    assert "unit" in req
    assert "target_price" in req
