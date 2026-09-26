import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { AppProvider } from './context/AppContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import MarketplacePage from './pages/MarketplacePage';
import CropDetailPage from './pages/CropDetailPage';
import OrdersPage from './pages/OrdersPage';
import LogisticsPage from './pages/LogisticsPage';
import IntelligencePage from './pages/IntelligencePage';
import ProfilePage from './pages/ProfilePage';
import FavoritesPage from './pages/FavoritesPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/crop/:id" element={<CropDetailPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/logistics" element={<LogisticsPage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}
