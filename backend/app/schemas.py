"""
schemas.py - Pydantic Schemas for CropKart Marketplace & CropSathi AI

Defines request and response validation schemas for:
- Marketplace entities (User, Crop, BuyerRequirement, Offer, Order, OrderItem, Transport, MarketplaceNotification)
- CropSathi AI endpoints (Chat, Crop Match, Pricing, Demand Forecasting, Farming Advice)
"""

from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


# =====================================================================
# 1. Marketplace Entity Schemas
# =====================================================================

# --- User ---
class UserBase(BaseModel):
    name: str = Field(..., description="Full name of the user")
    mobile: str = Field(..., description="Mobile number for contact and login")
    role: str = Field("farmer", description="Role: farmer, buyer, transporter, or admin")
    location: Optional[str] = Field(None, description="City or district location")


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# --- Crop ---
class CropBase(BaseModel):
    name: str = Field(..., description="Crop commodity name, e.g., Wheat, Tomato")
    category: str = Field(..., description="Category, e.g., Grain, Vegetable, Fruit, Pulse")


class CropCreate(CropBase):
    pass


class CropResponse(CropBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# --- Buyer Requirement ---
class BuyerRequirementBase(BaseModel):
    buyer_id: int
    crop_id: int
    quantity: float = Field(..., gt=0, description="Quantity needed in metric units/quintals")
    location: Optional[str] = None
    status: str = Field("active", description="active, fulfilled, or cancelled")


class BuyerRequirementCreate(BaseModel):
    buyer_id: int
    crop_id: int
    quantity: float = Field(..., gt=0)
    location: Optional[str] = None


class BuyerRequirementResponse(BuyerRequirementBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# --- Offer ---
class OfferBase(BaseModel):
    seller_id: int
    crop_id: int
    quantity: float = Field(..., gt=0, description="Available quantity")
    price: float = Field(..., gt=0, description="Price per unit/quintal")
    location: Optional[str] = None
    quality: Optional[str] = Field(None, description="Quality grade, e.g., Grade A, Organic")
    status: str = Field("available", description="available, reserved, or sold")


class OfferCreate(BaseModel):
    seller_id: int
    crop_id: int
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    location: Optional[str] = None
    quality: Optional[str] = None


class OfferResponse(OfferBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# --- Order Item ---
class OrderItemBase(BaseModel):
    crop_id: int
    seller_id: int
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)


class OrderItemCreate(OrderItemBase):
    order_id: Optional[int] = None


class OrderItemResponse(OrderItemBase):
    id: int
    order_id: int

    model_config = ConfigDict(from_attributes=True)


# --- Transport ---
class TransportBase(BaseModel):
    order_id: int
    transporter_name: str
    vehicle_number: str
    status: str = Field("assigned", description="assigned, in_transit, or delivered")


class TransportCreate(BaseModel):
    order_id: int
    transporter_name: str
    vehicle_number: str


class TransportResponse(TransportBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# --- Order ---
class OrderBase(BaseModel):
    buyer_id: int
    status: str = Field("pending", description="pending, confirmed, in_transit, completed, cancelled")
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None


class OrderCreate(BaseModel):
    buyer_id: int
    pickup_location: Optional[str] = None
    delivery_location: Optional[str] = None


class OrderResponse(OrderBase):
    id: int
    order_items: List[OrderItemResponse] = []
    transports: List[TransportResponse] = []

    model_config = ConfigDict(from_attributes=True)


# --- Marketplace Notification ---
class MarketplaceNotificationBase(BaseModel):
    user_id: int
    message: str
    type: str = Field("info", description="match, price_alert, order_update, or info")
    is_read: bool = False


class MarketplaceNotificationCreate(BaseModel):
    user_id: int
    message: str
    type: str = "info"


class MarketplaceNotificationResponse(MarketplaceNotificationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# =====================================================================
# 2. CropSathi AI Request Schemas
# =====================================================================

class ChatRequest(BaseModel):
    """Request schema for conversational CropSathi AI chat."""
    message: str = Field(..., description="User prompt or chat message")
    user_id: Optional[int] = Field(None, description="Optional ID of the querying user")
    language: Optional[str] = Field("en", description="Language code (e.g., 'en', 'hi', 'mr')")
    role: Optional[str] = Field(None, description="User role (farmer, buyer, admin)")

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("Message cannot be empty")
        return value.strip()


class ChatResponse(BaseModel):
    """Response schema for conversational CropSathi AI chat."""
    success: bool = True
    message: str
    response: str


class CropMatchRequest(BaseModel):
    """Request schema for crop buyer-seller matching."""
    crop: str = Field(..., min_length=1, description="Crop name to match")
    quantity: float = Field(..., gt=0, description="Available or required crop quantity")
    location: Optional[str] = Field(None, description="Target district, state, or mandi")


class PricingRequest(BaseModel):
    """Request schema for pricing intelligence and MSP comparison."""
    crop: str = Field(..., min_length=1, description="Crop name to evaluate")
    location: Optional[str] = Field(None, description="Mandi or market location")


class DemandForecastRequest(BaseModel):
    """Request schema for upcoming crop demand forecasting."""
    crop: str = Field(..., min_length=1, description="Crop name to forecast")
    location: Optional[str] = Field(None, description="Market region")


class FarmingAdviceRequest(BaseModel):
    """Request schema for agronomic assistance and crop advisory."""
    crop: str = Field(..., min_length=1, description="Crop name")
    question: str = Field(..., min_length=1, description="Farming or agronomy question")
    location: Optional[str] = Field(None, description="Agricultural/climate region")


# =====================================================================
# 3. Location Schemas
# =====================================================================

class GeocodeRequest(BaseModel):
    """Request schema for geocoding a human-readable address."""
    address: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Human-readable address or landmark name to geocode"
    )

    @field_validator("address")
    @classmethod
    def validate_address_not_empty(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Address cannot be empty")
        return cleaned


class GeocodeResponse(BaseModel):
    """Response schema containing geocoded coordinates and location info."""
    success: bool = Field(..., description="Whether geocoding was successful")
    address: str = Field(..., description="Original input address query")
    latitude: Optional[float] = Field(None, description="Resolved geographic latitude")
    longitude: Optional[float] = Field(None, description="Resolved geographic longitude")
    display_name: Optional[str] = Field(None, description="Resolved full display address")
    message: Optional[str] = Field(None, description="Optional status or error message")


# Register module aliases so `from app.schemas.location import ...` also works seamlessly
import sys
sys.modules.setdefault("app.schemas.location", sys.modules[__name__])
sys.modules.setdefault("schemas.location", sys.modules[__name__])


# =====================================================================
# 4. Agricultural Data Collection & Storage Schemas
# =====================================================================

class DataCollectRequest(BaseModel):
    """
    Request schema for triggering agricultural data collection.
    Allows optional custom source URL or commodity filter.
    """
    source_url: Optional[str] = Field(None, description="Optional custom CSV or API URL")
    commodity: Optional[str] = Field("Wheat", description="Commodity to collect (e.g., Wheat, Rice, Maize)")
    limit: Optional[int] = Field(100, ge=1, le=10000, description="Max records to ingest in this batch")


class DataCollectResponse(BaseModel):
    """
    Response schema summarizing data collection outcome.
    Follows required format without exposing secrets.
    """
    success: bool = Field(..., description="Overall execution status")
    source: str = Field(..., description="Data source identifier or name")
    records_fetched: int = Field(..., description="Total raw records retrieved from source")
    records_valid: int = Field(..., description="Records passing validation")
    records_stored: int = Field(..., description="Records inserted or upserted into Supabase")
    records_skipped: int = Field(..., description="Records skipped due to validation failure or duplicates")
    message: Optional[str] = Field(None, description="Descriptive status message")


class DataHealthResponse(BaseModel):
    """
    Health check response verifying backend, external data source, and database.
    """
    status: str = Field("ok", description="Overall health status")
    backend: bool = Field(True, description="FastAPI backend is running")
    data_source_reachable: bool = Field(..., description="External agricultural data source is reachable")
    database_connected: bool = Field(..., description="Supabase / PostgreSQL connection is active")
    supabase_configured: bool = Field(..., description="Whether Supabase environment variables are present")
    details: Optional[dict] = Field(default_factory=dict, description="Diagnostic details")


class MarketDataRecordResponse(BaseModel):
    """Single agricultural market price and arrival record."""
    id: int
    commodity: str
    state: str
    district: str
    market: str
    record_date: str
    variety: Optional[str] = None
    arrival_quantity: Optional[float] = None
    minimum_price: Optional[float] = None
    maximum_price: Optional[float] = None
    modal_price: Optional[float] = None


class MarketDataSummaryResponse(BaseModel):
    """Aggregated statistics of stored agricultural market data."""
    total_records: int
    total_grains: int
    total_locations: int
    latest_date: Optional[str] = None


class DataStatusResponse(BaseModel):
    """Status endpoint response matching section 17 requirements."""
    source: str = Field(..., description="Data source name")
    database: str = Field(..., description="Database target (supabase or postgresql)")
    records_stored: int = Field(..., description="Total agricultural records stored")
    latest_record_date: Optional[str] = Field(None, description="Date of latest record stored")
    commodities: Optional[List[str]] = Field(default_factory=list, description="List of stored commodities")



