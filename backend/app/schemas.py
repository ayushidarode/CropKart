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
