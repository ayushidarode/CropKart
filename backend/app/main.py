"""
main.py - CropKart AI Automation FastAPI Server

Initializes the FastAPI application for the CropSathi AI Automation layer.
Provides chat and agricultural intelligence endpoints ready for LangFlow integration.
Decoupled from direct database access for independent execution.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

try:
    from app.ai_logic import crop_sathi
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
    from schemas import (
        ChatRequest,
        ChatResponse,
        CropMatchRequest,
        DemandForecastRequest,
        FarmingAdviceRequest,
        PricingRequest,
    )

# Initialize FastAPI application
app = FastAPI(
    title="CropKart AI API",
    description="Smart Agriculture Marketplace & CropSathi AI Automation Service",
    version="1.0.0"
)

# Configure CORS for local development (React frontend on localhost:5173 / localhost:3000)
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


@app.get("/", tags=["Health"])
async def root():
    """Root health and status endpoint."""
    return {
        "status": "ok",
        "service": "CropSathi AI",
        "message": "CropKart AI Service is running"
    }


@app.get("/health", tags=["Health"])
async def health():
    """Standard health check endpoint."""
    return {
        "status": "ok",
        "service": "CropSathi AI"
    }


@app.post("/api/ai/chat", response_model=ChatResponse, tags=["AI Automation"])
async def ai_chat(request: ChatRequest):
    """
    CropSathi conversational chat endpoint.
    Receives user query, validates input, and delegates to CropSathiAI service.
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


@app.post("/api/ai/crop-match", tags=["AI Automation"])
async def ai_crop_match(request: CropMatchRequest):
    """Matches crop availability with potential buyers or market demands."""
    return await crop_sathi.crop_match(
        crop=request.crop,
        quantity=request.quantity,
        location=request.location
    )


@app.post("/api/ai/pricing", tags=["AI Automation"])
async def ai_pricing(request: PricingRequest):
    """Provides pricing intelligence, MSP guidelines, and market trends."""
    return await crop_sathi.pricing_intelligence(
        crop=request.crop,
        location=request.location
    )


@app.post("/api/ai/demand-forecast", tags=["AI Automation"])
async def ai_demand_forecast(request: DemandForecastRequest):
    """Projects upcoming market demand trends for a specified crop."""
    return await crop_sathi.demand_forecasting(
        crop=request.crop,
        location=request.location
    )


@app.post("/api/ai/farming-advice", tags=["AI Automation"])
async def ai_farming_advice(request: FarmingAdviceRequest):
    """Provides agronomy advice and recommended practices."""
    return await crop_sathi.farming_advice(
        crop=request.crop,
        question=request.question,
        location=request.location
    )
