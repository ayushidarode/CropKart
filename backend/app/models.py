"""
models.py - SQLAlchemy Database Models for CropKart Marketplace & CEDA Data Pipeline

Defines:
- User, FarmerProfile, BuyerProfile, TransporterProfile
- Crop, CropImage
- BuyerRequirement
- Offer
- Order, OrderItem
- TransportRequest, Transport
- Notification, MarketplaceNotification
- SampleRequest
- Conversation, Message
- MarketData, ForecastResult, RouteEstimate
- DataSource, Grain, Location, AgriculturalMarketData
"""

import uuid
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import relationship

try:
    from app.database import Base
except ImportError:
    from database import Base


# ============================================================
# USERS & PROFILES
# ============================================================

class User(Base):
    """
    User entity representing farmers, buyers, transporters,
    and platform administrators.

    Supabase users.id is UUID, so all foreign keys pointing
    to users.id must also use UUID.
    """

    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String, nullable=True)
    name = Column(String, nullable=False)
    mobile = Column(String, nullable=True, unique=True, index=True)
    role = Column(
        String,
        nullable=False,
        default="farmer",
    )  # farmer, buyer, transporter, admin
    location = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Profile Relationships
    farmer_profile = relationship(
        "FarmerProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    buyer_profile = relationship(
        "BuyerProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    transporter_profile = relationship(
        "TransporterProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    # Activity Relationships
    crops = relationship(
        "Crop",
        back_populates="farmer",
        cascade="all, delete-orphan",
        foreign_keys="Crop.farmer_id",
    )

    buyer_requirements = relationship(
        "BuyerRequirement",
        back_populates="buyer",
        cascade="all, delete-orphan",
        foreign_keys="BuyerRequirement.buyer_id",
    )

    offers = relationship(
        "Offer",
        back_populates="seller",
        cascade="all, delete-orphan",
        foreign_keys="Offer.seller_id",
    )

    orders = relationship(
        "Order",
        back_populates="buyer",
        foreign_keys="Order.buyer_id",
    )

    sales_orders = relationship(
        "Order",
        back_populates="farmer",
        foreign_keys="Order.farmer_id",
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="Notification.user_id",
    )

    marketplace_notifications = relationship(
        "MarketplaceNotification",
        back_populates="user",
        cascade="all, delete-orphan",
        foreign_keys="MarketplaceNotification.user_id",
    )


class FarmerProfile(Base):
    """
    Detailed profile information for verified agricultural producers.
    """

    __tablename__ = "farmer_profiles"

    id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    farm_name = Column(String, nullable=False)
    years_active = Column(Integer, default=5)
    total_acres = Column(Float, default=10.0)
    is_verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.80)
    review_count = Column(Integer, default=12)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    upi_id = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="farmer_profile")


class BuyerProfile(Base):
    """
    Detailed commercial profile for institutional & wholesale buyers.
    """

    __tablename__ = "buyer_profiles"

    id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    company_name = Column(String, nullable=False)
    business_type = Column(String, default="Wholesaler")
    gst_number = Column(String, nullable=True)
    is_verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.90)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="buyer_profile")


class TransporterProfile(Base):
    """
    Fleet and capability details for certified logistics providers.
    """

    __tablename__ = "transporter_profiles"

    id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    company_name = Column(String, nullable=False)
    vehicle_type = Column(String, default="Eicher 14ft Canter")
    vehicle_number = Column(String, nullable=True)
    capacity_tonnes = Column(Float, default=7.5)
    is_verified = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="transporter_profile")


# ============================================================
# CROPS & CATALOG
# ============================================================

class Crop(Base):
    """
    Crop catalog entity and farmer harvest listing.
    """

    __tablename__ = "crops"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    farmer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String, nullable=False, index=True)
    variety = Column(String, nullable=False)
    category = Column(
        String,
        nullable=False,
        default="Grain",
        index=True,
    )  # Grain, Vegetable, Fruit, Pulse, Oilseed, Commercial, Spices
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String, nullable=False, default="kg")
    price_per_unit = Column(Float, nullable=False, default=0.0)
    quality_grade = Column(String, nullable=False, default="Grade A")
    organic = Column(Boolean, default=False)
    harvest_date = Column(Date, nullable=True)
    available_from = Column(Date, nullable=True)
    location = Column(String, nullable=False)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    moisture_percent = Column(Float, nullable=True)
    storage_type = Column(String, nullable=True, default="Dry Warehouse")
    fertilizers_used = Column(Text, nullable=True)
    status = Column(
        String,
        nullable=False,
        default="available",
        index=True,
    )  # available, reserved, sold, draft
    primary_image_url = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    farmer = relationship("User", back_populates="crops", foreign_keys=[farmer_id])
    images = relationship("CropImage", back_populates="crop", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="crop", cascade="all, delete-orphan")
    buyer_requirements = relationship("BuyerRequirement", back_populates="crop")
    order_items = relationship("OrderItem", back_populates="crop")
    sample_requests = relationship("SampleRequest", back_populates="crop")


class CropImage(Base):
    """
    Visual assets and quality photographs of listed crops.
    """

    __tablename__ = "crop_images"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("crops.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    image_url = Column(Text, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    crop = relationship("Crop", back_populates="images")


# ============================================================
# BUYER REQUIREMENTS
# ============================================================

class BuyerRequirement(Base):
    """
    Buyer requirement indicating crop demand and specifications.
    Uses UUID primary key aligned with Supabase schema.
    """

    __tablename__ = "buyer_requirements"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # UUID because users.id is UUID
    buyer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Optional UUID link to a specific crop catalog item
    crop_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("crops.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    crop_name = Column(String, nullable=True)
    variety = Column(String, nullable=True)
    category = Column(String, nullable=True, default="Grain")
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=True, default="kg")
    target_price = Column(Float, nullable=True)
    location = Column(String, nullable=True)
    district = Column(String, nullable=True)
    state = Column(String, nullable=True)
    urgency = Column(String, nullable=True, default="within_15_days")

    status = Column(
        String,
        nullable=False,
        default="active",
    )  # active, fulfilled, cancelled

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    buyer = relationship(
        "User",
        back_populates="buyer_requirements",
        foreign_keys=[buyer_id],
    )

    crop = relationship(
        "Crop",
        back_populates="buyer_requirements",
        foreign_keys=[crop_id],
    )


# ============================================================
# OFFERS
# ============================================================

class Offer(Base):
    """
    Farmer/seller crop listing offer.
    Uses UUID primary key aligned with all marketplace entities.
    """

    __tablename__ = "offers"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # UUID because users.id is UUID
    seller_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # UUID because crops.id is UUID
    crop_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("crops.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    location = Column(String, nullable=True)
    quality = Column(
        String,
        nullable=True,
    )  # Grade A, Organic, Standard

    status = Column(
        String,
        nullable=False,
        default="available",
    )  # available, reserved, sold

    # Relationships
    seller = relationship(
        "User",
        back_populates="offers",
        foreign_keys=[seller_id],
    )

    crop = relationship(
        "Crop",
        back_populates="offers",
        foreign_keys=[crop_id],
    )


# ============================================================
# ORDERS
# ============================================================

class Order(Base):
    """
    Marketplace order representing trade agreements
    between buyers and sellers.
    """

    __tablename__ = "orders"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    order_number = Column(String, unique=True, nullable=True)

    # UUID because users.id is UUID
    buyer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    farmer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )

    crop_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("crops.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    quantity = Column(Float, nullable=True)
    unit = Column(String, nullable=True, default="kg")
    price_per_unit = Column(Float, nullable=True)
    total_price = Column(Float, nullable=True)
    pickup_location = Column(String, nullable=True)
    delivery_location = Column(String, nullable=True)

    status = Column(
        String,
        nullable=False,
        default="pending",
    )  # pending, accepted, processing, ready_for_pickup, picked_up, in_transit, delivered, cancelled

    payment_status = Column(
        String,
        nullable=True,
        default="pending",
    )  # pending, escrow, paid, failed, refunded

    payment_method = Column(String, nullable=True, default="upi")
    notes = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    buyer = relationship(
        "User",
        foreign_keys=[buyer_id],
        back_populates="orders",
    )

    farmer = relationship(
        "User",
        foreign_keys=[farmer_id],
        back_populates="sales_orders",
    )

    crop = relationship("Crop")

    order_items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    transport_requests = relationship(
        "TransportRequest",
        back_populates="order",
        cascade="all, delete-orphan",
    )

    transports = relationship(
        "Transport",
        back_populates="order",
        cascade="all, delete-orphan",
    )


# ============================================================
# ORDER ITEMS
# ============================================================

class OrderItem(Base):
    """
    Line items within an order mapping crop,
    seller, quantity, and price.
    Uses UUID primary key aligned with Supabase orders and crops.
    """

    __tablename__ = "order_items"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # UUID because orders.id is UUID in Supabase
    order_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # UUID because crops.id is UUID in Supabase
    crop_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("crops.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    crop_name = Column(String, nullable=True)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=True)
    total_price = Column(Float, nullable=True)

    # UUID seller reference
    seller_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Relationships
    order = relationship(
        "Order",
        back_populates="order_items",
    )

    crop = relationship(
        "Crop",
        back_populates="order_items",
    )

    seller = relationship("User", foreign_keys=[seller_id])

    @property
    def price(self) -> float:
        """Compatibility accessor for legacy price property."""
        return self.unit_price if self.unit_price is not None else 0.0

    @price.setter
    def price(self, val: float):
        self.unit_price = val


# ============================================================
# TRANSPORT & LOGISTICS
# ============================================================

class TransportRequest(Base):
    """
    Transport assignment and fulfillment request linked to an order.
    Matches the Supabase transport_requests table.
    """

    __tablename__ = "transport_requests"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    order_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    transporter_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    pickup_location = Column(String, nullable=True)
    delivery_location = Column(String, nullable=True)
    distance_km = Column(Float, nullable=True)
    estimated_hours = Column(Float, nullable=True)
    vehicle_type = Column(String, nullable=True)
    vehicle_number = Column(String, nullable=True)
    cost = Column(Float, nullable=True)

    status = Column(
        String,
        nullable=False,
        default="pending",
    )  # pending, assigned, accepted, picked_up, in_transit, delivered, cancelled

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order = relationship("Order", back_populates="transport_requests")
    transporter = relationship("User", foreign_keys=[transporter_id])


class Transport(Base):
    """
    Logistics tracking assigned to an order.
    Uses UUID primary key aligned with orders.
    """

    __tablename__ = "transports"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    order_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    transporter_name = Column(String, nullable=False)
    vehicle_number = Column(String, nullable=False)
    status = Column(
        String,
        nullable=False,
        default="assigned",
    )  # assigned, in_transit, delivered

    order = relationship("Order", back_populates="transports")


# ============================================================
# NOTIFICATIONS
# ============================================================

class Notification(Base):
    """
    Core notification entity matching Supabase notifications table.
    """

    __tablename__ = "notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    type = Column(
        String,
        nullable=False,
        default="info",
    )  # sample_request, sample_status, order_new, order_status, transport_update, info
    link = Column(String, nullable=True)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User", back_populates="notifications")


class MarketplaceNotification(Base):
    """
    User alerts and marketplace notifications.
    Uses UUID primary key aligned with users.
    """

    __tablename__ = "marketplace_notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    user_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    message = Column(String, nullable=False)
    type = Column(
        String,
        nullable=False,
        default="info",
    )  # match, price_alert, order_update, info

    is_read = Column(Boolean, nullable=False, default=False)

    user = relationship("User", back_populates="marketplace_notifications")


# ============================================================
# SAMPLE REQUESTS
# ============================================================

class SampleRequest(Base):
    """
    Buyer quality verification sample request workflow before bulk purchase.
    """

    __tablename__ = "sample_requests"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    buyer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    farmer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    crop_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("crops.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    quantity = Column(Float, nullable=True, default=1.0)
    unit = Column(String, nullable=True, default="kg")
    delivery_address = Column(String, nullable=False)
    tracking_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    status = Column(
        String,
        nullable=False,
        default="sample_requested",
    )  # sample_requested, sample_accepted, sample_rejected, sample_sent, sample_received, approved, rejected

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    buyer = relationship("User", foreign_keys=[buyer_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
    crop = relationship("Crop", back_populates="sample_requests")


# ============================================================
# CONVERSATIONS & DIRECT MESSAGES
# ============================================================

class Conversation(Base):
    """
    Direct messaging channel between buyer and farmer regarding a crop listing.
    """

    __tablename__ = "conversations"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("crops.id", ondelete="SET NULL"),
        nullable=True,
    )
    buyer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    farmer_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    last_message_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    crop = relationship("Crop")
    buyer = relationship("User", foreign_keys=[buyer_id])
    farmer = relationship("User", foreign_keys=[farmer_id])
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
    )


class Message(Base):
    """
    Individual chat messages in a trade negotiation conversation.
    """

    __tablename__ = "messages"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
    )
    sender_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User")


# ============================================================
# AGRICULTURAL MARKET DATA & CEDA INTEGRATION (INTEGER KEYS)
# ============================================================

class DataSource(Base):
    """
    Tracks external government or open data sources (CEDA, Agmarknet).
    Uses Integer primary key.
    """

    __tablename__ = "data_sources"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    source_url = Column(
        Text,
        nullable=False,
    )

    source_type = Column(
        String(50),
        nullable=False,
        default="csv",
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    market_records = relationship(
        "AgriculturalMarketData",
        back_populates="source",
    )


class Grain(Base):
    """
    Catalog of distinct grains and agricultural commodities.
    Uses Integer primary key.
    """

    __tablename__ = "grains"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    market_records = relationship(
        "AgriculturalMarketData",
        back_populates="grain",
    )


class Location(Base):
    """
    Geographic market locations: State, District, Mandi.
    Uses Integer primary key.
    """

    __tablename__ = "locations"

    __table_args__ = (
        UniqueConstraint(
            "state",
            "district",
            "market",
            name="uq_location_state_district_market",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    state = Column(
        String(100),
        nullable=False,
        index=True,
    )

    district = Column(
        String(100),
        nullable=False,
        index=True,
    )

    market = Column(
        String(100),
        nullable=False,
        index=True,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    market_records = relationship(
        "AgriculturalMarketData",
        back_populates="location",
    )


class AgriculturalMarketData(Base):
    """
    Core normalized agricultural market records
    from CEDA and government feeds.
    Uses Integer foreign keys linking to data_sources, grains, locations.
    """

    __tablename__ = "agricultural_market_data"

    __table_args__ = (
        UniqueConstraint(
            "source_id",
            "source_record_id",
            name="uq_source_record",
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    source_id = Column(
        Integer,
        ForeignKey("data_sources.id"),
        nullable=False,
        index=True,
    )

    grain_id = Column(
        Integer,
        ForeignKey("grains.id"),
        nullable=False,
        index=True,
    )

    location_id = Column(
        Integer,
        ForeignKey("locations.id"),
        nullable=False,
        index=True,
    )

    record_date = Column(
        Date,
        nullable=False,
        index=True,
    )

    variety = Column(
        String(100),
        nullable=True,
    )

    arrival_quantity = Column(
        Float,
        nullable=True,
    )

    minimum_price = Column(
        Float,
        nullable=True,
    )

    maximum_price = Column(
        Float,
        nullable=True,
    )

    modal_price = Column(
        Float,
        nullable=True,
    )

    source_record_id = Column(
        String(64),
        nullable=False,
        index=True,
    )

    collected_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    created_at = Column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    source = relationship(
        "DataSource",
        back_populates="market_records",
    )

    grain = relationship(
        "Grain",
        back_populates="market_records",
    )

    location = relationship(
        "Location",
        back_populates="market_records",
    )


# ============================================================
# MARKET ANALYTICS (SUPABASE SCHEMA)
# ============================================================

class MarketData(Base):
    """
    Public market data records in Supabase format.
    """

    __tablename__ = "market_data"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    commodity = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    mandi = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    record_date = Column(Date, nullable=False)
    arrival_quantity = Column(Float, nullable=True)
    minimum_price = Column(Float, nullable=True)
    maximum_price = Column(Float, nullable=True)
    modal_price = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ForecastResult(Base):
    """
    ML/statistical price and demand forecasts.
    """

    __tablename__ = "forecast_results"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crop = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    mandi = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    predicted_price_next_7d = Column(Float, nullable=False)
    predicted_demand_next_7d = Column(String, nullable=False)
    confidence = Column(Float, default=0.85)
    trend_direction = Column(String, default="up")
    festival_tag = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RouteEstimate(Base):
    """
    Optimal freight route distance and cost calculations.
    """

    __tablename__ = "route_estimates"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    distance_km = Column(Float, nullable=False)
    duration_hours = Column(Float, nullable=False)
    recommended_vehicle = Column(String, nullable=True)
    estimated_cost = Column(Float, nullable=True)
    status = Column(String, default="optimal")
    created_at = Column(DateTime(timezone=True), server_default=func.now())