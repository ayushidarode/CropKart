import os
import requests
from dotenv import load_dotenv


# ============================================================
# CONFIG
# ============================================================

load_dotenv("backend/.env")

API_KEY = os.getenv("CEDA_API_KEY")
BASE_URL = "https://api.ceda.ashoka.edu.in/v1"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json",
}

print("API key loaded:", bool(API_KEY))

if not API_KEY:
    raise SystemExit("CEDA_API_KEY not found in backend/.env")


# ============================================================
# HELPERS
# ============================================================

def test_get(endpoint):
    print("\n" + "=" * 60)
    print(f"GET {endpoint}")
    print("=" * 60)

    try:
        response = requests.get(
            f"{BASE_URL}{endpoint}",
            headers=HEADERS,
            timeout=30,
        )

        print("HTTP status:", response.status_code)
        print("Response:")
        print(response.text[:3000])

        try:
            return response.json()
        except ValueError:
            return None

    except requests.RequestException as e:
        print("REQUEST ERROR:", e)
        return None


def test_post(endpoint, payload):
    print("\n" + "=" * 60)
    print(f"POST {endpoint}")
    print("=" * 60)

    print("Request:")
    print(payload)

    try:
        response = requests.post(
            f"{BASE_URL}{endpoint}",
            headers=HEADERS,
            json=payload,
            timeout=60,
        )

        print("HTTP status:", response.status_code)
        print("Response:")
        print(response.text[:5000])

        try:
            return response.json()
        except ValueError:
            return None

    except requests.Timeout:
        print("REQUEST TIMEOUT: CEDA server did not respond within 60 seconds.")
        return None

    except requests.RequestException as e:
        print("REQUEST ERROR:", e)
        return None


# ============================================================
# 1. GET COMMODITIES
# ============================================================

commodities_response = test_get(
    "/agmarknet/commodities"
)

if not commodities_response:
    raise SystemExit("Could not retrieve commodities.")


commodity_data = (
    commodities_response
    .get("output", {})
    .get("data", [])
)

print("\nTotal commodities found:", len(commodity_data))


# Find Wheat
wheat = next(
    (
        item
        for item in commodity_data
        if item.get("commodity_name", "").strip().lower() == "wheat"
    ),
    None
)

if not wheat:
    raise SystemExit("Wheat was not found in commodity list.")


print("\nSelected commodity:")
print(wheat)

commodity_id = wheat["commodity_id"]


# ============================================================
# 2. GET GEOGRAPHIES
# ============================================================

geo_response = test_get(
    "/agmarknet/geographies"
)

if not geo_response:
    raise SystemExit("Could not retrieve geographies.")


geo_data = (
    geo_response
    .get("output", {})
    .get("data", [])
)

print("\nTotal geography records found:", len(geo_data))


# Find Maharashtra + Nagpur
nagpur = next(
    (
        row
        for row in geo_data
        if row.get("census_state_name", "").strip().lower() == "maharashtra"
        and row.get("census_district_name", "").strip().lower() == "nagpur"
    ),
    None
)

if not nagpur:
    raise SystemExit("Maharashtra / Nagpur was not found.")


print("\nSelected geography:")
print(nagpur)

state_id = nagpur["census_state_id"]
district_id = nagpur["census_district_id"]

print("\nSelected IDs:")
print("State ID   :", state_id)
print("District ID:", district_id)


# ============================================================
# 3. GET MARKETS FOR WHEAT + NAGPUR
# ============================================================

markets_payload = {
    "commodity_id": commodity_id,
    "state_id": state_id,
    "district_id": district_id,
    "indicator": "price",
}

markets_response = test_post(
    "/agmarknet/markets",
    markets_payload
)

if not markets_response:
    raise SystemExit(
        "No response received from markets endpoint."
    )


output = markets_response.get("output", {})

print("\n" + "=" * 60)
print("MARKET RESULT")
print("=" * 60)

print("Response type:", output.get("type"))
print("Message:", output.get("message"))

market_data = output.get("data", [])

if not market_data:
    raise SystemExit("No markets returned by CEDA.")


print("\nMarkets found:", len(market_data))

for market in market_data:
    print(
        f"ID: {market['market_id']} | "
        f"Name: {market['market_name']}"
    )

# ============================================================
# 4. GET PRICES
# ============================================================

# Use all markets returned by CEDA
price_market_ids = [
    market["market_id"]
    for market in market_data
]

prices_payload = {
    "commodity_id": commodity_id,
    "state_id": state_id,
    "district_id": [district_id],
    "market_id": price_market_ids,
    "from_date": "2025-03-01",
    "to_date": "2025-06-01",
}

prices_response = test_post(
    "/agmarknet/prices",
    prices_payload
)


# ============================================================
# 5. DISPLAY PRICE RESULTS
# ============================================================

print("\n" + "=" * 60)
print("PRICE RESULT")
print("=" * 60)

if not prices_response:
    print("No response received from Prices API.")

else:
    price_data = (
        prices_response
        .get("output", {})
        .get("data", [])
    )

    if price_data:
        print("Price records found:", len(price_data))

        for price in price_data:
            print(price)

    else:
        print("No price records returned.")
        print("\nFull response:")
        print(prices_response)