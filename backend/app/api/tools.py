"""
backend/app/api/tools.py - CropKart Backend AI Tools for LangFlow Agent.

Provides standardized, authenticated tool endpoints invoked by LangFlow components:
1. POST /api/tools/v1/demand-forecast   -> Real ML inference (Ridge 37-feature model)
2. GET  /api/tools/v1/market-prices     -> Real CEDA mandi records + benchmark data
3. GET  /api/tools/v1/crop-listings     -> Active farmer produce listings in marketplace
4. GET  /api/tools/v1/buyer-requirements -> Wholesale buyer procurement demands

Every tool response conforms to a predictable machine-readable envelope:
Success: {"success": True, "tool": "<tool_name>", "data": {...}}
Failure: {"success": False, "tool": "<tool_name>", "error": {"code": "...", "message": "..."}}
"""

import logging
import os
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

try:
    from app.database import get_db
    from app.schemas import DemandForecastRequest
    from app.services.demand_service import get_demand_forecast
    from app.ml.inference import (
        DemandForecastingError,
        InsufficientDataError,
        InvalidInputError,
        ModelUnavailableError,
        DatabaseError,
    )
except ImportError:
    from backend.app.database import get_db
    from backend.app.schemas import DemandForecastRequest
    from backend.app.services.demand_service import get_demand_forecast
    from backend.app.ml.inference import (
        DemandForecastingError,
        InsufficientDataError,
        InvalidInputError,
        ModelUnavailableError,
        DatabaseError,
    )

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/tools/v1",
    tags=["CropSathi LangFlow Tools"],
)


# ---------------------------------------------------------------------------
# Tool Authentication Dependency
# ---------------------------------------------------------------------------

def verify_tool_auth(
    x_cropsathi_tool_key: Optional[str] = Header(
        default=None,
        alias="X-CropSathi-Tool-Key",
    ),
) -> bool:
    """
    Validates internal service-to-service key for LangFlow tool invocations.
    Checks against CROPSATHI_TOOL_KEY or LANGFLOW_API_KEY if configured in environment.
    If no key is configured in local development, allows access with warning.
    """
    expected_key = os.getenv("CROPSATHI_TOOL_KEY") or os.getenv("LANGFLOW_API_KEY")

    if expected_key:
        if not x_cropsathi_tool_key or x_cropsathi_tool_key.strip() != expected_key.strip():
            logger.warning("Unauthorized tool invocation attempt with key: %s", x_cropsathi_tool_key)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "success": False,
                    "tool": "auth",
                    "error": {
                        "code": "UNAUTHORIZED",
                        "message": "Invalid or missing X-CropSathi-Tool-Key header.",
                    },
                },
            )
    return True


# ---------------------------------------------------------------------------
# 1. Demand Forecast Tool (ML Inference)
# ---------------------------------------------------------------------------

@router.post(
    "/demand-forecast",
    summary="Predict future crop demand using the verified ML Ridge pipeline",
)
async def demand_forecast_tool(
    request: DemandForecastRequest,
    db: Session = Depends(get_db),
    _authorized: bool = Depends(verify_tool_auth),
):
    """
    Demand forecasting tool for LangFlow Agent.
    Invokes ML inference pipeline using 37 historical features from Supabase.
    """
    tool_name = "demand_forecast"
    try:
        result = get_demand_forecast(
            crop=request.crop,
            location=request.location,
            days=request.days,
            db=db,
        )

        return {
            "success": True,
            "tool": tool_name,
            "data": result,
        }

    except Exception as exc:
        code = getattr(exc, "code", None)
        if code == "INSUFFICIENT_DATA" or isinstance(exc, InsufficientDataError):
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content={
                    "success": False,
                    "tool": tool_name,
                    "error": {
                        "code": "INSUFFICIENT_DATA",
                        "message": str(exc),
                    },
                },
            )
        elif code == "INVALID_INPUT" or isinstance(exc, InvalidInputError):
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "success": False,
                    "tool": tool_name,
                    "error": {
                        "code": "INVALID_INPUT",
                        "message": str(exc),
                    },
                },
            )
        elif code == "MODEL_UNAVAILABLE" or isinstance(exc, ModelUnavailableError):
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "success": False,
                    "tool": tool_name,
                    "error": {
                        "code": "MODEL_UNAVAILABLE",
                        "message": str(exc),
                    },
                },
            )

        logger.error("Demand forecast tool error: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "tool": tool_name,
                "error": {
                    "code": code or "PREDICTION_ERROR",
                    "message": "Demand forecasting calculation failed. Please check inputs and database connection.",
                },
            },
        )


# ---------------------------------------------------------------------------
# 2. Market Prices Tool (Real CEDA Agmarknet + Mandi Data)
# ---------------------------------------------------------------------------

@router.get(
    "/market-prices",
    summary="Retrieve real mandi market prices for crops and locations",
)
async def market_prices_tool(
    crop: str = Query(..., description="Crop name (e.g. Wheat, Tomato, Rice, Maize)"),
    location: Optional[str] = Query(None, description="Mandi market, district, or state (e.g. Pune, Nashik)"),
    limit: int = Query(10, ge=1, le=50, description="Max number of price records to return"),
    db: Session = Depends(get_db),
    _authorized: bool = Depends(verify_tool_auth),
):
    """
    Market prices tool for LangFlow Agent.
    Queries agricultural_market_data (Real CEDA Agmarknet historical feed)
    and falls back to market_data (mandi benchmark feed) if needed.
    """
    tool_name = "market_prices"
    crop_clean = crop.strip()
    loc_clean = location.strip() if location else ""

    records: List[Dict[str, Any]] = []
    source_used = "None"

    # Step 1: Query agricultural_market_data (CEDA Agmarknet Real Data)
    try:
        if loc_clean:
            q_ceda = text("""
                SELECT a.record_date, g.name AS commodity, a.variety, l.market AS mandi,
                       l.district, l.state, a.modal_price, a.minimum_price, a.maximum_price,
                       a.arrival_quantity
                FROM agricultural_market_data a
                JOIN grains g ON a.grain_id = g.id
                JOIN locations l ON a.location_id = l.id
                WHERE g.name ILIKE :crop AND (l.market ILIKE :loc OR l.district ILIKE :loc OR l.state ILIKE :loc)
                ORDER BY a.record_date DESC
                LIMIT :limit
            """)
            ceda_rows = db.execute(q_ceda, {"crop": f"%{crop_clean}%", "loc": f"%{loc_clean}%", "limit": limit}).fetchall()
        else:
            q_ceda = text("""
                SELECT a.record_date, g.name AS commodity, a.variety, l.market AS mandi,
                       l.district, l.state, a.modal_price, a.minimum_price, a.maximum_price,
                       a.arrival_quantity
                FROM agricultural_market_data a
                JOIN grains g ON a.grain_id = g.id
                JOIN locations l ON a.location_id = l.id
                WHERE g.name ILIKE :crop
                ORDER BY a.record_date DESC
                LIMIT :limit
            """)
            ceda_rows = db.execute(q_ceda, {"crop": f"%{crop_clean}%", "limit": limit}).fetchall()

        if ceda_rows:
            source_used = "CEDA Agmarknet Live Government Data"
            for r in ceda_rows:
                records.append({
                    "commodity": str(r[1]),
                    "variety": str(r[2]) if r[2] else "General",
                    "mandi": str(r[3]),
                    "district": str(r[4]) if r[4] else "",
                    "state": str(r[5]) if r[5] else "",
                    "record_date": str(r[0]),
                    "modal_price": float(r[6]) if r[6] is not None else 0.0,
                    "min_price": float(r[7]) if r[7] is not None else 0.0,
                    "max_price": float(r[8]) if r[8] is not None else 0.0,
                    "arrival_quantity": float(r[9]) if r[9] is not None else 0.0,
                    "data_source": source_used,
                })

    except Exception as exc:
        logger.warning("Error querying agricultural_market_data in market_prices_tool: %s", exc)

    # Step 2: Fall back to market_data if no CEDA rows found
    if not records:
        try:
            if loc_clean:
                q_market = text("""
                    SELECT record_date, commodity, variety, mandi, district, state,
                           modal_price, minimum_price, maximum_price, arrival_quantity
                    FROM market_data
                    WHERE commodity ILIKE :crop AND (mandi ILIKE :loc OR district ILIKE :loc OR state ILIKE :loc)
                    ORDER BY record_date DESC
                    LIMIT :limit
                """)
                market_rows = db.execute(q_market, {"crop": f"%{crop_clean}%", "loc": f"%{loc_clean}%", "limit": limit}).fetchall()
            else:
                q_market = text("""
                    SELECT record_date, commodity, variety, mandi, district, state,
                           modal_price, minimum_price, maximum_price, arrival_quantity
                    FROM market_data
                    WHERE commodity ILIKE :crop
                    ORDER BY record_date DESC
                    LIMIT :limit
                """)
                market_rows = db.execute(q_market, {"crop": f"%{crop_clean}%", "limit": limit}).fetchall()

            if market_rows:
                source_used = "APMC Mandi Price Benchmark Feed"
                for r in market_rows:
                    records.append({
                        "commodity": str(r[1]),
                        "variety": str(r[2]) if r[2] else "Standard",
                        "mandi": str(r[3]),
                        "district": str(r[4]) if r[4] else "",
                        "state": str(r[5]) if r[5] else "",
                        "record_date": str(r[0]),
                        "modal_price": float(r[6]) if r[6] is not None else 0.0,
                        "min_price": float(r[7]) if r[7] is not None else 0.0,
                        "max_price": float(r[8]) if r[8] is not None else 0.0,
                        "arrival_quantity": float(r[9]) if r[9] is not None else 0.0,
                        "data_source": source_used,
                    })

        except Exception as exc:
            logger.error("Error querying market_data in market_prices_tool: %s", exc)
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "tool": tool_name,
                    "error": {
                        "code": "DATABASE_ERROR",
                        "message": f"Database query failed: {str(exc)}",
                    },
                },
            )

    if not records:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "tool": tool_name,
                "error": {
                    "code": "NOT_FOUND",
                    "message": f"No market price records found for crop '{crop_clean}' in location '{loc_clean or 'any location'}'.",
                },
            },
        )

    # Compute summary metrics for LLM agent
    latest_record = records[0]
    prices_list = [r["modal_price"] for r in records if r["modal_price"] > 0]
    avg_price = round(sum(prices_list) / len(prices_list), 2) if prices_list else 0.0

    return {
        "success": True,
        "tool": tool_name,
        "data": {
            "crop": crop_clean,
            "location": loc_clean or "All Mandis",
            "data_source": source_used,
            "count": len(records),
            "summary": {
                "latest_modal_price": latest_record["modal_price"],
                "latest_min_price": latest_record["min_price"],
                "latest_max_price": latest_record["max_price"],
                "latest_date": latest_record["record_date"],
                "average_price": avg_price,
                "mandi": latest_record["mandi"],
            },
            "records": records,
        },
    }


# ---------------------------------------------------------------------------
# 3. Crop Listings Tool (Farmer Marketplace Produce)
# ---------------------------------------------------------------------------

@router.get(
    "/crop-listings",
    summary="Query active farmer crop listings available in the marketplace",
)
async def crop_listings_tool(
    crop: Optional[str] = Query(None, description="Filter by crop name (e.g. Wheat, Tomato, Rice)"),
    location: Optional[str] = Query(None, description="Filter by farmer location, district, or state"),
    min_quantity: Optional[float] = Query(None, ge=0, description="Minimum quantity in stock"),
    limit: int = Query(10, ge=1, le=50, description="Maximum listings to return"),
    db: Session = Depends(get_db),
    _authorized: bool = Depends(verify_tool_auth),
):
    """
    Crop listings tool for LangFlow Agent.
    Queries active farmer crops from Supabase marketplace.
    """
    tool_name = "crop_listings"

    conditions = ["status = 'available'"]
    params: Dict[str, Any] = {"limit": limit}

    if crop and crop.strip():
        conditions.append("name ILIKE :crop")
        params["crop"] = f"%{crop.strip()}%"

    if location and location.strip():
        conditions.append("(location ILIKE :loc OR district ILIKE :loc OR state ILIKE :loc)")
        params["loc"] = f"%{location.strip()}%"

    if min_quantity is not None and min_quantity > 0:
        conditions.append("quantity >= :min_qty")
        params["min_qty"] = min_quantity

    where_clause = " WHERE " + " AND ".join(conditions)
    q = text(f"""
        SELECT id, farmer_id, name, variety, category, quantity, unit, price_per_unit,
               quality_grade, location, district, state, harvest_date, status, created_at
        FROM crops
        {where_clause}
        ORDER BY created_at DESC
        LIMIT :limit
    """)

    try:
        rows = db.execute(q, params).fetchall()
        items = [
            {
                "id": str(r[0]),
                "name": str(r[2]),
                "variety": str(r[3]) if r[3] else "",
                "category": str(r[4]) if r[4] else "General",
                "quantity": float(r[5]) if r[5] is not None else 0.0,
                "unit": str(r[6]) if r[6] else "kg",
                "price_per_unit": float(r[7]) if r[7] is not None else 0.0,
                "quality_grade": str(r[8]) if r[8] else "Standard",
                "location": str(r[9]) if r[9] else "",
                "district": str(r[10]) if r[10] else "",
                "state": str(r[11]) if r[11] else "",
                "harvest_date": str(r[12]) if r[12] else "",
                "status": str(r[13]) if r[13] else "available",
            }
            for r in rows
        ]

        return {
            "success": True,
            "tool": tool_name,
            "data": {
                "filter_crop": crop or "All",
                "filter_location": location or "All",
                "count": len(items),
                "listings": items,
            },
        }

    except Exception as exc:
        logger.error("Error querying crop listings: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "tool": tool_name,
                "error": {
                    "code": "DATABASE_ERROR",
                    "message": f"Failed to retrieve crop listings: {str(exc)}",
                },
            },
        )


# ---------------------------------------------------------------------------
# 4. Buyer Requirements Tool (Procurement Demands)
# ---------------------------------------------------------------------------

@router.get(
    "/buyer-requirements",
    summary="Query active wholesale buyer procurement requirements",
)
async def buyer_requirements_tool(
    crop: Optional[str] = Query(None, description="Crop name (e.g. Wheat, Tomato, Soybean)"),
    location: Optional[str] = Query(None, description="Buyer location, district, or state"),
    status_filter: Optional[str] = Query(None, alias="status", description="Requirement status (e.g. active, open, fulfilled)"),
    urgency: Optional[str] = Query(None, description="Urgency level (e.g. High, Medium, Low)"),
    limit: int = Query(10, ge=1, le=50, description="Max number of requirements to return"),
    db: Session = Depends(get_db),
    _authorized: bool = Depends(verify_tool_auth),
):
    """
    Buyer requirements tool for LangFlow Agent.
    Queries procurement requirements from wholesale buyers while withholding private PII.
    """
    tool_name = "buyer_requirements"

    conditions = []
    params: Dict[str, Any] = {"limit": limit}

    if crop and crop.strip():
        conditions.append("crop_name ILIKE :crop")
        params["crop"] = f"%{crop.strip()}%"

    if location and location.strip():
        conditions.append("(location ILIKE :loc OR district ILIKE :loc OR state ILIKE :loc)")
        params["loc"] = f"%{location.strip()}%"

    if status_filter and status_filter.strip():
        conditions.append("status = :status")
        params["status"] = status_filter.strip().lower()

    if urgency and urgency.strip():
        conditions.append("urgency ILIKE :urgency")
        params["urgency"] = f"%{urgency.strip()}%"

    where_clause = (" WHERE " + " AND ".join(conditions)) if conditions else ""

    q = text(f"""
        SELECT id, crop_name, variety, category, quantity, unit, target_price,
               location, district, state, urgency, status, created_at
        FROM buyer_requirements
        {where_clause}
        ORDER BY created_at DESC
        LIMIT :limit
    """)

    try:
        rows = db.execute(q, params).fetchall()
        items = [
            {
                "id": str(r[0]),
                "crop_name": str(r[1]),
                "variety": str(r[2]) if r[2] else "",
                "category": str(r[3]) if r[3] else "General",
                "quantity": float(r[4]) if r[4] is not None else 0.0,
                "unit": str(r[5]) if r[5] else "kg",
                "target_price": float(r[6]) if r[6] is not None else None,
                "location": str(r[7]) if r[7] else "",
                "district": str(r[8]) if r[8] else "",
                "state": str(r[9]) if r[9] else "",
                "urgency": str(r[10]) if r[10] else "Normal",
                "status": str(r[11]) if r[11] else "open",
                "created_at": str(r[12]) if r[12] else "",
            }
            for r in rows
        ]

        return {
            "success": True,
            "tool": tool_name,
            "data": {
                "filter_crop": crop or "All",
                "filter_location": location or "All",
                "count": len(items),
                "requirements": items,
            },
        }

    except Exception as exc:
        logger.error("Error querying buyer requirements: %s", exc, exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "tool": tool_name,
                "error": {
                    "code": "DATABASE_ERROR",
                    "message": f"Failed to retrieve buyer requirements: {str(exc)}",
                },
            },
        )