import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Tag,
  ShieldCheck,
  Wheat,
  X,
  ArrowRight,
  UserCheck,
  Check,
  Heart,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import CropCard from '../components/ui/CropCard';
import StatusPill from '../components/ui/StatusPill';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export default function MarketplacePage() {
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

  // Chip Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGrade, setSelectedGrade] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('price-asc');

  // Detail Drawer / Quick Offer State
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [offerQty, setOfferQty] = useState(100);
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [offerSuccessMsg, setOfferSuccessMsg] = useState(false);

  const categories = ['All', 'Grains', 'Vegetables', 'Fruits', 'Oilseeds'];
  const grades = ['All', 'Grade A+', 'Export Grade', 'Grade A'];
  const locations = ['All', 'Nashik', 'Pune', 'Karnal', 'Ratnagiri', 'Lasalgaon'];

  // Filtered & Sorted Crops
  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const matchSearch =
        !searchQuery ||
        crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        crop.farmerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory =
        selectedCategory === 'All' || crop.category === selectedCategory;

      const matchGrade =
        selectedGrade === 'All' || crop.grade.includes(selectedGrade);

      const matchLocation =
        selectedLocation === 'All' || crop.location.includes(selectedLocation);

      return matchSearch && matchCategory && matchGrade && matchLocation;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'qty-desc') return b.quantity - a.quantity;
      return 0;
    });
  }, [crops, searchQuery, selectedCategory, selectedGrade, selectedLocation, sortBy]);

  const handleOpenDetail = (crop) => {
    setSelectedCrop(crop);
    setOfferQty(Math.min(100, crop.quantity));
    setOfferPrice(crop.price);
    setOfferNote('Direct procurement for immediate delivery. Payment locked via escrow.');
    setOfferSuccessMsg(false);
  };

  const handleSendOffer = (e) => {
    e.preventDefault();
    if (!selectedCrop) return;
    makeOffer({
      crop: selectedCrop,
      offeredPrice: offerPrice,
      quantity: offerQty,
      message: offerNote,
    });
    setOfferSuccessMsg(true);
    setTimeout(() => {
      setSelectedCrop(null);
      setOfferSuccessMsg(false);
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
      {/* Sticky Chip Filter Bar (§5.5) */}
      <div className="sticky top-16 z-10 bg-cream-50/95 backdrop-blur-md pb-4 pt-1 mb-6 border-b border-line-200">
        <div className="flex flex-col gap-3">
          {/* Top row: Search input & Sorting */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-ink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by crop, farmer name, or district mandi..."
                className="w-full bg-surface-0 border border-line-200 rounded-pill pl-9 pr-4 py-2 text-xs sm:text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-ink-500 font-semibold whitespace-nowrap">
                Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-surface-0 border border-line-200 rounded-pill px-3 py-1.5 text-xs text-ink-800 font-medium focus:outline-none focus:ring-2 focus:ring-forest-700 shadow-sm"
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="qty-desc">Quantity: High to Low</option>
              </select>
            </div>
          </div>

          {/* Bottom row: Chip-style Category & Grade Filters (§5.5) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mr-1">
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-pill text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-forest-700 text-lime-300 shadow-sm'
                      : 'bg-surface-0 text-ink-700 border border-line-200 hover:bg-sage-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-line-200 hidden md:block" />

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 mr-1">
                Grade:
              </span>
              {grades.map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-1 rounded-pill text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedGrade === grade
                      ? 'bg-soil-600 text-white shadow-sm'
                      : 'bg-surface-0 text-ink-700 border border-line-200 hover:bg-sage-50'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg text-forest-900">
          Showing {filteredCrops.length} Verified Harvest Lots
        </h2>
        <span className="text-xs text-ink-500">
          Tabular MSP Parity Active
        </span>
      </div>

      {/* Grid of CropCards (§5.5) */}
      {filteredCrops.length === 0 ? (
        <div className="bg-surface-0 border border-line-200 rounded-card p-12 text-center text-ink-500">
          <p className="font-bold text-base text-forest-900 mb-1">No crops match your filters</p>
          <p className="text-xs text-ink-400 mb-4">Try clearing your search query or selecting "All" categories.</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedGrade('All');
              setSelectedLocation('All');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              isFavorite={favorites.includes(crop.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={handleOpenDetail}
              onMakeOffer={handleOpenDetail}
              onBuyNow={handleOpenDetail}
            />
          ))}
        </div>
      )}

      {/* Crop Detail & Quick Make Offer Drawer / Modal (§5.5) */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-surface-0 border border-line-200 rounded-hero max-w-2xl w-full shadow-ambient-xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="relative aspect-[16/9] w-full max-h-56 bg-sage-100 overflow-hidden">
              <img
                src={selectedCrop.imageUrl}
                alt={selectedCrop.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedCrop(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-0/90 backdrop-blur-sm text-ink-700 hover:text-ink-900 flex items-center justify-center shadow-sm"
              >
                ✕
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <StatusPill status="grade-a" label={selectedCrop.grade} />
                <span className="px-3 py-1 rounded-pill bg-forest-900/80 text-white text-xs font-semibold backdrop-blur-sm">
                  {selectedCrop.quantity} {selectedCrop.quantityUnit} available
                </span>
              </div>
            </div>

            {/* Content & Offer Form */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-2xl text-forest-900">
                      {selectedCrop.name}
                    </h3>
                    <p className="text-xs text-soil-600 font-semibold uppercase tracking-wider">
                      {selectedCrop.variety} • Harvested {selectedCrop.harvestDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-ink-400 block">Wholesale Rate</span>
                    <span className="text-2xl font-bold text-forest-900 tabular-nums">
                      ₹{Number(selectedCrop.price).toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-ink-500">/{selectedCrop.unit}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-ink-600 mt-3 leading-relaxed">
                  {selectedCrop.description}
                </p>
              </div>

              {/* Farmer Profile Snippet (§5.5) */}
              <div className="p-3.5 rounded-2xl bg-cream-50 border border-line-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forest-700 text-lime-300 flex items-center justify-center font-bold text-sm">
                    {selectedCrop.farmerName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-forest-900">
                      <span>{selectedCrop.farmerName}</span>
                      <ShieldCheck className="w-4 h-4 text-forest-600" />
                    </div>
                    <span className="text-ink-500 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-steel-500" />
                      {selectedCrop.location}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-ink-500">
                  <span className="font-semibold text-forest-700 block">Kisan Verified</span>
                  <span>Direct Farm Gate</span>
                </div>
              </div>

              {/* Make Offer / Buy Now Form */}
              <form onSubmit={handleSendOffer} className="space-y-4 pt-2 border-t border-line-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-900 uppercase tracking-wider">
                    Submit Price Bid or Purchase Order
                  </span>
                  <span className="text-xs text-forest-700 font-semibold">
                    Escrow Guaranteed
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quantity Stepper */}
                  <div>
                    <label className="block text-ink-700 font-semibold mb-1 text-xs">
                      Quantity ({selectedCrop.unit})
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setOfferQty((q) => Math.max(10, q - 20))}
                        className="w-10 h-10 rounded-l-xl bg-sage-100 hover:bg-sage-200 text-forest-900 font-bold border border-line-200"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedCrop.quantity}
                        value={offerQty}
                        onChange={(e) => setOfferQty(Number(e.target.value))}
                        className="w-full text-center bg-cream-50/70 border-y border-line-200 py-2 text-ink-900 font-bold tabular-nums focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setOfferQty((q) => Math.min(selectedCrop.quantity, q + 20))}
                        className="w-10 h-10 rounded-r-xl bg-sage-100 hover:bg-sage-200 text-forest-900 font-bold border border-line-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Offer Price Input */}
                  <div>
                    <label className="block text-ink-700 font-semibold mb-1 text-xs">
                      Your Offer Price (₹/{selectedCrop.unit})
                    </label>
                    <input
                      type="number"
                      required
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(Number(e.target.value))}
                      className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2 text-ink-900 font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-forest-700"
                    />
                  </div>
                </div>

                {/* Total Settlement Calculation */}
                <div className="p-3 bg-lime-50/60 border border-lime-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-forest-800 block">Total Escrow Value</span>
                    <span className="text-xl font-bold text-forest-900 tabular-nums">
                      ₹{Number(offerPrice * offerQty).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="text-forest-700 font-medium text-[11px]">
                    Includes mandi transit e-way bill
                  </span>
                </div>

                {offerSuccessMsg ? (
                  <div className="p-3 bg-forest-100 text-forest-800 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-forest-600 stroke-[3]" />
                    <span>Offer submitted successfully! Waiting for farmer approval...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setSelectedCrop(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="solid-forest"
                      size="md"
                      className="px-6 shadow-ambient"
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      Send Offer to Farmer
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
