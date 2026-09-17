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

from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String
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
