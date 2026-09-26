import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Wheat,
  Clock,
  Truck,
  CheckCircle2,
  Calendar,
  Share2,
  Heart,
  Sparkles,
  PhoneCall,
  Check,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import StatusPill from '../components/ui/StatusPill';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export default function CropDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    currentUser,
    currentRole,
    switchRole,
    crops,
    makeOffer,
    favorites,
    toggleFavorite,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const crop = crops.find((c) => c.id === id) || crops[0];

  const [quantity, setQuantity] = useState(100);
  const [offerPrice, setOfferPrice] = useState(crop.price);
  const [offerNote, setOfferNote] = useState('');
  const [offerSuccess, setOfferSuccess] = useState(false);

  const isFav = favorites.includes(crop.id);

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    makeOffer({
      crop,
      offeredPrice: offerPrice,
      quantity,
      message: offerNote || 'Interested in immediate purchase. Ready to fund escrow.',
    });
    setOfferSuccess(true);
    setTimeout(() => {
      navigate('/orders');
    }, 1200);
  };

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
      {/* Back button link */}
      <div className="mb-6">
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-forest-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Images & Crop Specifications */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Photo Card */}
          <div className="bg-surface-0 border border-line-200 rounded-hero overflow-hidden shadow-ambient">
            <div className="relative aspect-[16/10] w-full bg-sage-100">
              <img
                src={crop.imageUrl}
                alt={crop.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <StatusPill status="grade-a" label={crop.grade} />
                <StatusPill status={crop.status} />
              </div>

              <button
                onClick={() => toggleFavorite(crop.id)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface-0/90 backdrop-blur-sm flex items-center justify-center text-ink-600 hover:text-terracotta-500 shadow-sm"
              >
                <Heart className={`w-5 h-5 ${isFav ? 'fill-terracotta-500 text-terracotta-500' : ''}`} />
              </button>

              <div className="absolute bottom-4 left-4 bg-forest-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-pill text-xs font-semibold">
                Available Lot: {crop.quantity} {crop.quantityUnit}
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div>
                  <h1 className="font-display font-bold text-2xl sm:text-3xl text-forest-900">
                    {crop.name}
                  </h1>
                  <span className="text-xs text-soil-600 uppercase font-semibold tracking-wider">
                    {crop.variety} • Category: {crop.category}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-ink-400 block">Wholesale Rate</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-bold text-forest-900 tabular-nums">
                      ₹{Number(crop.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-ink-500">/{crop.unit}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-ink-600 leading-relaxed mt-4">
                {crop.description}
              </p>

              {/* Lab Specification Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-line-100 text-xs">
                <div className="p-3 bg-cream-50 rounded-xl border border-line-100">
                  <span className="text-[10px] uppercase font-bold text-ink-400 block">Moisture Content</span>
                  <span className="font-bold text-forest-900">{crop.moisture || '10.5%'}</span>
                </div>
                <div className="p-3 bg-cream-50 rounded-xl border border-line-100">
                  <span className="text-[10px] uppercase font-bold text-ink-400 block">Harvest Date</span>
                  <span className="font-bold text-forest-900">{crop.harvestDate}</span>
                </div>
                <div className="p-3 bg-cream-50 rounded-xl border border-line-100">
                  <span className="text-[10px] uppercase font-bold text-ink-400 block">Quality Standard</span>
                  <span className="font-bold text-forest-900">{crop.grade}</span>
                </div>
                <div className="p-3 bg-cream-50 rounded-xl border border-line-100">
                  <span className="text-[10px] uppercase font-bold text-ink-400 block">Inspection</span>
                  <span className="font-bold text-forest-700">Lab Passed ✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Farmer Card */}
          <div className="bg-surface-0 border border-line-200 rounded-card p-5 shadow-ambient flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-forest-700 text-lime-300 flex items-center justify-center font-display font-bold text-lg">
                {crop.farmerName[0]}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-bold text-forest-900 text-sm">
                  <span>{crop.farmerName}</span>
                  <ShieldCheck className="w-4 h-4 text-forest-600" />
                </div>
                <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-steel-500" />
                  {crop.location}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-semibold text-forest-700 block">Kisan Verified</span>
              <span className="text-[11px] text-ink-400">Direct Farm Gate</span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Make Offer / Order Box (§5.5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-surface-0 border border-line-200 rounded-hero p-6 shadow-ambient">
            <div className="pb-4 border-b border-line-100 mb-5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-forest-700 bg-sage-100 px-2.5 py-0.5 rounded-pill">
                Direct B2B Procurement
              </span>
              <h2 className="font-display font-bold text-xl text-forest-900 mt-2">
                Make Offer or Buy Now
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                Propose your price per {crop.unit} or purchase at listed wholesale rate.
              </p>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs sm:text-sm">
              {/* Quantity Stepper */}
              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  Procurement Quantity ({crop.unit})
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(10, q - 20))}
                    className="w-11 h-11 rounded-l-xl bg-sage-100 hover:bg-sage-200 text-forest-900 font-bold border border-line-200 text-base"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={crop.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full text-center bg-cream-50/70 border-y border-line-200 py-2.5 text-ink-900 font-bold text-base tabular-nums focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(crop.quantity, q + 20))}
                    className="w-11 h-11 rounded-r-xl bg-sage-100 hover:bg-sage-200 text-forest-900 font-bold border border-line-200 text-base"
                  >
                    +
                  </button>
                </div>
                <span className="text-[11px] text-ink-400 mt-1 block">
                  Available in stock: {crop.quantity} {crop.quantityUnit}
                </span>
              </div>

              {/* Offer Price Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-ink-700 font-semibold text-xs">
                    Your Bid Price (₹/{crop.unit})
                  </label>
                  <button
                    type="button"
                    onClick={() => setOfferPrice(crop.price)}
                    className="text-[11px] text-forest-700 hover:underline font-semibold"
                  >
                    Use Listed (₹{crop.price})
                  </button>
                </div>
                <input
                  type="number"
                  required
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 font-bold text-base tabular-nums focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              {/* Note / Message */}
              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  Buyer Procurement Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={offerNote}
                  onChange={(e) => setOfferNote(e.target.value)}
                  placeholder="e.g. Need delivery to Vashi APMC by tomorrow evening..."
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              {/* Escrow Settlement Total */}
              <div className="p-4 bg-lime-50/70 border border-lime-200 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-forest-800 block">Total Escrow Value</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-bold text-forest-900 tabular-nums">
                    ₹{Number(offerPrice * quantity).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-forest-700 font-semibold">
                    100% Protected
                  </span>
                </div>
              </div>

              {offerSuccess ? (
                <div className="p-3.5 bg-forest-100 border border-forest-200 text-forest-800 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-forest-600 stroke-[3]" />
                  <span>Offer Submitted! Redirecting to orders...</span>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  <Button
                    type="submit"
                    variant="solid-forest"
                    size="lg"
                    className="w-full py-3.5 text-sm font-bold shadow-ambient"
                  >
                    Submit Offer / Buy Now
                  </Button>
                  <p className="text-[10px] text-ink-400 text-center">
                    Farmer will receive an instant notification to accept or counter-bid.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
