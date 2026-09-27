'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getOrders } from '@/lib/api/orders';
import { getSampleRequests } from '@/lib/api/samples';
import { OrderWithDetails } from '@/types/order';
import { SampleRequestWithDetails } from '@/types/sample';
import { StatTile } from '@/components/ui/StatTile';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BuyerOrdersList } from '@/components/buyer/BuyerOrdersList';
import { BuyerSamplesList } from '@/components/buyer/BuyerSamplesList';
import { BulkOrderModal } from '@/components/buyer/BulkOrderModal';
import { LoadingState } from '@/components/ui/LoadingState';
import { ShoppingBag, Package, Store, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function BuyerDashboardPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [samples, setSamples] = useState<SampleRequestWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedCropForOrder, setSelectedCropForOrder] = useState<any>(null);

  const fetchBuyerData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [ordersData, samplesData] = await Promise.all([
        getOrders('buyer', user.id),
        getSampleRequests('buyer', user.id),
      ]);
      setOrders(ordersData);
      setSamples(samplesData);
    } catch (err) {
      console.error('Error fetching buyer dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBuyerData();
  }, [fetchBuyerData]);

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  const inTransitSamplesCount = samples.filter((s) => s.status === 'sample_sent').length;

  const tabs = [
    { id: 'orders', label: 'Procurement Contracts', badge: orders.length, icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'samples', label: 'Quality Verification Samples', badge: inTransitSamplesCount > 0 ? inTransitSamplesCount : undefined, icon: <Package className="w-4 h-4" /> },
  ];

  const handleOrderFromSample = (sample: SampleRequestWithDetails) => {
    if (sample.crop) {
      setSelectedCropForOrder({
        ...sample.crop,
        farm_name: sample.farmer?.farmer_profiles?.farm_name,
        farmer_name: sample.farmer?.name,
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge variant="emerald">Wholesale Procurement Hub</Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Buyer Procurement Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track active agricultural purchase contracts, test quality samples, and evaluate mandi prices.
          </p>
        </div>

        <Link href="/marketplace">
          <Button variant="primary" size="sm" leftIcon={<Store className="w-4 h-4" />}>
            Browse Marketplace
          </Button>
        </Link>
      </div>

      {/* Real Statistics Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile
          title="Active Trade Orders"
          value={activeOrdersCount}
          subtitle="Orders in transit or pending pickup"
          icon={<ShoppingBag className="w-5 h-5" />}
          color="emerald"
        />
        <StatTile
          title="Samples In Transit"
          value={inTransitSamplesCount}
          subtitle="Couriers out for delivery"
          icon={<Package className="w-5 h-5" />}
          color="amber"
        />
        <StatTile
          title="Total Contracts Completed"
          value={orders.filter((o) => o.status === 'delivered').length}
          subtitle="Verified farm-direct deliveries"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="blue"
        />
        <StatTile
          title="Total Procurement"
          value={orders.reduce((sum, o) => sum + o.quantity, 0).toLocaleString('en-IN') + ' kg'}
          subtitle="Gross volume contracted"
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Tabs & Content */}
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />

        {isLoading ? (
          <LoadingState message="Connecting to Supabase procurement contracts..." />
        ) : (
          <div>
            {activeTab === 'orders' && <BuyerOrdersList orders={orders} />}
            {activeTab === 'samples' && (
              <BuyerSamplesList
                samples={samples}
                onRefresh={fetchBuyerData}
                onOrderClick={handleOrderFromSample}
              />
            )}
          </div>
        )}
      </div>

      {/* Bulk Order Modal */}
      <BulkOrderModal
        crop={selectedCropForOrder}
        isOpen={Boolean(selectedCropForOrder)}
        onClose={() => setSelectedCropForOrder(null)}
        onSuccess={fetchBuyerData}
      />
    </div>
  );
}
