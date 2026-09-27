"""
test_location_service.py - Verification script for CropKart Location Service
"""

import asyncio
import httpx
from app.main import app

async def run_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        print("\n--- Test 1: Health Endpoint ---")
        res = await client.get("/health")
        print(f"Status: {res.status_code}, Response: {res.json()}")
        assert res.status_code == 200

        print("\n--- Test 2: Valid Address: 'Nagpur, Maharashtra' ---")
        res = await client.post("/api/location/geocode", json={"address": "Nagpur, Maharashtra"})
        print(f"Status: {res.status_code}, Response: {res.json()}")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["latitude"] is not None
        assert data["longitude"] is not None
        assert "Nagpur" in data["display_name"]
        print(f"  -> Coordinates: ({data['latitude']}, {data['longitude']})")

        # Brief pause to respect Nominatim 1 req/sec policy
        await asyncio.sleep(1.2)

        print("\n--- Test 3: Valid Address: 'Delhi, India' ---")
        res = await client.post("/api/location/geocode", json={"address": "Delhi, India"})
        print(f"Status: {res.status_code}, Response: {res.json()}")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["latitude"] is not None
        assert data["longitude"] is not None
        print(f"  -> Coordinates: ({data['latitude']}, {data['longitude']})")

        print("\n--- Test 4: Empty Address: '' ---")
        res = await client.post("/api/location/geocode", json={"address": ""})
        print(f"Status: {res.status_code}, Response: {res.json()}")
        assert res.status_code == 422  # Pydantic validation error

        print("\n--- Test 5: Whitespace Address: '   ' ---")
        res = await client.post("/api/location/geocode", json={"address": "   "})
        print(f"Status: {res.status_code}, Response: {res.json()}")
        assert res.status_code == 422  # Pydantic validation error

        # Brief pause before next Nominatim request
        await asyncio.sleep(1.2)

        print("\n--- Test 6: Invalid/Unresolvable Address: 'xyzabc_random_location_12345' ---")
        res = await client.post("/api/location/geocode", json={"address": "xyzabc_random_location_12345"})
        print(f"Status: {res.status_code}, Response: {res.json()}")
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is False
        assert data["latitude"] is None
        assert data["longitude"] is None
        assert data["message"] == "Location not found"

        print("\n--- Test 7: Simulated Nominatim Timeout ---")
        from app.integrations.location.nominatim import NominatimAdapter, NominatimTimeoutError
        from app.services.location_service import LocationService, location_service

        class MockTimeoutAdapter(NominatimAdapter):
            async def search(self, address: str):
                raise NominatimTimeoutError("Simulated timeout")

        # Temporarily swap adapter on singleton service
        orig_adapter = location_service.adapter
        location_service.adapter = MockTimeoutAdapter()
        try:
            res = await client.post("/api/location/geocode", json={"address": "Pune, Maharashtra"})
            print(f"Status: {res.status_code}, Response: {res.json()}")
            assert res.status_code == 503
            assert "temporarily unavailable" in res.json()["detail"]
        finally:
            location_service.adapter = orig_adapter

        print("\n[SUCCESS] ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
