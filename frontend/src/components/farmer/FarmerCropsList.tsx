'use client';

import React, { useState } from 'react';
import { CropWithFarmer } from '@/types/crop';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CropImage } from '@/components/marketplace/CropImage';
import { updateCrop, deleteCrop } from '@/lib/api/crops';
import { formatCurrency } from '@/lib/utils';
import { Trash2, CheckCircle2, XCircle, Plus } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export function FarmerCropsList({
  crops,
  onRefresh,
  onAddClick,
}: {
  crops: CropWithFarmer[];
  onRefresh: () => void;
  onAddClick: () => void;
}) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleToggleStatus = async (crop: CropWithFarmer) => {
    setUpdatingId(crop.id);
    const newStatus = crop.status === 'available' ? 'reserved' : 'available';
    await updateCrop(crop.id, { status: newStatus });
    setUpdatingId(null);
    onRefresh();
  };

  const handleDelete = async (cropId: string) => {
    if (confirm('Are you sure you want to remove this crop listing?')) {
      setUpdatingId(cropId);
      await deleteCrop(cropId);
      setUpdatingId(null);
      onRefresh();
    }
  };

  if (crops.length === 0) {
    return (
      <EmptyState
        title="No Crops Listed Yet"
        description="List your harvest to receive direct sample inquiries and bulk trade contracts from verified wholesale buyers."
        actionLabel="List Your First Crop"
        onAction={onAddClick}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h4 className="text-sm font-bold text-slate-900">
          Active Harvest Listings ({crops.length})
        </h4>
        <Button size="sm" variant="primary" onClick={onAddClick} leftIcon={<Plus className="w-4 h-4" />}>
          Add Crop
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {crops.map((crop) => (
          <div
            key={crop.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative">
                <CropImage
                  name={crop.name}
                  category={crop.category}
                  src={crop.primary_image_url}
                  aspectRatio="aspect-[16/9]"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant={crop.status === 'available' ? 'emerald' : 'amber'} size="sm">
                    {crop.status.toUpperCase()}
                  </Badge>
                  {crop.organic && (
                    <Badge variant="amber" size="sm">
                      ORGANIC
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{crop.name}</h5>
                    <p className="text-xs text-slate-500">{crop.variety}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-800">
                    {formatCurrency(crop.price_per_unit)}/{crop.unit}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                  <span>Stock: {crop.quantity.toLocaleString('en-IN')} {crop.unit}</span>
                  <span>{crop.quality_grade}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button
                size="sm"
                variant={crop.status === 'available' ? 'outline' : 'secondary'}
                onClick={() => handleToggleStatus(crop)}
                isLoading={updatingId === crop.id}
                className="text-xs"
              >
                {crop.status === 'available' ? 'Mark Reserved' : 'Make Available'}
              </Button>

              <button
                onClick={() => handleDelete(crop.id)}
                disabled={updatingId === crop.id}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
