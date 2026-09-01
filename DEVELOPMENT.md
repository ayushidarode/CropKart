# CropKart Development Guide

## 📋 Table of Contents
1. [Setup](#setup)
2. [Project Structure](#project-structure)
3. [Core Features](#core-features)
4. [Testing the Application](#testing-the-application)
5. [API Documentation](#api-documentation)
6. [Architecture](#architecture)

## Setup

### Prerequisites
- Node.js v16+
- npm or yarn
- Windows, macOS, or Linux

### Installation

```bash
# Navigate to project directory
cd cropkart

# Install all dependencies
npm install (if root package.json is updated)
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Running the Application

#### Option 1: Using Batch Script (Windows)
```bash
start-dev.bat
```

#### Option 2: Using PowerShell Script (Windows)
```powershell
.\start-dev.ps1
```

#### Option 3: Manual Start (All Platforms)

Terminal 1 - Backend:
```bash
cd backend
npm start
```

Terminal 2 - Frontend:
```bash
cd frontend
npx vite
```

### Access Points
- **Frontend**: http://localhost:5173 or http://localhost:3000 (if configured)
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## Project Structure

```
cropkart/
├── backend/
│   ├── index.js                 # Express server with all API endpoints
│   ├── package.json             # Backend dependencies
│   ├── .env                     # Environment configuration
│   ├── public/
│   │   └── uploads/             # User uploaded images
│   └── node_modules/
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx            # React entry point
│   │   ├── App.jsx             # Main app component with routing
│   │   ├── AuthContext.jsx     # Authentication state management
│   │   ├── api.js              # Axios API client
│   │   ├── index.css           # Global styles
│   │   ├── components/
│   │   │   ├── Header.jsx      # Navigation header
│   │   │   ├── Footer.jsx      # Footer
│   │   │   └── CropCard.jsx    # Reusable crop display card
│   │   └── pages/
│   │       ├── HomePage.jsx            # Home page
│   │       ├── LoginPage.jsx           # Login form
│   │       ├── RegisterPage.jsx        # Registration form
│   │       ├── MarketplacePage.jsx     # Crops marketplace with search/filter
│   │       ├── CropDetailPage.jsx      # Single crop details
│   │       ├── NearbyPage.jsx          # Crops near me feature
│   │       ├── FarmerDashboard.jsx     # Farmer panel
│   │       ├── BuyerDashboard.jsx      # Buyer panel
│   │       ├── AdminDashboard.jsx      # Admin panel
│   │       └── NotFoundPage.jsx        # 404 page
│   ├── vite.config.js          # Vite configuration
│   ├── index.html              # HTML template
│   ├── package.json            # Frontend dependencies
│   └── node_modules/
│
├── README.md                    # Project overview
├── DEVELOPMENT.md               # This file
├── .gitignore                   # Git ignore rules
├── start-dev.bat                # Windows batch starter
├── start-dev.ps1                # PowerShell starter
└── package.json                 # Root package (for future monorepo setup)
```

## Core Features

### 🔴 P0 - Production Ready Features

#### 1. Authentication System
- **Registration**: Create farmer or buyer accounts
- **Login**: Secure JWT-based authentication
- **Session Management**: Token stored in localStorage
- **Protected Routes**: Role-based access control

**Demo Credentials:**
- Farmer: `ramesh@example.com` / `password123`
- Buyer: `buyer@example.com` / `password123`

#### 2. Farmer Dashboard
**Location**: `/farmer/dashboard`

Features:
- View all published crops
- Add new crops with:
  - Crop name
  - Quantity and unit (kg, quintal, ton)
  - Expected price per quintal
  - Location
  - Description
  - Crop image upload
- Manage purchase requests:
  - View all requests for their crops
  - See buyer info and requested quantity
  - Accept or reject requests
- Dashboard stats:
  - Total crops listed
  - Pending purchase requests
  - Accepted requests

#### 3. Buyer Dashboard
**Location**: `/buyer/dashboard`

Features:
- View all sent purchase requests
- Track request status:
  - Pending: Waiting for farmer response
  - Accepted: Ready to arrange delivery
  - Rejected: Request not accepted
- Dashboard stats:
  - Total requests sent
  - Pending requests
  - Accepted requests

#### 4. Marketplace
**Location**: `/marketplace`

Features:
- Browse all crops in the system
- Real-time search by crop name
- Filter by:
  - Location
  - Price range (min-max)
- Dynamic filtering (no page refresh needed)
- Clear filters button
- Crop cards showing:
  - Crop image
  - Name
  - Available quantity
  - Location
  - Farmer name
  - Price per quintal
- Click to view details

#### 5. Crop Details Page
**Location**: `/crop/:id`

Features:
- Full crop information display
- Large crop image
- Crop specifications
- Farmer information
- Market price reference data
- AI market insight prototype
- Purchase request form with:
  - Required quantity input
  - Optional price offer
  - Optional message to farmer
  - Form validation
- Success/error notifications

#### 6. 📍 Crops Near Me (Standout Feature)
**Location**: `/nearby`

Features:
- **Demo Locations**: 
  - Pune (default)
  - Mumbai
  - Bangalore
  - Delhi
- **GPS Integration**: Support for device geolocation
- **Distance Calculation**: Haversine formula for accurate distances
- **Search Radius**: Adjustable from 1-100 km
- **Distance Sorting**: Closest crops appear first
- **Per-Crop Distance**: Each crop shows distance from selected location
- Smart badges showing distance in km

#### 7. Purchase Request System
**Two-Way Flow:**

Buyer Side:
- Click "Request to Buy" on any crop
- Enter quantity needed
- Optionally adjust offered price
- Add optional message
- Submit request

Farmer Side:
- Receives request in dashboard
- See buyer info and offer details
- Accept or reject request
- Track multiple requests per crop

#### 8. Market Price Insights
- Reference market prices for crops
- Shows 3 market prices per crop
- CropSathi AI insight prototype
- Price range recommendations
- Located on crop detail page

### 🟡 P1 - Next Priority Features
- In-app messaging between farmers and buyers
- Push notifications for new requests
- Favorites/wishlist functionality
- User ratings and reviews
- Advanced analytics
- Crop recommendations

### 🔵 Future Enhancements
- Real payment processing (Stripe/Razorpay)
- Real logistics tracking
- SMS and WhatsApp notifications
- Advanced AI demand forecasting
- Government market price API integration
- Mobile app (React Native)
- Video conferencing for negotiations

## Testing the Application

### Complete End-to-End Flow

This is the core functionality that must work perfectly:

#### Step 1: Farmer Adds a Crop
```
1. Go to http://localhost:5173
2. Click "Sign Up" → Choose "Farmer"
3. OR use demo: Click "Login"
   Email: ramesh@example.com
   Password: password123
4. Go to "My Farm" (Farmer Dashboard)
5. Click "Add Crop" tab
6. Fill form:
   - Crop Name: Soybean
   - Quantity: 500
   - Unit: kg
   - Expected Price: 4800
   - Location: Pune
   - Description: Fresh quality soybean
   - Upload image (optional)
7. Click "🌾 Publish Listing"
8. See success message
```

#### Step 2: Verify Crop in Marketplace
```
1. Go to "Marketplace" (from header)
2. Should see newly added Soybean
3. Verify all details display correctly
4. Try search: type "Soybean"
5. Try filter by location: "Pune"
```

#### Step 3: Check Crops Near Me
```
1. Go to "📍 Crops Near Me"
2. Select "Pune" location (default)
3. Should see Soybean with distance
4. Adjust radius slider
5. Try other demo locations
```

#### Step 4: Buyer Sends Request
```
1. Logout (if needed)
2. Go to "Sign Up" → Choose "Buyer"
3. OR use demo: Click "Login"
   Email: buyer@example.com
   Password: password123
4. Go to "Marketplace"
5. Click on Soybean crop card
6. Fill "Request to Buy":
   - Quantity: 300
   - Offered Price: 4800 (or change)
   - Message: "Please confirm availability"
7. Click "🛒 Send Purchase Request"
8. See success message
9. Auto-redirect to buyer dashboard
```

#### Step 5: Farmer Receives Request
```
1. Logout buyer, login as farmer again
2. Go to "My Farm" dashboard
3. Click "🔔 Purchase Requests" tab
4. Should see request from FreshMart
5. See all details:
   - Crop name
   - Requested quantity
   - Offered price
   - Message
   - Status badge
6. Click "✅ Accept" button
7. See status update
```

#### Step 6: Verify Buyer Dashboard
```
1. Logout farmer, login as buyer
2. Go to "My Orders" dashboard
3. Should see purchase request status changed to "ACCEPTED"
```

### Testing Checklist

- [ ] User can register as farmer
- [ ] User can register as buyer
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Farmer can add crop with image
- [ ] Added crop appears in marketplace immediately
- [ ] Search filters crops by name
- [ ] Location filter works
- [ ] Price filter works
- [ ] Crops Near Me shows correct distances
- [ ] GPS location works (or demo locations work)
- [ ] Buyer can view crop details
- [ ] Market price data displays
- [ ] Buyer can send purchase request
- [ ] Farmer receives request in dashboard
- [ ] Farmer can accept request
- [ ] Farmer can reject request
- [ ] Request status updates in buyer dashboard
- [ ] All pages are mobile responsive
- [ ] No console errors
- [ ] No broken links

## API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register

Request Body:
{
  "name": "Ramesh Kumar",
  "email": "ramesh@example.com",
  "password": "password123",
  "role": "farmer",
  "location": "Pune",
  "phone": "9876543210"
}

Response:
{
  "token": "eyJhbGc...",
  "user": {
    "id": "farmer_1234",
    "name": "Ramesh Kumar",
    "email": "ramesh@example.com",
    "role": "farmer",
    "location": "Pune",
    "phone": "9876543210"
  }
}
```

#### Login
```
POST /api/auth/login

Request Body:
{
  "email": "ramesh@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

### Crops Endpoints

#### Get All Crops
```
GET /api/crops

Response:
[
  {
    "id": "crop1",
    "name": "Soybean",
    "quantity": 500,
    "unit": "kg",
    "expectedPrice": 4800,
    "location": "Pune",
    "image": "/uploads/soybean.jpg",
    "farmerName": "Ramesh Kumar",
    "coordinates": { "lat": 18.5204, "lng": 73.8567 },
    "createdAt": "2024-01-01T..."
  }
]
```

#### Get Single Crop
```
GET /api/crops/:id

Response: { crop object }
```

#### Add Crop (Farmer only)
```
POST /api/crops
Headers: Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- name: "Soybean"
- quantity: "500"
- unit: "kg"
- expectedPrice: "4800"
- location: "Pune"
- description: "Fresh soybean"
- image: (file)
- latitude: "18.5204"
- longitude: "73.8567"

Response: { crop object }
```

#### Get Nearby Crops
```
GET /api/crops/nearby?latitude=18.5204&longitude=73.8567&radius=10

Response: [array of crops within radius]
```

### Purchase Requests Endpoints

#### Create Request (Buyer only)
```
POST /api/purchase-requests
Headers: Authorization: Bearer {token}

Request Body:
{
  "cropId": "crop1",
  "quantity": 300,
  "offeredPrice": 4800,
  "message": "Please confirm availability"
}

Response:
{
  "id": "req1",
  "cropId": "crop1",
  "buyerId": "buyer1",
  "buyerName": "FreshMart",
  "farmerId": "farmer1",
  "farmerName": "Ramesh Kumar",
  "cropName": "Soybean",
  "requestedQuantity": 300,
  "offeredPrice": 4800,
  "message": "Please confirm availability",
  "status": "pending",
  "createdAt": "2024-01-01T..."
}
```

#### Get Purchase Requests
```
GET /api/purchase-requests
Headers: Authorization: Bearer {token}

Response: [array of requests for logged-in user]
```

#### Update Request Status (Farmer only)
```
PUT /api/purchase-requests/:id
Headers: Authorization: Bearer {token}

Request Body:
{
  "status": "accepted" | "rejected"
}

Response: { updated request object }
```

### Dashboard Endpoints

#### Farmer Dashboard
```
GET /api/farmer/dashboard
Headers: Authorization: Bearer {token}

Response:
{
  "crops": [array of farmer's crops],
  "purchaseRequests": [array of requests for farmer's crops],
  "stats": {
    "totalCrops": 2,
    "pendingRequests": 1,
    "acceptedRequests": 0
  }
}
```

#### Buyer Dashboard
```
GET /api/buyer/dashboard
Headers: Authorization: Bearer {token}

Response:
{
  "purchaseRequests": [array of buyer's requests],
  "stats": {
    "totalRequests": 5,
    "pendingRequests": 2,
    "acceptedRequests": 3
  }
}
```

#### Admin Dashboard
```
GET /api/admin/dashboard

Response:
{
  "farmers": 10,
  "buyers": 25,
  "crops": 42,
  "purchaseRequests": 15,
  "transactions": 8
}
```

### Market Prices
```
GET /api/market-prices/:cropName

Response:
[
  {
    "market": "Market A",
    "price": 4600,
    "unit": "quintal"
  },
  {
    "market": "Market B",
    "price": 4800,
    "unit": "quintal"
  }
]
```

## Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│         React Application               │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │      React Router (v6)           │   │
│  │  (Client-side routing)           │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │     Auth Context                 │   │
│  │  (State Management)              │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │     Pages & Components           │   │
│  │  (UI Layer)                      │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
│  ┌──────────────────────────────────┐   │
│  │     API Service (Axios)          │   │
│  │  (HTTP Client with Interceptor)  │   │
│  └──────────────────────────────────┘   │
│                 ↓                        │
└─────────────────────────────────────────┘
           ↓
    Backend API
```

### Backend Architecture

```
┌──────────────────────────────────────────┐
│       Express.js Server                  │
├──────────────────────────────────────────┤
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   Routes & Controllers             │  │
│  │   - Auth Routes                    │  │
│  │   - Crops Routes                   │  │
│  │   - Purchase Requests Routes       │  │
│  │   - Dashboard Routes               │  │
│  └────────────────────────────────────┘  │
│           ↓                               │
│  ┌────────────────────────────────────┐  │
│  │   Middleware                       │  │
│  │   - Authentication (JWT)           │  │
│  │   - File Upload (Multer)           │  │
│  │   - CORS                           │  │
│  └────────────────────────────────────┘  │
│           ↓                               │
│  ┌────────────────────────────────────┐  │
│  │   In-Memory Database               │  │
│  │   - Users array                    │  │
│  │   - Crops array                    │  │
│  │   - Purchase Requests array        │  │
│  └────────────────────────────────────┘  │
│                                          │
└──────────────────────────────────────────┘
```

### Data Flow Example

```
User Action: Buyer sends purchase request

Frontend:
1. CropDetailPage.jsx form submission
2. Calls purchaseRequestsAPI.create()
3. API.js adds Authorization header
4. Sends POST to /api/purchase-requests

Backend:
1. Receives POST /api/purchase-requests
2. authenticateToken middleware validates JWT
3. Checks user.role === 'buyer'
4. Creates new purchase request object
5. Adds to purchaseRequests array
6. Returns 201 Created response

Frontend:
1. Receives success response
2. Shows success alert
3. Updates local state
4. Redirects to buyer dashboard

Farmer:
1. Refreshes their dashboard
2. Fetches GET /api/farmer/dashboard
3. Receives updated purchaseRequests array
4. Displays new request
5. Can accept/reject
```

## Deployment

### Frontend Deployment
The frontend can be deployed to:
- Vercel (recommended for Vite)
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

```bash
npm run build  # Creates optimized build
# Deploy the dist/ folder
```

### Backend Deployment
The backend can be deployed to:
- Heroku
- Railway
- DigitalOcean
- AWS Lambda
- Google Cloud Run

For production:
1. Replace in-memory database with MongoDB/PostgreSQL
2. Use cloud storage for images (AWS S3, Cloudinary, etc.)
3. Set secure environment variables
4. Enable HTTPS
5. Add database migrations
6. Set up monitoring and logging

## Troubleshooting

### Frontend not connecting to backend
- Verify backend is running on port 5000
- Check vite.config.js proxy settings
- Clear browser cache
- Check browser console for CORS errors

### Image upload not working
- Ensure backend/public/uploads/ directory exists
- Check file permissions
- Verify file size limits in multer config

### Ports already in use
```bash
# Windows - find process using port 5000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Database reset
Currently using in-memory database. To reset:
- Restart the backend server
- All data will be cleared

## Contributing

For local development:
1. Create a new branch for your feature
2. Make changes
3. Test thoroughly
4. Submit pull request with description

## Next Steps

1. Convert in-memory database to MongoDB
2. Implement real file upload to cloud storage
3. Add unit and integration tests
4. Set up CI/CD pipeline
5. Deploy to production environment

---

**Last Updated**: January 2024
**Version**: 1.0.0 (MVP)
