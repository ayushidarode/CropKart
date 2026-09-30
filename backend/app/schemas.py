"""
schemas.py - Pydantic Schemas for CropKart Marketplace & CropSathi AI

Defines request and response validation schemas for:
- Marketplace entities (User, Crop, BuyerRequirement, Offer, Order, OrderItem, Transport, MarketplaceNotification)
- CropSathi AI endpoints (Chat, Crop Match, Pricing, Demand Forecasting, Farming Advice)
- Location services
- Agricultural data collection and storage
"""

from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


# =====================================================================
# 1. Marketplace Entity Schemas
# =====================================================================


# ---------------------------------------------------------------------
# User
# ---------------------------------------------------------------------

class UserBase(BaseModel):
    name: str = Field(
        ...,
        description="Full name of the user",
    )

    mobile: Optional[str] = Field(
        None,
        description="Mobile number for contact and login",
    )

    role: str = Field(
        "farmer",
        description="Role: farmer, buyer, transporter, or admin",
    )

    location: Optional[str] = Field(
        None,
        description="City or district location",
    )


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: Union[UUID, str]

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------
# Crop
# ---------------------------------------------------------------------

class CropBase(BaseModel):
    name: str = Field(
        ...,
        description="Crop commodity name, e.g., Wheat, Tomato",
    )

    category: str = Field(
        ...,
        description="Category, e.g., Grain, Vegetable, Fruit, Pulse",
    )

    farmer_id: Optional[Union[UUID, str]] = Field(
        None,
        description="Farmer user ID",
    )


class CropCreate(CropBase):
    pass


class CropResponse(CropBase):
    id: Union[UUID, str]

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------
# Buyer Requirement
# ---------------------------------------------------------------------

class BuyerRequirementBase(BaseModel):
    buyer_id: Union[UUID, str]

    crop_id: Optional[Union[UUID, str]] = None

    crop_name: Optional[str] = None

    quantity: float = Field(
        ...,
        gt=0,
        description="Quantity needed in metric units/quintals",
    )

    location: Optional[str] = None

    status: str = Field(
        "active",
        description="active, fulfilled, or cancelled",
    )


class BuyerRequirementCreate(BaseModel):
    buyer_id: Union[UUID, str]

    crop_id: Optional[Union[UUID, str]] = None

    crop_name: Optional[str] = None

    quantity: float = Field(
        ...,
        gt=0,
    )

    location: Optional[str] = None


class BuyerRequirementResponse(BuyerRequirementBase):
    id: Union[UUID, str]

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------
# Offer
# ---------------------------------------------------------------------

class OfferBase(BaseModel):
    seller_id: Union[UUID, str]

    crop_id: Union[UUID, str]

    quantity: float = Field(
        ...,
        gt=0,
        description="Available quantity",
    )

    price: float = Field(
        ...,
        gt=0,
        description="Price per unit/quintal",
    )

    location: Optional[str] = None

    quality: Optional[str] = Field(
        None,
        description="Quality grade, e.g., Grade A, Organic",
    )

    status: str = Field(
        "available",
        description="available, reserved, or sold",
    )


class OfferCreate(BaseModel):
    seller_id: Union[UUID, str]

    crop_id: Union[UUID, str]

    quantity: float = Field(
        ...,
        gt=0,
    )

    price: float = Field(
        ...,
        gt=0,
    )

    location: Optional[str] = None

    quality: Optional[str] = None


class OfferResponse(OfferBase):
    id: Union[UUID, str]

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------
# Order Item
# ---------------------------------------------------------------------

class OrderItemBase(BaseModel):
    crop_id: Optional[Union[UUID, str]] = None

    crop_name: Optional[str] = None

    seller_id: Optional[Union[UUID, str]] = None

    quantity: float = Field(
        ...,
        gt=0,
    )

    price: Optional[float] = None

    unit_price: Optional[float] = None

    total_price: Optional[float] = None


class OrderItemCreate(OrderItemBase):
    order_id: Optional[Union[UUID, str]] = None


class OrderItemResponse(OrderItemBase):
    id: Union[UUID, str]

    order_id: Union[UUID, str]

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------
# Transport
# ---------------------------------------------------------------------

class TransportBase(BaseModel):
    order_id: Union[UUID, str]

    transporter_name: str

    vehicle_number: str

    status: str = Field(
        "assigned",
        description="assigned, in_transit, or delivered",
    )


class TransportCreate(BaseModel):
    order_id: Union[UUID, str]

    transporter_name: str

    vehicle_number: str


class TransportResponse(TransportBase):
    id: Union[UUID, str]

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------
# Order
# ---------------------------------------------------------------------

class OrderBase(BaseModel):
    buyer_id: Union[UUID, str]

    farmer_id: Optional[Union[UUID, str]] = None

    crop_id: Optional[Union[UUID, str]] = None

    status: str = Field(
        "pending",
        description="pending, confirmed, in_transit, completed, cancelled",
    )

    pickup_location: Optional[str] = None

    delivery_location: Optional[str] = None


class OrderCreate(BaseModel):
    buyer_id: Union[UUID, str]

    farmer_id: Optional[Union[UUID, str]] = None

    crop_id: Optional[Union[UUID, str]] = None

    pickup_location: Optional[str] = None

    delivery_location: Optional[str] = None


class OrderResponse(OrderBase):
    id: Union[UUID, str]

    order_items: List[OrderItemResponse] = []

    transports: List[TransportResponse] = []

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------
# Marketplace Notification
# ---------------------------------------------------------------------

class MarketplaceNotificationBase(BaseModel):
    user_id: Union[UUID, str]

    message: str

    type: str = Field(
        "info",
        description="match, price_alert, order_update, or info",
    )

    is_read: bool = False


class MarketplaceNotificationCreate(BaseModel):
    user_id: Union[UUID, str]

    message: str

    type: str = "info"


class MarketplaceNotificationResponse(
    MarketplaceNotificationBase
):
    id: Union[UUID, str]

    model_config = ConfigDict(
        from_attributes=True
    )


# =====================================================================
# 2. CropSathi AI Request Schemas
# =====================================================================


# ---------------------------------------------------------------------
# Chat
# ---------------------------------------------------------------------

class ChatRequest(BaseModel):
    """Request schema for conversational CropSathi AI chat."""

    message: str = Field(
        ...,
        description="User prompt or chat message",
    )

    user_id: Optional[Union[UUID, str]] = Field(
        None,
        description="Optional ID of the querying user",
    )

    language: Optional[str] = Field(
        "en",
        description="Language code (e.g., 'en', 'hi', 'mr')",
    )

    role: Optional[str] = Field(
        None,
        description="User role (farmer, buyer, admin)",
    )

    @field_validator("message")
    @classmethod
    def validate_message_not_empty(
        cls,
        value: str,
    ) -> str:
        if not value or not value.strip():
            raise ValueError("Message cannot be empty")

        return value.strip()


class ChatResponse(BaseModel):
    """Response schema for conversational CropSathi AI chat."""

    success: bool = True

    message: str

    response: str


# ---------------------------------------------------------------------
# Crop Match
# ---------------------------------------------------------------------

class CropMatchRequest(BaseModel):
    """Request schema for crop buyer-seller matching."""

    crop: str = Field(
        ...,
        min_length=1,
        description="Crop name to match",
    )

    quantity: float = Field(
        ...,
        gt=0,
        description="Available or required crop quantity",
    )

    location: Optional[str] = Field(
        None,
        description="Target district, state, or mandi",
    )


# ---------------------------------------------------------------------
# Pricing
# ---------------------------------------------------------------------

class PricingRequest(BaseModel):
    """Request schema for pricing intelligence and MSP comparison."""

    crop: str = Field(
        ...,
        min_length=1,
        description="Crop name to evaluate",
    )

    location: Optional[str] = Field(
        None,
        description="Mandi or market location",
    )


# ---------------------------------------------------------------------
# Demand Forecasting
# ---------------------------------------------------------------------

class DemandForecastRequest(BaseModel):
    """
    Request schema for upcoming crop demand forecasting.

    Required fields:
    - crop
    - location
    - days
    """

    crop: str = Field(
        ...,
        min_length=1,
        description="Crop name to forecast",
    )

    location: str = Field(
        ...,
        min_length=1,
        description="Market region/location",
    )

    days: int = Field(
        ...,
        ge=1,
        le=365,
        description="Forecast horizon in days (1-365)",
    )


# ---------------------------------------------------------------------
# Farming Advice
# ---------------------------------------------------------------------

class FarmingAdviceRequest(BaseModel):
    """Request schema for agronomic assistance and crop advisory."""

    crop: str = Field(
        ...,
        min_length=1,
        description="Crop name",
    )

    question: str = Field(
        ...,
        min_length=1,
        description="Farming or agronomy question",
    )

    location: Optional[str] = Field(
        None,
        description="Agricultural/climate region",
    )


# =====================================================================
# 3. Location Schemas
# =====================================================================


# ---------------------------------------------------------------------
# Geocode Request
# ---------------------------------------------------------------------

class GeocodeRequest(BaseModel):
    """Request schema for geocoding a human-readable address."""

    address: str = Field(
        ...,
        min_length=1,
        max_length=500,
        description="Human-readable address or landmark name to geocode",
    )

    @field_validator("address")
    @classmethod
    def validate_address_not_empty(
        cls,
        value: str,
    ) -> str:
        cleaned = value.strip()

        if not cleaned:
            raise ValueError("Address cannot be empty")

        return cleaned


# ---------------------------------------------------------------------
# Geocode Response
# ---------------------------------------------------------------------

class GeocodeResponse(BaseModel):
    """Response schema containing geocoded coordinates and location info."""

    success: bool = Field(
        ...,
        description="Whether geocoding was successful",
    )

    address: str = Field(
        ...,
        description="Original input address query",
    )

    latitude: Optional[float] = Field(
        None,
        description="Resolved geographic latitude",
    )

    longitude: Optional[float] = Field(
        None,
        description="Resolved geographic longitude",
    )

    display_name: Optional[str] = Field(
        None,
        description="Resolved full display address",
    )

    message: Optional[str] = Field(
        None,
        description="Optional status or error message",
    )


# ---------------------------------------------------------------------
# Schema Module Aliases
# ---------------------------------------------------------------------

# Register module aliases so:
#
# from app.schemas.location import ...
#
# also works seamlessly.

import sys

sys.modules.setdefault(
    "app.schemas.location",
    sys.modules[__name__],
)

sys.modules.setdefault(
    "schemas.location",
    sys.modules[__name__],
)


# =====================================================================
# 4. Agricultural Data Collection & Storage Schemas
# =====================================================================


# ---------------------------------------------------------------------
# CEDA Commodity
# ---------------------------------------------------------------------

class CedaCommodityItem(BaseModel):
    """Commodity item returned by CEDA Agmarknet API."""

    commodity_id: int

    commodity_name: str


class CedaCommoditiesResponse(BaseModel):
    """Response containing list of CEDA agricultural commodities."""

    success: bool = True

    count: int

    commodities: List[CedaCommodityItem]


# ---------------------------------------------------------------------
# CEDA Geography
# ---------------------------------------------------------------------

class CedaGeographyItem(BaseModel):
    """State and district geography item returned by CEDA Agmarknet API."""

    census_state_id: int

    census_state_name: str

    census_district_id: int

    census_district_name: str


class CedaGeographiesResponse(BaseModel):
    """Response containing list of CEDA states and districts."""

    success: bool = True

    count: int

    geographies: List[CedaGeographyItem]


# ---------------------------------------------------------------------
# CEDA Markets
# ---------------------------------------------------------------------

class CedaMarketsRequest(BaseModel):
    """Request schema for retrieving markets for a commodity and geography."""

    commodity_id: int = Field(
        ...,
        description="CEDA commodity ID (e.g., 1 for Wheat)",
    )

    state_id: int = Field(
        ...,
        description="CEDA state ID (e.g., 3 for Punjab)",
    )

    district_id: Optional[int] = Field(
        None,
        description="Optional CEDA district ID",
    )

    indicator: Optional[str] = Field(
        "price",
        description="Indicator type: 'price' or 'quantity'",
    )


class CedaMarketItem(BaseModel):
    """Market / Mandi item returned by CEDA Agmarknet API."""

    market_id: int

    market_name: str

    census_state_id: Optional[int] = None

    census_district_id: Optional[int] = None


class CedaMarketsResponse(BaseModel):
    """Response containing list of mandis for a commodity & location."""

    success: bool = True

    count: int

    markets: List[CedaMarketItem]


# ---------------------------------------------------------------------
# CEDA Prices
# ---------------------------------------------------------------------

class CedaPriceItem(BaseModel):
    """Daily mandi price record returned by CEDA Agmarknet API."""

    date: str

    commodity_id: int

    census_state_id: int

    census_district_id: Optional[int] = None

    market_id: Optional[int] = None

    min_price: Optional[float] = None

    max_price: Optional[float] = None

    modal_price: Optional[float] = None


class CedaPricesRequest(BaseModel):
    """Request schema for retrieving prices from CEDA Agmarknet API."""

    commodity_id: int = Field(
        ...,
        description="CEDA commodity ID",
    )

    state_id: int = Field(
        ...,
        description="CEDA state ID",
    )

    from_date: str = Field(
        ...,
        description="Start date (YYYY-MM-DD)",
    )

    to_date: str = Field(
        ...,
        description="End date (YYYY-MM-DD)",
    )

    district_id: Optional[int] = Field(
        None,
        description="Optional district ID",
    )

    market_id: Optional[int] = Field(
        None,
        description="Optional market ID",
    )


class CedaPricesResponse(BaseModel):
    """Response containing price records from CEDA."""

    success: bool = True

    count: int

    prices: List[CedaPriceItem]


# ---------------------------------------------------------------------
# CEDA Quantities
# ---------------------------------------------------------------------

class CedaQuantityItem(BaseModel):
    """Daily mandi arrival quantity record returned by CEDA Agmarknet API."""

    date: str

    commodity_id: int

    census_state_id: int

    census_district_id: Optional[int] = None

    market_id: Optional[int] = None

    quantity: Optional[float] = None


class CedaQuantitiesRequest(BaseModel):
    """Request schema for retrieving arrival quantities from CEDA."""

    commodity_id: int = Field(
        ...,
        description="CEDA commodity ID",
    )

    state_id: int = Field(
        ...,
        description="CEDA state ID",
    )

    from_date: str = Field(
        ...,
        description="Start date (YYYY-MM-DD)",
    )

    to_date: str = Field(
        ...,
        description="End date (YYYY-MM-DD)",
    )

    district_id: Optional[int] = Field(
        None,
        description="Optional district ID",
    )

    market_id: Optional[int] = Field(
        None,
        description="Optional market ID",
    )


class CedaQuantitiesResponse(BaseModel):
    """Response containing arrival quantity records from CEDA."""

    success: bool = True

    count: int

    quantities: List[CedaQuantityItem]


# ---------------------------------------------------------------------
# Data Collection
# ---------------------------------------------------------------------

class DataCollectRequest(BaseModel):
    """
    Request schema for triggering agricultural data collection.

    Supports CEDA Agmarknet API parameters as well as
    custom source URL.
    """

    commodity: Optional[str] = Field(
        "Wheat",
        description="Commodity to collect (e.g., Wheat, Rice, Maize)",
    )

    state: Optional[str] = Field(
        None,
        description="Optional state name (e.g., Punjab, Maharashtra)",
    )

    district: Optional[str] = Field(
        None,
        description="Optional district name (e.g., Gurdaspur, Nagpur)",
    )

    market: Optional[str] = Field(
        None,
        description="Optional market name",
    )

    from_date: Optional[str] = Field(
        None,
        description="Optional start date (YYYY-MM-DD)",
    )

    to_date: Optional[str] = Field(
        None,
        description="Optional end date (YYYY-MM-DD)",
    )

    source: Optional[str] = Field(
        "ceda",
        description="Data source to use ('ceda' or 'csv')",
    )

    source_url: Optional[str] = Field(
        None,
        description="Optional custom CSV or API URL",
    )

    limit: Optional[int] = Field(
        100,
        ge=1,
        le=10000,
        description="Max records to ingest in this batch",
    )


class DataCollectResponse(BaseModel):
    """
    Response schema summarizing data collection outcome.

    Follows required format without exposing secrets.
    """

    success: bool = Field(
        ...,
        description="Overall execution status",
    )

    source: str = Field(
        ...,
        description="Data source identifier or name",
    )

    records_fetched: int = Field(
        ...,
        description="Total raw records retrieved from source",
    )

    records_valid: int = Field(
        ...,
        description="Records passing validation",
    )

    records_stored: int = Field(
        ...,
        description="Records inserted or upserted into Supabase",
    )

    records_skipped: int = Field(
        ...,
        description="Records skipped due to validation failure or duplicates",
    )

    message: Optional[str] = Field(
        None,
        description="Descriptive status message",
    )

    records_received: Optional[int] = Field(
        None,
        description="Total raw records received",
    )

    records_rejected: Optional[int] = Field(
        None,
        description="Number of invalid records rejected by validator",
    )

    records_inserted: Optional[int] = Field(
        None,
        description="Number of new records inserted into database",
    )

    records_skipped_as_duplicates: Optional[int] = Field(
        None,
        description="Number of existing records skipped as duplicates or updated",
    )

    final_database_count: Optional[int] = Field(
        None,
        description="Final database record count after ingestion",
    )


# ---------------------------------------------------------------------
# Data Health
# ---------------------------------------------------------------------

class DataHealthResponse(BaseModel):
    """
    Health check response verifying backend,
    external data source, and database.
    """

    status: str = Field(
        "ok",
        description="Overall health status",
    )

    backend: bool = Field(
        True,
        description="FastAPI backend is running",
    )

    data_source_reachable: bool = Field(
        ...,
        description="External agricultural data source is reachable",
    )

    database_connected: bool = Field(
        ...,
        description="Supabase / PostgreSQL connection is active",
    )

    supabase_configured: bool = Field(
        ...,
        description="Whether Supabase environment variables are present",
    )

    details: Optional[dict] = Field(
        default_factory=dict,
        description="Diagnostic details",
    )


# ---------------------------------------------------------------------
# Market Data Record
# ---------------------------------------------------------------------

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


# ---------------------------------------------------------------------
# Market Data Summary
# ---------------------------------------------------------------------

class MarketDataSummaryResponse(BaseModel):
    """Aggregated statistics of stored agricultural market data."""

    total_records: int

    total_grains: int

    total_locations: int

    latest_date: Optional[str] = None


# ---------------------------------------------------------------------
# Data Status
# ---------------------------------------------------------------------

class DataStatusResponse(BaseModel):
    """Status endpoint response matching section 17 requirements."""

    source: str = Field(
        ...,
        description="Data source name",
    )

    database: str = Field(
        ...,
        description="Database target (supabase or postgresql)",
    )

    records_stored: int = Field(
        ...,
        description="Total agricultural records stored",
    )

    latest_record_date: Optional[str] = Field(
        None,
        description="Date of latest record stored",
    )

    commodities: Optional[List[str]] = Field(
        default_factory=list,
        description="List of stored commodities",
    )


# =====================================================================
# 5. LangFlow Tool Schemas (/api/tools/v1/*)
# =====================================================================

class ToolErrorDetail(BaseModel):
    """Machine-readable tool error details."""
    code: str = Field(..., description="Stable error code (e.g. INSUFFICIENT_DATA, NOT_FOUND)")
    message: str = Field(..., description="Human-readable error description")


class ToolSuccessResponse(BaseModel):
    """Standardized success envelope for LangFlow Agent tools."""
    success: bool = True
    tool: str = Field(..., description="Tool identifier name")
    data: Any = Field(..., description="Structured tool output payload")


class ToolFailureResponse(BaseModel):
    """Standardized failure envelope for LangFlow Agent tools."""
    success: bool = False
    tool: str = Field(..., description="Tool identifier name")
    error: ToolErrorDetail = Field(..., description="Error detail object")


class MarketPriceItem(BaseModel):
    """Single mandi price item."""
    commodity: str
    variety: Optional[str] = None
    mandi: str
    district: Optional[str] = None
    state: Optional[str] = None
    record_date: str
    modal_price: float
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    arrival_quantity: Optional[float] = None
    data_source: str


class CropListingItem(BaseModel):
    """Single crop marketplace listing item."""
    id: str
    farmer_id: Optional[str] = None
    name: str
    variety: Optional[str] = None
    category: Optional[str] = None
    quantity: float
    unit: str
    price_per_unit: float
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    quality_grade: Optional[str] = None
    harvest_date: Optional[str] = None
    status: str
    created_at: Optional[str] = None


class BuyerRequirementItem(BaseModel):
    """Single buyer requirement procurement item."""
    id: str
    crop_name: str
    variety: Optional[str] = None
    quantity: float
    unit: str
    target_price: Optional[float] = None
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    urgency: Optional[str] = None
    status: str
    created_at: Optional[str] = None
    