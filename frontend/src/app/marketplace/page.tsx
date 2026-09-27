'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCrops } from '@/lib/api/crops';
import { CropWithFarmer, CropFilterParams } from '@/types/crop';
import { FilterBar } from '@/components/marketplace/FilterBar';
import { CropCard } from '@/components/marketplace/CropCard';
import { SampleRequestModal } from '@/components/marketplace/SampleRequestModal';
import { BulkOrderModal } from '@/components/buyer/BulkOrderModal';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { Store, Sparkles } from 'lucide-react';

export default function MarketplacePage() {
  const [crops, setCrops] = useState<CropWithFarmer[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [filters, setFilters] = useState<CropFilterParams>({
    category: 'All',
    quality: 'All',
    sortBy: 'newest',
  });

  const [selectedCropForSample, setSelectedCropForSample] = useState<CropWithFarmer | null>(null);
  const [selectedCropForOrder, setSelectedCropForOrder] = useState<CropWithFarmer | null>(null);

  const fetchMarketplaceCrops = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const res = await getCrops(filters);
      setCrops(res.crops);
      setTotal(res.total);
    } catch (err) {
      console.error('Error fetching crops:', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMarketplaceCrops();
  }, [fetchMarketplaceCrops]);

  const handleResetFilters = () => {
    setFilters({
      category: 'All',
      quality: 'All',
      sortBy: 'newest',
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      minStock: undefined,
      organicOnly: false,
      location: '',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <Store className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge variant="emerald" size="sm">
              Live Mandi & Farm Trade
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Agricultural Crop Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Certified farm-direct lots, transparent price rates, and quality-tested sample dispatches.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Real-time Supabase Database Sync</span>
        </div>
      </div>

      {/* Filter Component */}
      <FilterBar
        filters={filters}
        onChange={(newFilters) => setFilters(newFilters)}
        onReset={handleResetFilters}
        totalResults={total}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState message="Fetching live crop listings from Supabase..." />
      ) : hasError ? (
        <ErrorState
          title="Could not load marketplace produce"
          message="Failed to retrieve crop listings from database. Please verify connection and retry."
          onRetry={fetchMarketplaceCrops}
        />
      ) : crops.length === 0 ? (
        <EmptyState
          title="No Crops Found Matching Your Filters"
          description="Try broadening your search term, clearing price bounds, or switching to 'All Categories'."
          actionLabel="Reset All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onRequestSample={(c) => setSelectedCropForSample(c)}
              onBuyOrder={(c) => setSelectedCropForOrder(c)}
            />
          ))}
        </div>
      )}

      {/* Sample Request Modal */}
      <SampleRequestModal
        crop={selectedCropForSample}
        isOpen={Boolean(selectedCropForSample)}
        onClose={() => setSelectedCropForSample(null)}
      />

      {/* Bulk Order Modal */}
      <BulkOrderModal
        crop={selectedCropForOrder}
        isOpen={Boolean(selectedCropForOrder)}
        onClose={() => setSelectedCropForOrder(null)}
      />
    </div>
  );
}
