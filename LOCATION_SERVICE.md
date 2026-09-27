# CropKart Location Service Documentation

A simple, beginner-friendly guide to the CropKart Location Service backend.

---

## 1. What the Location Service Does

The Location Service converts human-readable address text (such as `"Nagpur, Maharashtra"`) into exact geographic coordinates:
- **Latitude** (north/south)
- **Longitude** (east/west)
- **Resolved Display Name** (official location name)

This enables CropKart to locate farmers, buyers, and crops geographically so maps and distance features can be added in future phases.

---

## 2. Why Nominatim is Used

- **OpenStreetMap (OSM)**: Open-source, community-driven global map data.
- **Nominatim**: The official search engine for OpenStreetMap.
- **Free for Testing**: Does not require proprietary commercial platforms.
- **Privacy & Simplicity**: Simple REST API with no proprietary SDK bloat.

---

## 3. Is an API Key Required?

**No API key is required.**
The service connects to the public OpenStreetMap Nominatim endpoint.
It includes a polite `User-Agent` header (`CropKart/1.0`) and follows OpenStreetMap fair use policies.

---

## 4. Request Format

- **HTTP Method**: `POST`
- **URL**: `http://localhost:8000/api/location/geocode`
- **Header**: `Content-Type: application/json`

### Request Body
```json
{
  "address": "Nagpur, Maharashtra"
}
```

### Validation Rules
- `address` cannot be empty.
- Whitespace is automatically trimmed.
- Maximum length is 500 characters.

---

## 5. Response Format

### Success (HTTP 200)
```json
{
  "success": true,
  "address": "Nagpur, Maharashtra",
  "latitude": 21.1498134,
  "longitude": 79.0820556,
  "display_name": "Nagpur City, Nagpur Urban Taluka, Nagpur, Maharashtra, India",
  "message": null
}
```

### Address Not Found (HTTP 200)
```json
{
  "success": false,
  "address": "xyzabc_random_location_12345",
  "latitude": null,
  "longitude": null,
  "display_name": null,
  "message": "Location not found"
}
```

### Validation Error (HTTP 422)
When an empty string `""` or invalid data is provided:
```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "address"],
      "msg": "String should have at least 1 character"
    }
  ]
}
```

### Service Error / Timeout (HTTP 503)
When Nominatim is unreachable or times out:
```json
{
  "detail": "Location service is temporarily unavailable. Please try again later."
}
```

---

## 6. How to Run the Backend

Make sure you are using `uv`:

```bash
# From the repository root
uv run uvicorn app.main:app --reload --port 8000
```

Or from the `backend/` directory:

```bash
cd backend
uv run uvicorn app.main:app --reload --port 8000
```

The server will be available at `http://127.0.0.1:8000`.

---

## 7. How to Test

### Option A: Interactive Swagger UI
Open your browser and navigate to:
`http://localhost:8000/docs`
Locate **Location Services** -> `POST /api/location/geocode`, click **Try it out**, enter an address, and click **Execute**.

### Option B: PowerShell
```powershell
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8000/api/location/geocode" -ContentType "application/json" -Body '{"address": "Nagpur, Maharashtra"}' | ConvertTo-Json
```

### Option C: cURL
```bash
curl -X POST http://127.0.0.1:8000/api/location/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Nagpur, Maharashtra"}'
```

### Option D: Run the automated test script
```bash
uv run python scratch/test_location_service.py
```

---

## 8. Current Limitations

1. **Rate Limit**: Nominatim public API has a fair use policy of ~1 request per second. Not intended for high-frequency bulk geocoding.
2. **Offline Mode**: Requires an active internet connection to contact Nominatim.
3. **Caching**: Results are fetched on-demand; no external caching layer is connected in this demo phase.

---

## 9. What Will Be Added Later (Future Phases)

- ❌ OSRM routing and distance calculation
- ❌ Map UI (Leaflet / OpenStreetMap in React frontend)
- ❌ Real-time GPS tracking and live transporter updates
- ❌ Logistics pricing & ETAs
- ❌ Payment gateway & automated farmer/transporter payouts
