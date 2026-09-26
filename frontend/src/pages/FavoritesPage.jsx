import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Store, ArrowRight } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import CropCard from '../components/ui/CropCard';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    currentRole,
    switchRole,
    crops,
    favorites,
    toggleFavorite,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const favoriteCrops = crops.filter((crop) => favorites.includes(crop.id));

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-600 bg-terracotta-100 px-2.5 py-0.5 rounded-pill">
              Procurement Watchlist
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-forest-900">
            Saved Produce & Lots ({favoriteCrops.length})
          </h1>
          <p className="text-xs sm:text-sm text-ink-500">
            Monitor real-time price updates and inventory changes for your shortlisted harvest lots.
          </p>
        </div>

        <Link to="/marketplace">
          <Button variant="secondary" size="sm" icon={Store}>
            Browse More Crops
          </Button>
        </Link>
      </div>

      {favoriteCrops.length === 0 ? (
        <div className="bg-surface-0 border border-line-200 rounded-card p-12 text-center text-ink-500">
          <Heart className="w-12 h-12 text-line-200 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-forest-900 mb-1">
            Your Watchlist is Empty
          </h3>
          <p className="text-xs text-ink-400 mb-4 max-w-sm mx-auto">
            Click the heart icon on any crop in the marketplace to monitor price drops and seller availability.
          </p>
          <Link to="/marketplace">
            <Button variant="solid-forest" size="md">
              Go to Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              isFavorite={true}
              onToggleFavorite={toggleFavorite}
              onSelect={() => navigate(`/crop/${crop.id}`)}
              onMakeOffer={() => navigate(`/crop/${crop.id}`)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
