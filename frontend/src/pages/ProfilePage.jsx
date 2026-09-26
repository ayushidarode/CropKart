import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  CreditCard,
  Bell,
  Globe,
  HelpCircle,
  LogOut,
  CheckCircle2,
  Award,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import Button from '../components/ui/Button';
import StatusPill from '../components/ui/StatusPill';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    currentUser,
    currentRole,
    switchRole,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'location' | 'payment' | 'help'
  const [upiId, setUpiId] = useState('kisan.ramesh@okaxis');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
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
      {/* Profile Header Card (§5.12) */}
      <div className="bg-surface-0 border border-line-200 rounded-hero p-6 sm:p-8 shadow-ambient mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-forest-700 text-lime-300 flex items-center justify-center font-display font-extrabold text-2xl shadow-sm">
              {currentUser.name[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-2xl text-forest-900">
                  {currentUser.name}
                </h1>
                <StatusPill status="verified" label={`Verified ${currentRole}`} />
              </div>
              <p className="text-xs text-ink-500 mt-1 flex items-center gap-2">
                <span>{currentUser.location}</span>
                <span>•</span>
                <span>Rating: ★ 4.9 (18 Completed Trades)</span>
              </p>
            </div>
          </div>

          {/* Trust Badge (§5.12 icon+label pattern) */}
          <div className="flex items-center gap-3 bg-sage-100/70 px-4 py-2.5 rounded-2xl border border-line-200">
            <ShieldCheck className="w-6 h-6 text-forest-700 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-forest-900 block">Kisan Aadhaar & APMC KYC</span>
              <span className="text-ink-500 text-[11px]">100% Escrow Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Sections (§5.12) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side: Tabs */}
        <div className="space-y-1">
          {[
            { id: 'details', label: 'Farm / Business Details', icon: User },
            { id: 'location', label: 'Mandi Hub & Warehouses', icon: MapPin },
            { id: 'payment', label: 'Payment & Escrow UPI', icon: CreditCard },
            { id: 'help', label: 'Kisan Support & Help', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left ${
                  activeTab === tab.id
                    ? 'bg-forest-700 text-white shadow-sm'
                    : 'bg-surface-0 text-ink-700 border border-line-200 hover:bg-sage-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Separated Logout Action (§5.12 outline terracotta button, not filled) */}
          <div className="pt-6">
            <Button
              variant="terracotta"
              size="md"
              icon={LogOut}
              onClick={() => {
                navigate('/login');
              }}
              className="w-full text-xs"
            >
              Sign Out of Session
            </Button>
          </div>
        </div>

        {/* Right Side: Tab Form Contents */}
        <div className="md:col-span-3 bg-surface-0 border border-line-200 rounded-card p-6 shadow-ambient">
          {activeTab === 'details' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-display font-bold text-lg text-forest-900 pb-2 border-b border-line-100">
                Primary Profile Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">Full Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">Registered Mobile</label>
                  <input
                    type="text"
                    defaultValue={currentUser.phone}
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">Farm Landholdings / Capacity</label>
                  <input
                    type="text"
                    defaultValue="18 Acres Irrigated"
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
                <div>
                  <label className="block text-ink-700 font-semibold mb-1 text-xs">Primary Harvest Crops</label>
                  <input
                    type="text"
                    defaultValue="Sharbati Wheat, Hybrid Tomato, Soybeans"
                    className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
                  />
                </div>
              </div>

              {isSaved && (
                <div className="p-3 bg-forest-100 text-forest-800 rounded-xl text-xs font-semibold">
                  Profile details updated successfully!
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" variant="solid-forest" size="md">
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'payment' && (
            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-display font-bold text-lg text-forest-900 pb-2 border-b border-line-100">
                Direct Bank & UPI Settlement (§5.12)
              </h3>
              <p className="text-xs text-ink-500">
                Payment is locked when an offer is accepted and credited straight to your UPI ID upon delivery OTP confirmation.
              </p>

              <div>
                <label className="block text-ink-700 font-semibold mb-1 text-xs">Virtual Payment Address (UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okaxis"
                  className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 font-bold focus:outline-none focus:ring-2 focus:ring-forest-700"
                />
              </div>

              <div className="p-4 bg-cream-50 rounded-2xl border border-line-200 space-y-2">
                <span className="text-xs font-bold text-forest-900 block">Bank Account on Record:</span>
                <p className="text-xs text-ink-600">State Bank of India • Nashik Main Branch</p>
                <p className="text-xs text-ink-500 font-mono">A/C: ************4819 | IFSC: SBIN0001428</p>
              </div>

              {isSaved && (
                <div className="p-3 bg-forest-100 text-forest-800 rounded-xl text-xs font-semibold">
                  UPI settlement ID verified!
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" variant="solid-forest" size="md">
                  Update Escrow Payout ID
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'location' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-display font-bold text-lg text-forest-900 pb-2 border-b border-line-100">
                Registered Warehouse & Farm Locations
              </h3>
              <div className="p-4 bg-cream-50 rounded-2xl border border-line-200">
                <div className="flex items-center gap-2 text-forest-700 font-bold mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Primary Farm Gate Dispatch Point</span>
                </div>
                <p className="text-ink-900 font-semibold">Survey No. 42/B, Dindori Road, Nashik, Maharashtra - 422004</p>
                <p className="text-ink-500 text-xs mt-1">Latitude: 19.9975 | Longitude: 73.7898</p>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-display font-bold text-lg text-forest-900 pb-2 border-b border-line-100">
                Kisan Support & SIH Verification Desk
              </h3>
              <p className="text-xs text-ink-600 leading-relaxed">
                Have questions regarding mandi e-way bills or need help assigning an insulated cold-chain transporter? CropKart agents and CropSathi AI are available 24/7.
              </p>
              <div className="p-4 bg-sage-50 rounded-2xl border border-sage-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-forest-900 block">Toll-Free Kisan Support</span>
                  <span className="text-xs text-forest-700 font-mono">1800-266-7527 (1800-CROP-KART)</span>
                </div>
                <Button variant="solid-forest" size="sm">
                  Call Support
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
