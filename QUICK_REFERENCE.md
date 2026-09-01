# CropKart Quick Reference

## 🚀 Quick Start (30 seconds)

### Windows
```batch
cd cropkart
start-dev.bat
```

### macOS/Linux
```bash
cd cropkart
cd backend && npm start &
cd ../frontend && npm run dev
```

## 🌐 Access Points
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🔐 Demo Login
| Role | Email | Password |
|------|-------|----------|
| Farmer | ramesh@example.com | password123 |
| Buyer | buyer@example.com | password123 |

## 📍 Core User Journeys

### For Farmers
```
Login → Dashboard → Add Crop → View Crop in Marketplace
→ Receive Purchase Request → Accept/Reject Request
```

### For Buyers
```
Login → Marketplace → Search/Filter → Crops Near Me
→ View Crop Details → Send Purchase Request
→ View Request Status in Dashboard
```

## 🗂️ Important Files

| File | Purpose |
|------|---------|
| `backend/index.js` | All API endpoints and database |
| `frontend/src/App.jsx` | React routing and layout |
| `frontend/src/AuthContext.jsx` | Authentication state |
| `frontend/src/pages/*.jsx` | Page components |
| `frontend/vite.config.js` | Frontend build config |

## 🔄 Data Flow

```
User Action
    ↓
Frontend Component
    ↓
Calls API Service
    ↓
Axios with JWT Token
    ↓
Backend Express Route
    ↓
Authentication Middleware
    ↓
Route Handler
    ↓
In-Memory Database
    ↓
Response back to Frontend
```

## 🛠️ Common Tasks

### Add a new page
1. Create `frontend/src/pages/YourPage.jsx`
2. Add route to `frontend/src/App.jsx`
3. Add navigation link to `frontend/src/components/Header.jsx`

### Add a new API endpoint
1. Add route handler to `backend/index.js`
2. Export function from `frontend/src/api.js`
3. Call from React component using `useAuth()` and API

### Debug API calls
- Check `Network` tab in browser DevTools
- Verify JWT token in `localStorage`
- Check backend console for errors
- Verify request body format

### Debug styling
- Global styles: `frontend/src/index.css`
- Component-specific: inline `style` prop or CSS modules

## 📊 Database (In-Memory)

The app currently uses these data structures:

```javascript
// Users
[{
  id: "farmer1",
  name: "Ramesh Kumar",
  email: "ramesh@example.com",
  role: "farmer",
  location: "Pune"
}]

// Crops
[{
  id: "crop1",
  name: "Soybean",
  quantity: 500,
  unit: "kg",
  expectedPrice: 4800,
  location: "Pune",
  farmerId: "farmer1",
  image: "/uploads/image.jpg"
}]

// Purchase Requests
[{
  id: "req1",
  cropId: "crop1",
  buyerId: "buyer1",
  farmerId: "farmer1",
  quantity: 300,
  status: "pending"
}]
```

## 🔒 Security Notes

- Passwords hashed with bcrypt
- JWT tokens expire in 24 hours
- Protected routes check authentication
- File uploads validated
- CORS configured

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Port already in use | Kill process or use different port |
| CORS errors | Check backend CORS configuration |
| Image upload fails | Ensure `backend/public/uploads/` exists |
| Token expired | Clear localStorage and login again |
| Farms not showing crops | Refresh browser or restart backend |

## 📱 Testing Crops Near Me

1. Go to "Crops Near Me"
2. Select demo location (Pune, Mumbai, etc)
3. Crops should show with distances
4. Adjust radius slider
5. Crops re-sort by distance

Demo locations:
- Pune: (18.5204, 73.8567)
- Mumbai: (19.0760, 72.8777)
- Bangalore: (12.9716, 77.5946)
- Delhi: (28.7041, 77.1025)

## 📝 API Examples

### Get all crops
```bash
curl http://localhost:5000/api/crops
```

### Get crops nearby
```bash
curl "http://localhost:5000/api/crops/nearby?latitude=18.5204&longitude=73.8567&radius=10"
```

### Get market prices
```bash
curl http://localhost:5000/api/market-prices/Soybean
```

### Create crop (with auth)
```bash
curl -X POST http://localhost:5000/api/crops \
  -H "Authorization: Bearer {token}" \
  -F "name=Soybean" \
  -F "quantity=500" \
  -F "unit=kg" \
  -F "expectedPrice=4800" \
  -F "location=Pune"
```

## 🎯 Key Features to Test

- ✅ Register/Login as Farmer
- ✅ Register/Login as Buyer
- ✅ Add crop with image
- ✅ Crop appears in marketplace
- ✅ Search crops by name
- ✅ Filter by location/price
- ✅ Crops Near Me shows distances
- ✅ Send purchase request
- ✅ Farmer receives request
- ✅ Accept/reject workflow
- ✅ Market prices display
- ✅ Mobile responsive design

## 📚 Documentation

- **README.md** - Project overview
- **DEVELOPMENT.md** - Detailed development guide
- **QUICK_REFERENCE.md** - This file

## 🚀 Deployment

```bash
# Build frontend
cd frontend
npm run build

# Frontend ready in dist/
# Backend ready to deploy with npm start
```

## 💡 Tips

- Use demo credentials to quickly test
- Add logs to understand data flow
- Test on mobile to check responsiveness
- Clear browser cache if styles not updating
- Restart backend if database seems inconsistent

---

**Pro Tip**: Use this template for the demo:
1. Login as Farmer
2. Add crop (Soybean, 500kg, ₹4800)
3. Login as Buyer
4. Find crop → Send request
5. Login as Farmer
6. Accept request
7. Show completed flow to judges!
