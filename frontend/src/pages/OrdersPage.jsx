import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Truck,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Filter,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import OrderCard from '../components/ui/OrderCard';
import Button from '../components/ui/Button';
import StatusPill from '../components/ui/StatusPill';
import { useApp } from '../context/AppContext';

export default function OrdersPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    currentRole,
    switchRole,
    orders,
    updateOrderStatus,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'in-transit' | 'accepted' | 'paid'
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === 'all') return true;
    return order.status === activeFilter;
  });

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-forest-700 bg-sage-100 px-2.5 py-0.5 rounded-pill">
              Trade Settlement & Logistics
            </span>
            <span className="text-xs text-ink-500">• 100% Escrow Protected</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-forest-900">
            Order Management & Trade Tracking
          </h1>
          <p className="text-xs sm:text-sm text-ink-500">
            Monitor 5-stage trade lifecycle from order creation to farm gate dispatch and APMC receipt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/logistics')}
            icon={Truck}
          >
            Fleet Telemetry Map
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-line-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { key: 'all', label: `All Orders (${orders.length})` },
          { key: 'in-transit', label: 'In Transit' },
          { key: 'accepted', label: 'Accepted / Awaiting Fleet' },
          { key: 'paid', label: 'Delivered & Paid' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 rounded-pill text-xs font-semibold whitespace-nowrap transition-all ${
              activeFilter === tab.key
                ? 'bg-forest-700 text-white shadow-sm'
                : 'bg-surface-0 text-ink-700 border border-line-200 hover:bg-sage-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-5">
        {filteredOrders.length === 0 ? (
          <div className="bg-surface-0 border border-line-200 rounded-card p-12 text-center text-ink-500">
            No orders match the selected filter.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onTrackMap={() => navigate('/logistics')}
              onAssignTransport={() => navigate('/logistics')}
              onViewDetails={() => setSelectedOrderForModal(order)}
              onUpdateStatus={updateOrderStatus}
            />
          ))
        )}
      </div>

      {/* Order Detail Modal with Mini Map & Counterparty info (§5.6) */}
      {selectedOrderForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-in fade-in-50">
          <div className="bg-surface-0 border border-line-200 rounded-hero p-6 sm:p-8 max-w-xl w-full shadow-ambient-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-line-100 mb-4">
              <div>
                <span className="font-mono text-xs font-bold text-forest-700 bg-sage-100 px-2.5 py-1 rounded-md">
                  {selectedOrderForModal.orderNumber}
                </span>
                <h3 className="font-display font-bold text-xl text-forest-900 mt-1">
                  Order Trade Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderForModal(null)}
                className="w-8 h-8 rounded-full bg-sage-100 text-ink-600 hover:text-ink-900 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-center justify-between p-3.5 bg-cream-50 rounded-2xl border border-line-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-ink-400 block">Commodity</span>
                  <span className="font-bold text-forest-900 text-base">{selectedOrderForModal.cropName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-ink-400 block">Settlement Value</span>
                  <span className="font-bold text-forest-900 text-base tabular-nums">
                    ₹{Number(selectedOrderForModal.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Pickup & Delivery Mini Cards (§5.6) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-surface-0 border border-line-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-forest-700 font-bold text-xs mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Pickup (Farm Gate)</span>
                  </div>
                  <p className="font-bold text-ink-900">{selectedOrderForModal.farmerName}</p>
                  <p className="text-ink-500 text-xs">{selectedOrderForModal.farmerLocation}</p>
                </div>

                <div className="p-3.5 bg-surface-0 border border-line-200 rounded-xl">
                  <div className="flex items-center gap-1.5 text-steel-600 font-bold text-xs mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>Delivery (APMC Terminal)</span>
                  </div>
                  <p className="font-bold text-ink-900">{selectedOrderForModal.buyerName}</p>
                  <p className="text-ink-500 text-xs">{selectedOrderForModal.buyerLocation}</p>
                </div>
              </div>

              {/* Status Advance Selector for Judges */}
              <div className="p-3.5 bg-sage-50 rounded-2xl border border-sage-200">
                <span className="text-xs font-bold text-forest-900 block mb-2">
                  Demo Fast-Forward (Advance Order State):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {['placed', 'accepted', 'in-transit', 'delivered', 'paid'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateOrderStatus(selectedOrderForModal.id, st);
                        setSelectedOrderForModal({ ...selectedOrderForModal, status: st });
                      }}
                      className={`py-1.5 px-2 rounded-pill text-[11px] font-semibold capitalize transition-all ${
                        selectedOrderForModal.status === st
                          ? 'bg-forest-700 text-white shadow-sm'
                          : 'bg-surface-0 text-ink-700 hover:bg-sage-100 border border-line-200'
                      }`}
                    >
                      {st.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setSelectedOrderForModal(null);
                    navigate('/logistics');
                  }}
                  icon={Truck}
                >
                  Open Live Map
                </Button>
                <Button
                  variant="solid-forest"
                  size="md"
                  onClick={() => setSelectedOrderForModal(null)}
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
