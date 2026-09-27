"""
main.py - CropKart AI Automation FastAPI Server

Initializes the FastAPI application for the CropSathi AI Automation layer.
Provides chat and agricultural intelligence endpoints ready for LangFlow integration.
"""

import logging
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

try:
    from app.ai_logic import crop_sathi
    from app.api.location import router as location_router
    from app.api.data import router as data_router
    from app.database import get_db, init_db, test_db_connection
    from app.schemas import (
        ChatRequest,
        ChatResponse,
        CropMatchRequest,
        DemandForecastRequest,
        FarmingAdviceRequest,
        PricingRequest,
    )
except ImportError:
    from ai_logic import crop_sathi
    from api.location import router as location_router
    from api.data import router as data_router
    from database import get_db, init_db, test_db_connection
    from schemas import (
        ChatRequest,
        ChatResponse,
        CropMatchRequest,
        DemandForecastRequest,
        FarmingAdviceRequest,
        PricingRequest,
    )


# ---------------------------------------------------------
# Initialize FastAPI application
# ---------------------------------------------------------

app = FastAPI(
    title="CropKart AI API",
    description="Smart Agriculture Marketplace & CropSathi AI Automation Service",
    version="1.0.0"
)


# ---------------------------------------------------------
# CORS Configuration
# ---------------------------------------------------------

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Register Routers
# ---------------------------------------------------------

app.include_router(location_router)
app.include_router(data_router)


# ---------------------------------------------------------
# Database Startup
# ---------------------------------------------------------

@app.on_event("startup")
async def startup_event():
    """
    Initializes database tables when FastAPI starts.
    Logs any database initialization error clearly without silent suppression.
    """
    try:
        init_db()
    except Exception as exc:
        logger.error(
            f"Database initialization failed during startup: {exc}",
            exc_info=True
        )


# ---------------------------------------------------------
# Root Health Endpoint
# ---------------------------------------------------------

@app.get("/", tags=["Health"])
async def root():
    """
    Root health and status endpoint.
    """
    return {
        "status": "ok",
        "service": "CropSathi AI",
        "message": "CropKart AI Service is running"
    }


# ---------------------------------------------------------
# Health Check
# ---------------------------------------------------------

@app.get("/health", tags=["Health"])
async def health():
    """
    Standard health check endpoint.
    """
    return {
        "status": "ok",
        "service": "CropSathi AI"
    }


# ---------------------------------------------------------
# Supabase Database Connection Test
# ---------------------------------------------------------

@app.get("/api/db-test", tags=["Database"])
async def db_test():
    """
    Tests the connection between FastAPI and Supabase PostgreSQL.
    Safely returns connection status without leaking credentials or URLs.
    """
    connected = test_db_connection()
    return {
        "database_connected": connected
    }


# ---------------------------------------------------------
# Read-Only Crop Retrieval
# ---------------------------------------------------------

@app.get("/api/crops", tags=["Crops"])
async def get_crops_list(db: Session = Depends(get_db)):
    """
    Read-only endpoint to retrieve existing crop records from the database.
    Does not insert duplicate records.
    """
    try:
        result = db.execute(text("SELECT * FROM crops LIMIT 50"))
        rows = result.mappings().all()
        return {
            "success": True,
            "count": len(rows),
            "crops": [dict(r) for r in rows],
        }
    except Exception as exc:
        logger.error(f"Failed to retrieve crops: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(exc)}"
        )


# ---------------------------------------------------------
# CropSathi AI Chat
# ---------------------------------------------------------

@app.post(
    "/api/ai/chat",
    response_model=ChatResponse,
    tags=["AI Automation"]
)
async def ai_chat(request: ChatRequest):
    """
    CropSathi conversational chat endpoint.
    """
    try:
        response_text = await crop_sathi.chat(
            message=request.message,
            language=request.language,
            role=request.role
        )

        return ChatResponse(
            success=True,
            message=request.message,
            response=response_text
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CropSathi AI service error: {str(exc)}"
        )


# ---------------------------------------------------------
# Crop Matching
# ---------------------------------------------------------

@app.post(
    "/api/ai/crop-match",
    tags=["AI Automation"]
)
async def ai_crop_match(request: CropMatchRequest):
    """
    Matches crop availability with potential buyers
    or market demands.
    """
    return await crop_sathi.crop_match(
        crop=request.crop,
        quantity=request.quantity,
        location=request.location
    )


# ---------------------------------------------------------
# Pricing Intelligence
# ---------------------------------------------------------

@app.post(
    "/api/ai/pricing",
    tags=["AI Automation"]
)
async def ai_pricing(request: PricingRequest):
    """
    Provides pricing intelligence,
    MSP guidelines, and market trends.
    """
    return await crop_sathi.pricing_intelligence(
        crop=request.crop,
        location=request.location
    )


# ---------------------------------------------------------
# Demand Forecasting
# ---------------------------------------------------------

@app.post(
    "/api/ai/demand-forecast",
    tags=["AI Automation"]
)
async def ai_demand_forecast(request: DemandForecastRequest):
    """
    Projects upcoming market demand trends
    for a specified crop.
    """
    return await crop_sathi.demand_forecasting(
        crop=request.crop,
        location=request.location
    )


# ---------------------------------------------------------
# Farming Advice
# ---------------------------------------------------------

@app.post(
    "/api/ai/farming-advice",
    tags=["AI Automation"]
)
async def ai_farming_advice(request: FarmingAdviceRequest):
    """
    Provides agronomy advice and recommended practices.
    """
    return await crop_sathi.farming_advice(
        crop=request.crop,
        question=request.question,
        location=request.location
    )