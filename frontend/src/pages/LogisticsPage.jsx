import React, { useState } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  Clock,
  Gauge,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Phone,
  FileText,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import MapView from '../components/ui/MapView';
import Button from '../components/ui/Button';
import StatusPill from '../components/ui/StatusPill';
import { useApp } from '../context/AppContext';

export default function LogisticsPage() {
  const {
    currentUser,
    currentRole,
    switchRole,
    orders,
    transporters,
    assignTransporter,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '9021');
  const [selectedTransporter, setSelectedTransporter] = useState(transporters[0]);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  const activeOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const handleAssign = (transporter) => {
    setSelectedTransporter(transporter);
    assignTransporter(activeOrder.id, transporter);
    setAssignedSuccess(true);
    setTimeout(() => setAssignedSuccess(false), 2500);
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
      {/* Header with Steel-500 Transport Accent (§5.7) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-steel-600 bg-steel-100 px-2.5 py-0.5 rounded-pill">
              AI Logistics & Fleet Telemetry
            </span>
            <span className="text-xs text-ink-500">• Steel Corridor Subsystem</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-forest-900">
            Smart Transport Assignment & Live Map
          </h1>
          <p className="text-xs sm:text-sm text-ink-500">
            Directly match farm harvest loads to verified refrigerated trucks with automated E-Way bills.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-pill bg-steel-100 text-steel-700 text-xs font-bold flex items-center gap-1.5 border border-steel-200">
            <span className="w-2 h-2 rounded-full bg-steel-500 animate-pulse" />
            <span>3 Active Fleets Ready</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Route & Map View, Right Transporter Assignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Map & Route Telemetry */}
        <div className="lg:col-span-7 space-y-5">
          {/* Order Selection Strip */}
          <div className="bg-surface-0 border border-line-200 rounded-card p-4 shadow-ambient">
            <span className="text-[10px] uppercase font-bold text-ink-400 block mb-2">
              Select Cargo Shipment to Track:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {orders.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedOrderId === o.id
                      ? 'bg-steel-50 border-steel-500 text-steel-700 shadow-sm'
                      : 'bg-surface-0 border-line-200 text-ink-700 hover:bg-sage-50'
                  }`}
                >
                  <span className="block font-bold">{o.orderNumber}</span>
                  <span className="text-[10px] text-ink-400">{o.cropName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Leaflet Interactive Map Component with Squiggle Motif (§5.10 & §5.7) */}
          <MapView
            cropName={activeOrder?.cropName}
            orderId={activeOrder?.orderNumber}
            distanceKm={activeOrder?.distanceKm || 168}
            etaHours={activeOrder?.etaHours || '3h 40m'}
          />

          {/* AI Route Insights Card */}
          <div className="bg-surface-0 border border-line-200 rounded-card p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-600" />
                <h3 className="font-display font-bold text-sm text-forest-900">
                  CropSathi AI Route Optimization
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-pill bg-lime-100 text-forest-800">
                Samruddhi Corridor Bypass
              </span>
            </div>

            <p className="text-xs text-ink-600 leading-relaxed mb-4">
              AI algorithm analyzed historical truck weigh-bridge delays at Kasara Ghat and redirected via the expressway corridor. Cold chain refrigeration load is optimized to 18°C.
            </p>

            <div className="grid grid-cols-3 gap-3 text-center border-t border-line-100 pt-3">
              <div>
                <span className="text-[10px] text-ink-400 uppercase font-semibold block">Distance Saved</span>
                <span className="text-sm font-bold text-forest-700 tabular-nums">-28 km</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-400 uppercase font-semibold block">Fuel Economy</span>
                <span className="text-sm font-bold text-forest-700 tabular-nums">14% Saved</span>
              </div>
              <div>
                <span className="text-[10px] text-ink-400 uppercase font-semibold block">Est. APMC Arrival</span>
                <span className="text-sm font-bold text-forest-900 tabular-nums">Today 06:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Available Transporters Assignment (§5.7) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-surface-0 border border-line-200 rounded-card p-5 shadow-ambient">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-bold text-base text-forest-900">
                  Available Transporters
                </h3>
                <p className="text-xs text-ink-500">
                  Verified fleets nearby ready for immediate dispatch
                </p>
              </div>
              <span className="text-xs font-bold text-steel-600">
                {transporters.length} Fleets
              </span>
            </div>

            {assignedSuccess && (
              <div className="mb-4 p-3 bg-forest-100 border border-forest-200 text-forest-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600" />
                <span>Transporter successfully assigned! Manifest generated.</span>
              </div>
            )}

            {/* List of Transporters */}
            <div className="space-y-3">
              {transporters.map((t) => {
                const isSelected = selectedTransporter?.id === t.id;
                const isAssigned = activeOrder?.transporterId === t.id;

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isSelected || isAssigned
                        ? 'bg-steel-50/70 border-steel-500 shadow-sm'
                        : 'bg-surface-0 border-line-200 hover:border-steel-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-forest-900">
                          <Truck className="w-4 h-4 text-steel-600 shrink-0" />
                          <span>{t.name}</span>
                        </div>
                        <span className="text-xs text-ink-500 block">
                          {t.vehicleType} • <strong className="text-ink-700">{t.regNumber}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-surface-0 px-2 py-0.5 rounded-pill border border-line-200 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{t.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 my-2.5">
                      {t.features.map((f, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-pill bg-cream-50 text-ink-600 border border-line-100"
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    <div className="pt-2.5 border-t border-line-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-ink-400 block">Corridor Rate</span>
                        <span className="font-bold text-forest-900 tabular-nums">
                          ₹{t.baseRatePerKm}/km
                        </span>
                      </div>

                      <Button
                        variant={isAssigned ? 'solid-forest' : 'steel'}
                        size="sm"
                        onClick={() => handleAssign(t)}
                        className="text-xs px-4"
                      >
                        {isAssigned ? 'Assigned ✓' : 'Assign Fleet'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Transporter Card snippet */}
          {activeOrder?.transporterName && (
            <div className="bg-steel-50 border border-steel-200 rounded-card p-4 text-xs">
              <span className="text-[10px] uppercase font-bold text-steel-700 block mb-1">
                Active Fleet Contact
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-forest-900 block text-sm">
                    {activeOrder.transporterName}
                  </span>
                  <span className="text-ink-600">{activeOrder.transporterVehicle}</span>
                </div>
                <Button
                  variant="steel"
                  size="sm"
                  icon={Phone}
                  className="text-xs"
                >
                  Call Driver
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
