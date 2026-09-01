# 🌾 CropKart - Agricultural Marketplace

A real working hackathon prototype connecting farmers and buyers directly for fresh, quality produce.

## 🎯 Overview

CropKart is a full-stack web application that enables:

- **Farmers** to list their crops with prices and reach buyers directly
- **Buyers** to discover fresh crops nearby and send purchase requests
- **Smart features** including market price insights and location-based crop discovery

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. **Clone and enter the directory**
```bash
cd cropkart
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Start development servers**
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5000`.

## 📁 Project Structure

```
cropkart/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── App.jsx
│   │   ├── AuthContext.jsx  # Authentication context
│   │   ├── api.js           # API client
│   │   └── index.css        # Global styles
│   ├── package.json
│   └── vite.config.js
│
├── backend/                  # Express.js backend
│   ├── index.js             # Main server file
│   ├── .env                 # Environment variables
│   ├── public/
│   │   └── uploads/         # Uploaded crop images
│   └── package.json
│
└── README.md
```

## 🔑 Demo Credentials

### Farmer
- Email: `ramesh@example.com`
- Password: `password123`

### Buyer
- Email: `buyer@example.com`
- Password: `password123`

## ✨ Core Features

### 🔴 P0 - Real Working Features (MVP)

1. **Authentication**
   - User registration (Farmer/Buyer)
   - Login and session management
   - Role-based access control

2. **Farmer Features**
   - Dashboard with crop management
   - Add crops with name, quantity, price, location, image
   - View purchase requests
   - Accept/reject requests

3. **Buyer Features**
   - Marketplace with all crops
   - Search and filter crops
   - Send purchase requests
   - Track request status

4. **Marketplace Features**
   - Browse all crops
   - Search by crop name
   - Filter by location and price
   - View crop details and farmer info

5. **📍 Crops Near Me** (Standout Feature)
   - Location-based crop discovery
   - Demo locations (Pune, Mumbai, Bangalore, Delhi)
   - GPS location support
   - Adjustable search radius
   - Distance calculation and sorting

6. **Purchase Request System**
   - Buyers send requests with quantity and price
   - Farmers receive and manage requests
   - Accept/reject workflow

7. **Market Price Insights**
   - Reference market prices for crops
   - AI insight prototype

### 🟡 P1 - Will Implement Next

- In-app messaging
- Push notifications
- Favorites/wishlist
- Ratings and reviews
- Advanced analytics

### 🔵 Future - Simulated/Can Be Added

- Real payment processing
- Real GPS tracking
- SMS/WhatsApp notifications
- Advanced AI forecasting
- Government market API integration

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Crops
- `GET /api/crops` - Get all crops
- `GET /api/crops/:id` - Get specific crop
- `POST /api/crops` - Add new crop (Farmer only)
- `PUT /api/crops/:id` - Update crop (Owner only)
- `DELETE /api/crops/:id` - Delete crop (Owner only)
- `GET /api/crops/nearby` - Get crops near location

### Purchase Requests
- `POST /api/purchase-requests` - Create request (Buyer only)
- `GET /api/purchase-requests` - Get user's requests
- `PUT /api/purchase-requests/:id` - Update request status (Farmer only)

### Dashboard
- `GET /api/farmer/dashboard` - Farmer stats and crops
- `GET /api/buyer/dashboard` - Buyer stats and requests
- `GET /api/admin/dashboard` - Platform overview

### Market Data
- `GET /api/market-prices/:cropName` - Reference prices

## 🎨 UI Features

- **Professional Design**: Clean, modern, startup-quality UI
- **Responsive Layout**: Works on mobile and desktop
- **Intuitive Navigation**: Clear user flows
- **Real-time Updates**: Instant feedback on actions
- **Interactive Cards**: Hover effects and smooth transitions

## 🧪 Testing the Core Flow

1. **Register and Login as Farmer**
   - Go to `/register` and create a farmer account
   - Or login with demo credentials

2. **Add a Crop**
   - Click "Add Crop" in Farmer Dashboard
   - Fill in details (Soybean, 500 kg, ₹4,800/quintal, etc.)
   - Upload an image
   - Click "Publish Listing"

3. **Login as Buyer**
   - Register/login as a buyer
   - Go to Marketplace
   - Should see the newly added crop
   - Use search/filter to find it

4. **Explore Crops Near Me**
   - Click "📍 Crops Near Me"
   - Select a location (Pune by default)
   - See crops with distances

5. **Send Purchase Request**
   - Click on a crop
   - Enter quantity (e.g., 300 kg)
   - Optionally adjust price and add message
   - Click "Send Purchase Request"

6. **Farmer Receives Request**
   - Switch back to Farmer Dashboard
   - Go to "Purchase Requests" tab
   - Should see the new request
   - Accept or Reject it

## 📦 Build for Production

```bash
npm run build
```

## 🔐 Security Notes

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Protected API endpoints
- Environment variables for secrets
- CORS enabled for frontend-backend communication

## 🌍 Deployment

The application is ready to deploy to:
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Heroku, Railway, DigitalOcean

## 📝 Notes

- This is an MVP prototype with in-memory database
- For production, integrate with MongoDB/PostgreSQL
- Image uploads currently stored locally (use cloud storage for production)
- Market prices are demo data

## 🤝 Contributing

This is a hackathon project. Future contributions welcome!

## 📄 License

MIT License

---

**Built with ❤️ for the hackathon**

🌾 Connecting Farmers and Buyers Directly
