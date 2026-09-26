import React, { useState } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Wheat,
  Tag,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import StatCard from '../components/ui/StatCard';
import StatusPill from '../components/ui/StatusPill';
import Button from '../components/ui/Button';
import CropCard from '../components/ui/CropCard';
import OrderCard from '../components/ui/OrderCard';
import { useApp } from '../context/AppContext';

export default function FarmerDashboard() {
  const {
    currentUser,
    currentRole,
    switchRole,
    crops,
    addCrop,
    offers,
    acceptOffer,
    rejectOffer,
    orders,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
    updateOrderStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState('crops'); // 'crops' | 'offers' | 'orders'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);

  // Add Crop Form State
  const [newCropForm, setNewCropForm] = useState({
    name: 'Sharbati Organic Wheat',
    variety: 'C-306',
    category: 'Grains',
    price: 2900,
    unit: 'quintal',
    quantity: 350,
    quantityUnit: 'qtl',
    grade: 'Grade A+',
    harvestDate: '26 Sep 2026',
    moisture: '10.2%',
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=700&q=80',
    description: 'Freshly harvested, sun-cured wheat with 12% gluten content. Lab certified.',
  });

  const farmerCrops = crops.filter((c) => c.farmerId === 'farmer-1' || c.farmerName === currentUser.name || true);
  const pendingOffers = offers.filter((o) => o.status === 'pending');
  const farmerOrders = orders.filter((o) => o.farmerId === 'farmer-1' || o.farmerName?.includes(currentUser.name) || true);

  // Total earnings calculation
  const totalEarnings = orders
    .filter((o) => o.status === 'paid' || o.status === 'delivered')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 637500);

  const handleAddCropSubmit = (e) => {
    e.preventDefault();
    addCrop(newCropForm);
    setIsAddCropModalOpen(false);
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
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-soil-600 bg-soil-100 px-2.5 py-0.5 rounded-pill">
              Kisan Trading Desk
            </span>
            <span className="text-xs text-ink-500">• Nashik APMC District</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-forest-900">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500">
            Manage your harvest listings, review live wholesale bids, and monitor transporter routes.
          </p>
        </div>

        {/* Prominent "+ Add Crop" Pill Button (§5.3) */}
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsAddCropModalOpen(true)}
            className="shadow-ambient px-6 py-3 text-sm font-bold"
          >
            + Add New Crop
          </Button>
        </div>
      </div>

      {/* Top Row: 3 Stat Cards (§5.3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Active Harvest Listings"
          value={farmerCrops.length}
          unit="Lots"
          delta="+2 lots"
          deltaText="vs last week"
          icon={Wheat}
          iconColor="text-forest-700 bg-forest-100"
        />
        <StatCard
          title="Pending Buyer Offers"
          value={pendingOffers.length}
          unit="Active bids"
          delta={pendingOffers.length > 0 ? "Awaiting Action" : "No Pending"}
          deltaText="review below"
          icon={Tag}
          iconColor="text-amber-600 bg-amber-100"
        />
        <StatCard
          title="This Month's Earnings"
          value={`₹${(totalEarnings / 100000).toFixed(2)}`}
          unit="Lakhs (Escrow Released)"
          delta="+18.4%"
          deltaText="vs target MSP"
          icon={IndianRupee}
          iconColor="text-forest-700 bg-forest-100"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-line-200 mb-6 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('crops')}
            className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'crops'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'text-ink-600 hover:text-forest-900 hover:bg-sage-100'
            }`}
          >
            My Crops ({farmerCrops.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all relative ${
              activeTab === 'offers'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'text-ink-600 hover:text-forest-900 hover:bg-sage-100'
            }`}
          >
            Buyer Offers
            {pendingOffers.length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-lime-400 text-forest-900 text-[10px] font-bold">
                {pendingOffers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-pill text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'orders'
                ? 'bg-forest-700 text-white shadow-sm'
                : 'text-ink-600 hover:text-forest-900 hover:bg-sage-100'
            }`}
          >
            Orders & Escrow ({farmerOrders.length})
          </button>
        </div>

        {activeTab === 'crops' && (
          <div className="hidden sm:flex items-center gap-1 bg-surface-0 border border-line-200 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-sage-100 text-forest-900' : 'text-ink-400 hover:text-ink-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-sage-100 text-forest-900' : 'text-ink-400 hover:text-ink-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: My Crops */}
      {activeTab === 'crops' && (
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {farmerCrops.map((crop) => (
                <CropCard key={crop.id} crop={crop} />
              ))}
            </div>
          ) : (
            /* Table View fallback for desktop (§6) */
            <div className="bg-surface-0 border border-line-200 rounded-card overflow-hidden shadow-ambient">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-sage-100/70 border-b border-line-200 text-ink-600 font-semibold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Crop</th>
                      <th className="py-3.5 px-4">Grade & Moisture</th>
                      <th className="py-3.5 px-4">Available Quantity</th>
                      <th className="py-3.5 px-4">Price / Unit</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-100">
                    {farmerCrops.map((crop) => (
                      <tr key={crop.id} className="hover:bg-sage-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={crop.imageUrl}
                              alt={crop.name}
                              className="w-10 h-10 rounded-xl object-cover border border-line-200"
                            />
                            <div>
                              <div className="font-bold text-forest-900">{crop.name}</div>
                              <div className="text-[11px] text-ink-400">{crop.variety}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-soil-600">{crop.grade}</span>
                          <span className="text-[11px] text-ink-400 block">{crop.moisture}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-ink-900 tabular-nums">
                          {crop.quantity} {crop.quantityUnit}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-forest-900 tabular-nums">
                          ₹{Number(crop.price).toLocaleString('en-IN')}/{crop.unit}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusPill status={crop.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="text-forest-700 hover:text-forest-900 font-semibold text-xs">
                            Edit Listing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Buyer Offers Panel (§5.3) */}
      {activeTab === 'offers' && (
        <div className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-surface-0 border border-line-200 rounded-card p-12 text-center text-ink-500">
              No active offers at this moment. New bids from buyers will appear here in real time.
            </div>
          ) : (
            offers.map((offer) => {
              const isPending = offer.status === 'pending';
              return (
                <div
                  key={offer.id}
                  className="bg-surface-0 border border-line-200 rounded-card p-5 sm:p-6 shadow-ambient flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all hover:shadow-ambient-lg"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={offer.status} />
                      <span className="text-xs text-ink-400">• Received {offer.date}</span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-forest-900">
                      Offer for {offer.cropName}
                    </h3>

                    <p className="text-xs text-ink-600 bg-cream-50 p-3 rounded-xl border border-line-100 max-w-2xl leading-relaxed">
                      💬 <strong className="text-forest-900">{offer.buyerName}</strong> ({offer.buyerLocation}): "{offer.message}"
                    </p>

                    <div className="flex flex-wrap items-center gap-6 pt-1 text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-ink-400 font-bold block">Bid Price</span>
                        <span className="text-lg font-bold text-forest-900 tabular-nums">
                          ₹{Number(offer.offeredPrice).toLocaleString('en-IN')}/{offer.unit}
                        </span>
                        <span className="text-[10px] text-ink-400 block line-through">
                          List: ₹{offer.listedPrice}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-ink-400 font-bold block">Quantity</span>
                        <span className="text-base font-bold text-ink-900 tabular-nums">
                          {offer.quantity} {offer.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-ink-400 font-bold block">Total Settlement</span>
                        <span className="text-lg font-bold text-forest-700 tabular-nums">
                          ₹{Number(offer.totalOffer).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Accept (forest-700), Reject (outline terracotta) (§5.3) */}
                  {isPending ? (
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                      <Button
                        variant="terracotta"
                        size="md"
                        onClick={() => rejectOffer(offer.id)}
                        className="w-full sm:w-auto text-xs"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="solid-forest"
                        size="md"
                        icon={Check}
                        onClick={() => {
                          acceptOffer(offer.id);
                          setActiveTab('orders');
                        }}
                        className="w-full sm:w-auto text-xs shadow-ambient"
                      >
                        Accept & Create Order
                      </Button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <span className="text-xs font-semibold text-forest-700 block">
                        Offer {offer.status.toUpperCase()}
                      </span>
                      {offer.status === 'accepted' && (
                        <span className="text-[11px] text-ink-500">
                          Moved to active orders
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 3: Orders & Escrow */}
      {activeTab === 'orders' && (
        <div className="space-y-5">
          {farmerOrders.length === 0 ? (
            <div className="bg-surface-0 border border-line-200 rounded-card p-12 text-center text-ink-500">
              No orders yet. Once you accept an offer, the trade order will be tracked here.
            </div>
          ) : (
            farmerOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))
          )}
        </div>
      )}

      {/* Add Crop Modal Form (§5.3) */}
      {isAddCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-surface-0 border border-line-200 rounded-hero p-6 sm:p-8 max-w-xl w-full shadow-ambient-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-line-100 mb-5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-soil-600 block">
                  New Produce Listing
                </span>
                <h3 className="font-display font-bold text-xl text-forest-900">
                  List Harvest on CropKart
                </h3>
              </div>
              <button
                onClick={() => setIsAddCropModalOpen(false)}
                className="w-8 h-8 rounded-full bg-sage-100 text-ink-600 hover:text-ink-900 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCropSubmit} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">
                    Crop Commodity Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCropForm.name}
                    onChange={(e) => setNewCropForm({ ...newCropForm, name: e.target.value })}
                    placeholder="e.g. Sharbati Wheat"
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">
                    Variety / Seed Type
                  </label>
                  <input
                    type="text"
                    value={newCropForm.variety}
                    onChange={(e) => setNewCropForm({ ...newCropForm, variety: e.target.value })}
                    placeholder="e.g. C-306 Heirloom"
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={newCropForm.quantity}
                    onChange={(e) => setNewCropForm({ ...newCropForm, quantity: e.target.value })}
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">
                    Unit
                  </label>
                  <select
                    value={newCropForm.unit}
                    onChange={(e) => setNewCropForm({ ...newCropForm, unit: e.target.value, quantityUnit: e.target.value === 'quintal' ? 'qtl' : e.target.value })}
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  >
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="tonne">Metric Tonne</option>
                    <option value="crate">Crate (25 kg)</option>
                    <option value="box">Box (12 pcs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">
                    Price (₹ / unit)
                  </label>
                  <input
                    type="number"
                    required
                    value={newCropForm.price}
                    onChange={(e) => setNewCropForm({ ...newCropForm, price: e.target.value })}
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">
                    Quality Grade
                  </label>
                  <select
                    value={newCropForm.grade}
                    onChange={(e) => setNewCropForm({ ...newCropForm, grade: e.target.value })}
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  >
                    <option value="Grade A+">Grade A+ (Premium / Sortex Cleaned)</option>
                    <option value="Export Grade">Export Grade (Certified Zero Residue)</option>
                    <option value="Grade A">Grade A (Standard APMC First Quality)</option>
                    <option value="Fair Average Quality">FAQ (Fair Average Quality)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">
                    Harvest Date
                  </label>
                  <input
                    type="text"
                    value={newCropForm.harvestDate}
                    onChange={(e) => setNewCropForm({ ...newCropForm, harvestDate: e.target.value })}
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  Description & Lot Details
                </label>
                <textarea
                  rows={2}
                  value={newCropForm.description}
                  onChange={(e) => setNewCropForm({ ...newCropForm, description: e.target.value })}
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              {/* Photo Upload preview */}
              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">
                  Crop Inspection Photo
                </label>
                <div className="flex items-center gap-3 p-3 bg-cream-50 border border-line-200 rounded-xl">
                  <img
                    src={newCropForm.imageUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-lg object-cover border border-line-200"
                  />
                  <div className="text-xs text-ink-500">
                    <span className="font-semibold text-forest-900 block">Photo Attached</span>
                    <span>High-resolution sample for buyer verification</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-line-100">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setIsAddCropModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                >
                  Publish Crop Listing
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
