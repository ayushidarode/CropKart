import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Tag,
  ArrowRight,
  Store,
  Clock,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import CropCard from '../components/ui/CropCard';
import OrderCard from '../components/ui/OrderCard';
import { useApp } from '../context/AppContext';

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const {
    currentUser,
    currentRole,
    switchRole,
    crops,
    offers,
    orders,
    favorites,
    toggleFavorite,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
    updateOrderStatus,
  } = useApp();

  const buyerOrders = orders; // All active trades
  const pendingSentOffers = offers.filter((o) => o.buyerId === currentUser.id || o.status === 'pending');
  const savedCropsList = crops.filter((c) => favorites.includes(c.id));

  return (
    <AppShell
      user={currentUser}
      currentRole={currentRole}
      onSwitchRole={switchRole}
      notifications={notifications}
      onMarkAllNotificationsRead={markAllNotificationsRead}
      language={language}
      setLanguage={setLanguage}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-steel-600 bg-steel-100 px-2.5 py-0.5 rounded-pill">
              Wholesale Procurement Desk
            </span>
            <span className="text-xs text-ink-500">• Institutional Sourcing</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-forest-900">
            {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500">
            Source directly from verified farm gates with lab-tested quality grades and multi-stage delivery tracking.
          </p>
        </div>

        {/* Shortcut into Marketplace (Primary CTA) (§5.4) */}
        <div className="flex items-center gap-3">
          <Link to="/marketplace">
            <Button
              variant="primary"
              size="md"
              icon={Store}
              className="shadow-ambient px-6 py-3 text-sm font-bold"
            >
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Row: 3 Stat Cards (§5.4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Active Procurement Orders"
          value={buyerOrders.length}
          unit="In Pipeline"
          delta="Real-time"
          deltaText="tracking active"
          icon={ShoppingBag}
          iconColor="text-forest-700 bg-forest-100"
        />
        <StatCard
          title="Saved Watchlist Crops"
          value={favorites.length}
          unit="Monitored Lots"
          delta="Price Alerts"
          deltaText="daily mandi updates"
          icon={Heart}
          iconColor="text-terracotta-500 bg-terracotta-100"
        />
        <StatCard
          title="Pending Bids Sent"
          value={pendingSentOffers.length}
          unit="Negotiations"
          delta="Awaiting Farmer"
          deltaText="instant notification"
          icon={Tag}
          iconColor="text-amber-600 bg-amber-100"
        />
      </div>

      {/* Recently Viewed / Recommended Crops (Horizontal Scroll) (§5.4) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-forest-900">
              Fresh Lots Recommended for Your Volume
            </h2>
            <p className="text-xs text-ink-500">
              Directly aligned with your institutional procurement history
            </p>
          </div>
          <Link to="/marketplace" className="text-xs font-semibold text-forest-700 hover:text-forest-900 flex items-center gap-1">
            Browse All ({crops.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {crops.slice(0, 3).map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              isFavorite={favorites.includes(crop.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={() => navigate(`/crop/${crop.id}`)}
              onMakeOffer={() => navigate(`/crop/${crop.id}`)}
            />
          ))}
        </div>
      </section>

      {/* "My Orders" Section (§5.4) */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-forest-900">
              Active Trade Orders & Escrow
            </h2>
            <p className="text-xs text-ink-500">
              Milestone progress from farm-gate dispatch to APMC warehouse delivery
            </p>
          </div>
          <Link to="/orders">
            <Button variant="ghost" size="sm" className="text-xs text-forest-700">
              View All Orders ({buyerOrders.length})
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {buyerOrders.slice(0, 2).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onTrackMap={() => navigate('/logistics')}
              onUpdateStatus={updateOrderStatus}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}
