'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getFarmerCrops } from '@/lib/api/crops';
import { getSampleRequests } from '@/lib/api/samples';
import { getOrders } from '@/lib/api/orders';
import { CropWithFarmer } from '@/types/crop';
import { SampleRequestWithDetails } from '@/types/sample';
import { OrderWithDetails } from '@/types/order';
import { StatTile } from '@/components/ui/StatTile';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { FarmerCropsList } from '@/components/farmer/FarmerCropsList';
import { FarmerSamplesList } from '@/components/farmer/FarmerSamplesList';
import { FarmerOrdersList } from '@/components/farmer/FarmerOrdersList';
import { AddCropModal } from '@/components/farmer/AddCropModal';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  Tractor,
  Package,
  Layers,
  ShoppingBag,
  Clock,
  Plus,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

export default function FarmerDashboardPage() {
  const { user, role } = useAuth();
  const [crops, setCrops] = useState<CropWithFarmer[]>([]);
  const [samples, setSamples] = useState<SampleRequestWithDetails[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('listings');
  const [isAddCropModalOpen, setIsAddCropModalOpen] = useState(false);

  const fetchFarmerData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [cropsData, samplesData, ordersData] = await Promise.all([
        getFarmerCrops(user.id),
        getSampleRequests('farmer', user.id),
        getOrders('farmer', user.id),
      ]);
      setCrops(cropsData);
      setSamples(samplesData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching farmer dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFarmerData();
  }, [fetchFarmerData]);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const pendingSamplesCount = samples.filter((s) => s.status === 'sample_requested').length;

  const tabs = [
    { id: 'listings', label: 'Crops Catalog', badge: crops.length, icon: <Layers className="w-4 h-4" /> },
    { id: 'samples', label: 'Sample Requests', badge: pendingSamplesCount > 0 ? pendingSamplesCount : undefined, icon: <Package className="w-4 h-4" /> },
    { id: 'orders', label: 'Bulk Orders', badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined, icon: <ShoppingBag className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Tractor className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge variant="emerald">Producer Enterprise Center</Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Farmer Trade Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your harvest listings, dispatch quality samples, and fulfill bulk buyer contracts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/profile/${user?.id || '00000000-0000-0000-0000-000000000001'}`}>
            <Button variant="outline" size="sm">
              Public Profile
            </Button>
          </Link>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddCropModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add New Crop
          </Button>
        </div>
      </div>

      {/* Real Statistics Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatTile
          title="Active Crop Listings"
          value={crops.length}
          subtitle="Harvest lots visible to buyers"
          icon={<Layers className="w-5 h-5" />}
          color="emerald"
        />
        <StatTile
          title="Sample Inquiries"
          value={samples.length}
          subtitle={`${pendingSamplesCount} awaiting dispatch`}
          icon={<Package className="w-5 h-5" />}
          color="amber"
        />
        <StatTile
          title="Bulk Trade Orders"
          value={orders.length}
          subtitle={`${pendingOrdersCount} awaiting confirmation`}
          icon={<ShoppingBag className="w-5 h-5" />}
          color="blue"
        />
        <StatTile
          title="Pending Actions"
          value={pendingOrdersCount + pendingSamplesCount}
          subtitle="Requires immediate response"
          icon={<Clock className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Tabs & Content */}
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id)} />

        {isLoading ? (
          <LoadingState message="Connecting to Supabase farmer records..." />
        ) : (
          <div>
            {activeTab === 'listings' && (
              <FarmerCropsList
                crops={crops}
                onRefresh={fetchFarmerData}
                onAddClick={() => setIsAddCropModalOpen(true)}
              />
            )}
            {activeTab === 'samples' && (
              <FarmerSamplesList samples={samples} onRefresh={fetchFarmerData} />
            )}
            {activeTab === 'orders' && (
              <FarmerOrdersList orders={orders} onRefresh={fetchFarmerData} />
            )}
          </div>
        )}
      </div>

      {/* Add Crop Modal */}
      <AddCropModal
        isOpen={isAddCropModalOpen}
        onClose={() => setIsAddCropModalOpen(false)}
        onSuccess={fetchFarmerData}
      />
    </div>
  );
}
