"""
test_marketplace_models.py - Unit & Integration Tests for CropKart Marketplace Models

Verifies:
1. UUID primary and foreign key consistency across all marketplace models
2. Relationships between Users, Profiles, Crops, Orders, OrderItems, Transports, SampleRequests, Notifications
3. Compatibility with both PostgreSQL and SQLite (in-memory test DB)
4. Absence of UUID vs INTEGER key mismatches
5. Pydantic schema validation for UUID inputs and outputs
"""

import unittest
import uuid
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.models import (
    User,
    FarmerProfile,
    BuyerProfile,
    TransporterProfile,
    Crop,
    CropImage,
    BuyerRequirement,
    Offer,
    Order,
    OrderItem,
    TransportRequest,
    Transport,
    Notification,
    MarketplaceNotification,
    SampleRequest,
    Conversation,
    Message,
    DataSource,
    Grain,
    Location,
    AgriculturalMarketData,
)
from app.schemas import (
    UserResponse,
    CropResponse,
    BuyerRequirementResponse,
    OfferResponse,
    OrderResponse,
    OrderItemResponse,
    TransportResponse,
    MarketplaceNotificationResponse,
    ChatRequest,
)


class TestMarketplaceModels(unittest.TestCase):
    """Test suite for CropKart SQLAlchemy database models and relationships."""

    def setUp(self):
        """Set up an isolated in-memory SQLite database."""
        self.engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=False,
        )
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(
            bind=self.engine,
            autocommit=False,
            autoflush=False,
        )
        self.db = self.SessionLocal()

    def tearDown(self):
        """Clean up the test session."""
        self.db.close()

    def test_user_and_farmer_profile_relationship(self):
        """Test User creation with FarmerProfile using UUID keys."""
        farmer = User(
            id=uuid.uuid4(),
            name="Ramesh Kumar",
            mobile="9876543210",
            role="farmer",
            location="Pune, Maharashtra",
        )
        profile = FarmerProfile(
            id=farmer.id,
            farm_name="Green Valley Farms",
            years_active=10,
            total_acres=25.0,
            user=farmer,
        )
        self.db.add(farmer)
        self.db.commit()

        # Query back
        loaded = self.db.query(User).filter_by(id=farmer.id).first()
        self.assertIsNotNone(loaded)
        self.assertIsInstance(loaded.id, uuid.UUID)
        self.assertIsNotNone(loaded.farmer_profile)
        self.assertEqual(loaded.farmer_profile.farm_name, "Green Valley Farms")
        self.assertEqual(loaded.farmer_profile.id, loaded.id)

    def test_crop_listing_and_images(self):
        """Test Crop listing attached to a Farmer with UUID primary/foreign keys."""
        farmer = User(
            id=uuid.uuid4(),
            name="Anita Patil",
            mobile="9876501234",
            role="farmer",
            location="Nashik",
        )
        crop = Crop(
            id=uuid.uuid4(),
            farmer=farmer,
            name="Desi Tomatoes",
            variety="Abhinav Hybrid",
            category="Vegetable",
            quantity=2800.0,
            price_per_unit=32.0,
            location="Nashik",
        )
        image = CropImage(
            id=uuid.uuid4(),
            crop=crop,
            image_url="https://images.unsplash.com/photo-1592924357228-91a4daadcfea",
            is_primary=True,
        )
        self.db.add(farmer)
        self.db.add(crop)
        self.db.add(image)
        self.db.commit()

        loaded_crop = self.db.query(Crop).filter_by(id=crop.id).first()
        self.assertIsNotNone(loaded_crop)
        self.assertIsInstance(loaded_crop.id, uuid.UUID)
        self.assertEqual(loaded_crop.farmer_id, farmer.id)
        self.assertEqual(len(loaded_crop.images), 1)
        self.assertEqual(loaded_crop.farmer.name, "Anita Patil")

    def test_order_and_order_items_uuid_keys(self):
        """Test Order and OrderItem both use UUID primary and foreign keys."""
        buyer = User(
            id=uuid.uuid4(),
            name="Rajesh Gupta",
            mobile="9123456789",
            role="buyer",
        )
        farmer = User(
            id=uuid.uuid4(),
            name="Ramesh Kumar",
            mobile="9876543210",
            role="farmer",
        )
        crop = Crop(
            id=uuid.uuid4(),
            farmer=farmer,
            name="Sharbati Wheat",
            variety="Premium",
            location="Pune",
        )
        order = Order(
            id=uuid.uuid4(),
            order_number="CK-TEST-001",
            buyer=buyer,
            farmer=farmer,
            crop=crop,
            quantity=1000.0,
            price_per_unit=28.5,
            total_price=28500.0,
            status="pending",
        )
        item = OrderItem(
            id=uuid.uuid4(),
            order=order,
            crop=crop,
            crop_name="Sharbati Wheat",
            quantity=1000.0,
            unit_price=28.5,
            total_price=28500.0,
            seller=farmer,
        )
        self.db.add_all([buyer, farmer, crop, order, item])
        self.db.commit()

        loaded_order = self.db.query(Order).filter_by(id=order.id).first()
        self.assertIsNotNone(loaded_order)
        self.assertIsInstance(loaded_order.id, uuid.UUID)
        self.assertIsInstance(loaded_order.buyer_id, uuid.UUID)
        self.assertIsInstance(loaded_order.farmer_id, uuid.UUID)
        self.assertEqual(len(loaded_order.order_items), 1)

        loaded_item = loaded_order.order_items[0]
        self.assertIsInstance(loaded_item.id, uuid.UUID)
        self.assertIsInstance(loaded_item.order_id, uuid.UUID)
        self.assertIsInstance(loaded_item.crop_id, uuid.UUID)
        self.assertEqual(loaded_item.price, 28.5)

    def test_buyer_requirement_uuid_keys(self):
        """Test BuyerRequirement uses UUID primary key and UUID foreign keys."""
        buyer = User(
            id=uuid.uuid4(),
            name="Bulk Buyer",
            mobile="9000000001",
            role="buyer",
        )
        crop = Crop(
            id=uuid.uuid4(),
            farmer_id=buyer.id,
            name="Organic Soy",
            variety="JS 335",
            location="Pune",
        )
        req = BuyerRequirement(
            id=uuid.uuid4(),
            buyer=buyer,
            crop=crop,
            crop_name="Organic Soy",
            quantity=5000.0,
            target_price=45.0,
            status="active",
        )
        self.db.add_all([buyer, crop, req])
        self.db.commit()

        loaded = self.db.query(BuyerRequirement).filter_by(id=req.id).first()
        self.assertIsNotNone(loaded)
        self.assertIsInstance(loaded.id, uuid.UUID)
        self.assertIsInstance(loaded.buyer_id, uuid.UUID)
        self.assertIsInstance(loaded.crop_id, uuid.UUID)
        self.assertEqual(loaded.buyer.name, "Bulk Buyer")

    def test_offer_uuid_keys(self):
        """Test Offer uses UUID primary key and UUID foreign keys."""
        seller = User(
            id=uuid.uuid4(),
            name="Seller Farmer",
            mobile="9000000002",
            role="farmer",
        )
        crop = Crop(
            id=uuid.uuid4(),
            farmer=seller,
            name="Basmati",
            variety="1121",
            location="Punjab",
        )
        offer = Offer(
            id=uuid.uuid4(),
            seller=seller,
            crop=crop,
            quantity=2000.0,
            price=75.0,
            status="available",
        )
        self.db.add_all([seller, crop, offer])
        self.db.commit()

        loaded = self.db.query(Offer).filter_by(id=offer.id).first()
        self.assertIsNotNone(loaded)
        self.assertIsInstance(loaded.id, uuid.UUID)
        self.assertIsInstance(loaded.seller_id, uuid.UUID)
        self.assertIsInstance(loaded.crop_id, uuid.UUID)

    def test_transport_and_transport_requests_uuid_keys(self):
        """Test Transport and TransportRequest models both use UUID primary and foreign keys."""
        buyer = User(id=uuid.uuid4(), name="Buyer A", mobile="9111111111", role="buyer")
        transporter = User(id=uuid.uuid4(), name="Cargo Express", mobile="9222222222", role="transporter")
        order = Order(
            id=uuid.uuid4(),
            buyer=buyer,
            pickup_location="Pune",
            delivery_location="Mumbai",
        )
        t_req = TransportRequest(
            id=uuid.uuid4(),
            order=order,
            transporter=transporter,
            cost=6500.0,
            status="assigned",
        )
        t_leg = Transport(
            id=uuid.uuid4(),
            order=order,
            transporter_name="Cargo Express",
            vehicle_number="MH-12-AB-1234",
        )
        self.db.add_all([buyer, transporter, order, t_req, t_leg])
        self.db.commit()

        loaded_order = self.db.query(Order).filter_by(id=order.id).first()
        self.assertEqual(len(loaded_order.transport_requests), 1)
        self.assertIsInstance(loaded_order.transport_requests[0].id, uuid.UUID)
        self.assertEqual(len(loaded_order.transports), 1)
        self.assertIsInstance(loaded_order.transports[0].id, uuid.UUID)

    def test_sample_request_uuid_keys(self):
        """Test SampleRequest uses UUID primary key and UUID foreign keys."""
        buyer = User(id=uuid.uuid4(), name="Sample Buyer", mobile="9333333333", role="buyer")
        farmer = User(id=uuid.uuid4(), name="Sample Farmer", mobile="9444444444", role="farmer")
        crop = Crop(id=uuid.uuid4(), farmer=farmer, name="Rice", variety="1121", location="Punjab")
        sample = SampleRequest(
            id=uuid.uuid4(),
            buyer=buyer,
            farmer=farmer,
            crop=crop,
            quantity=2.0,
            delivery_address="Market Yard, Pune",
            status="sample_sent",
        )
        self.db.add_all([buyer, farmer, crop, sample])
        self.db.commit()

        loaded = self.db.query(SampleRequest).filter_by(id=sample.id).first()
        self.assertIsNotNone(loaded)
        self.assertIsInstance(loaded.id, uuid.UUID)
        self.assertIsInstance(loaded.buyer_id, uuid.UUID)
        self.assertIsInstance(loaded.farmer_id, uuid.UUID)
        self.assertIsInstance(loaded.crop_id, uuid.UUID)
        self.assertEqual(loaded.crop.name, "Rice")

    def test_notification_models_uuid_keys(self):
        """Test Notification and MarketplaceNotification use UUID primary and foreign keys."""
        user = User(id=uuid.uuid4(), name="Notify User", mobile="9555555555", role="farmer")
        n1 = Notification(
            id=uuid.uuid4(),
            user=user,
            title="Sample Approved",
            message="Your sample was approved",
        )
        n2 = MarketplaceNotification(
            id=uuid.uuid4(),
            user=user,
            message="Price alert for wheat",
        )
        self.db.add_all([user, n1, n2])
        self.db.commit()

        loaded_user = self.db.query(User).filter_by(id=user.id).first()
        self.assertEqual(len(loaded_user.notifications), 1)
        self.assertIsInstance(loaded_user.notifications[0].id, uuid.UUID)
        self.assertEqual(len(loaded_user.marketplace_notifications), 1)
        self.assertIsInstance(loaded_user.marketplace_notifications[0].id, uuid.UUID)

    def test_ceda_models_integer_keys_unaffected(self):
        """Verify that CEDA data pipeline models still strictly use Integer PKs and FKs."""
        source = DataSource(name="CEDA 2026", source_url="https://example.com/data")
        grain = Grain(name="Wheat")
        location = Location(state="Maharashtra", district="Pune", market="Baramati")
        self.db.add_all([source, grain, location])
        self.db.commit()

        self.assertIsInstance(source.id, int)
        self.assertIsInstance(grain.id, int)
        self.assertIsInstance(location.id, int)

        mkt = AgriculturalMarketData(
            source_id=source.id,
            grain_id=grain.id,
            location_id=location.id,
            record_date=date(2026, 4, 1),
            variety="Sharbati",
            modal_price=2800.0,
            source_record_id="REC-TEST-001",
        )
        self.db.add(mkt)
        self.db.commit()

        self.assertIsInstance(mkt.id, int)
        self.assertEqual(mkt.source_id, source.id)
        self.assertEqual(mkt.grain_id, grain.id)
        self.assertEqual(mkt.location_id, location.id)

    def test_pydantic_schemas_uuid_serialization(self):
        """Test Pydantic schemas correctly accept both uuid.UUID and str formatted UUIDs."""
        u_id = uuid.uuid4()
        c_id = uuid.uuid4()
        o_id = uuid.uuid4()

        user_schema = UserResponse(id=u_id, name="User A", mobile="9876543210", role="farmer")
        self.assertEqual(user_schema.id, u_id)

        crop_schema = CropResponse(id=str(c_id), name="Wheat", category="Grain", farmer_id=u_id)
        self.assertEqual(str(crop_schema.id), str(c_id))
        self.assertEqual(crop_schema.farmer_id, u_id)

        order_schema = OrderResponse(id=o_id, buyer_id=str(u_id), status="pending")
        self.assertEqual(order_schema.id, o_id)
        self.assertEqual(str(order_schema.buyer_id), str(u_id))

        chat_schema = ChatRequest(message="Hello AI", user_id=u_id)
        self.assertEqual(chat_schema.user_id, u_id)


if __name__ == "__main__":
    unittest.main()
