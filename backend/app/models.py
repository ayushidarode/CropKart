"""
models.py - SQLAlchemy Database Models for CropKart Marketplace

Defines simple and extensible marketplace models for:
- User (farmers, buyers, transporters)
- Crop (crop catalog)
- BuyerRequirement (demand posted by buyers)
- Offer (supply/listings posted by farmers)
- Order (trade transactions)
- OrderItem (line items within an order)
- Transport (logistics tracking for orders)
- MarketplaceNotification (alerts and notifications for users)
"""

from sqlalchemy import Boolean, Column, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship

try:
    from app.database import Base
except ImportError:
    from database import Base


class User(Base):
    """
    User entity representing farmers, buyers, and platform actors.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mobile = Column(String, nullable=False, unique=True, index=True)
    role = Column(String, nullable=False, default="farmer")  # farmer, buyer, transporter, admin
    location = Column(String, nullable=True)

    # Relationships
    buyer_requirements = relationship("BuyerRequirement", back_populates="buyer")
    offers = relationship("Offer", back_populates="seller")
    orders = relationship("Order", back_populates="buyer")
    notifications = relationship("MarketplaceNotification", back_populates="user")


class Crop(Base):
    """
    Crop catalog entity defining agricultural commodities.
    """
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    category = Column(String, nullable=False)  # e.g., grain, vegetable, fruit, pulse

    # Relationships
    offers = relationship("Offer", back_populates="crop")
    buyer_requirements = relationship("BuyerRequirement", back_populates="crop")
    order_items = relationship("OrderItem", back_populates="crop")


class BuyerRequirement(Base):
    """
    Buyer requirement indicating crop demand and required quantity.
    """
    __tablename__ = "buyer_requirements"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    location = Column(String, nullable=True)
    status = Column(String, nullable=False, default="active")  # active, fulfilled, cancelled

    # Relationships
    buyer = relationship("User", back_populates="buyer_requirements")
    crop = relationship("Crop", back_populates="buyer_requirements")


class Offer(Base):
    """
    Farmer/seller crop listing offer.
    """
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    location = Column(String, nullable=True)
    quality = Column(String, nullable=True)  # e.g., Grade A, Organic, Standard
    status = Column(String, nullable=False, default="available")  # available, reserved, sold

    # Relationships
    seller = relationship("User", back_populates="offers")
    crop = relationship("Crop", back_populates="offers")


class Order(Base):
    """
    Marketplace order representing trade agreements between buyers and sellers.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")  # pending, confirmed, in_transit, completed, cancelled
    pickup_location = Column(String, nullable=True)
    delivery_location = Column(String, nullable=True)

    # Relationships
    buyer = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order")
    transports = relationship("Transport", back_populates="order")


class OrderItem(Base):
    """
    Line items within an order mapping crop, seller, quantity, and price.
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="order_items")
    crop = relationship("Crop", back_populates="order_items")
    seller = relationship("User")


class Transport(Base):
    """
    Logistics and transport tracking assigned to an order.
    """
    __tablename__ = "transports"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    transporter_name = Column(String, nullable=False)
    vehicle_number = Column(String, nullable=False)
    status = Column(String, nullable=False, default="assigned")  # assigned, in_transit, delivered

    # Relationships
    order = relationship("Order", back_populates="transports")


class MarketplaceNotification(Base):
    """
    User alerts and marketplace notifications.
    """
    __tablename__ = "marketplace_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False, default="info")  # match, price_alert, order_update, info
    is_read = Column(Boolean, nullable=False, default=False)

    # Relationships
    user = relationship("User", back_populates="notifications")


# =====================================================================
# Agricultural Market Data Collection Models (Supabase Storage)
# =====================================================================

class DataSource(Base):
    """
    Tracks external government or open data sources.
    WHY: Keeps provenance record of where agricultural data originated.
    """
    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    source_url = Column(Text, nullable=False)
    source_type = Column(String(50), nullable=False, default="csv")
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    market_records = relationship("AgriculturalMarketData", back_populates="source")


class Grain(Base):
    """
    Catalog of distinct grains and agricultural commodities collected.
    WHY: Normalizes commodity names like Wheat, Rice, Maize.
    """
    __tablename__ = "grains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    market_records = relationship("AgriculturalMarketData", back_populates="grain")


class Location(Base):
    """
    Geographic market locations (State, District, Mandi/Market).
    WHY: Normalizes location hierarchy and prevents duplication.
    """
    __tablename__ = "locations"
    __table_args__ = (
        UniqueConstraint("state", "district", "market", name="uq_location_state_district_market"),
    )

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), nullable=False, index=True)
    district = Column(String(100), nullable=False, index=True)
    market = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    market_records = relationship("AgriculturalMarketData", back_populates="location")


class AgriculturalMarketData(Base):
    """
    Core normalized agricultural market records from government data feeds.
    WHY: Stores daily mandi prices (min, max, modal) and arrival volumes.
    Duplicate protection via unique constraint on (source_id, source_record_id).
    """
    __tablename__ = "agricultural_market_data"
    __table_args__ = (
        UniqueConstraint("source_id", "source_record_id", name="uq_source_record"),
    )

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("data_sources.id"), nullable=False, index=True)
    grain_id = Column(Integer, ForeignKey("grains.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    record_date = Column(Date, nullable=False, index=True)
    variety = Column(String(100), nullable=True)
    arrival_quantity = Column(Float, nullable=True)
    minimum_price = Column(Float, nullable=True)
    maximum_price = Column(Float, nullable=True)
    modal_price = Column(Float, nullable=True)
    source_record_id = Column(String(64), nullable=False, index=True)
    collected_at = Column(DateTime, server_default=func.now(), nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    source = relationship("DataSource", back_populates="market_records")
    grain = relationship("Grain", back_populates="market_records")
    location = relationship("Location", back_populates="market_records")

