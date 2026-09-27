'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCropById } from '@/lib/api/crops';
import { CropWithFarmer } from '@/types/crop';
import { CropImage } from '@/components/marketplace/CropImage';
import { SampleRequestModal } from '@/components/marketplace/SampleRequestModal';
import { BulkOrderModal } from '@/components/buyer/BulkOrderModal';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { formatCurrency, formatDate, formatFarmerIdentity } from '@/lib/utils';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Leaf,
  Calendar,
  Warehouse,
  Droplet,
  FlaskConical,
  Package,
  ShoppingCart,
  Send,
  User,
} from 'lucide-react';

export default function CropDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [crop, setCrop] = useState<CropWithFarmer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    async function loadCrop() {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getCropById(id);
        setCrop(data);
      } catch (err) {
        console.error('Error loading crop details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCrop();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <LoadingState message="Loading verified crop parameters..." />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16">
        <ErrorState
          title="Crop listing not found"
          message="The requested crop listing does not exist or has already been fulfilled."
          onRetry={() => router.push('/marketplace')}
        />
      </div>
    );
  }

  const farmerIdentity = formatFarmerIdentity(crop.farm_name, crop.farmer_name);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <Link
        href="/marketplace"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Marketplace</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Agronomy Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm relative">
            <CropImage
              name={crop.name}
              category={crop.category}
              src={crop.primary_image_url}
              aspectRatio="aspect-[16/10]"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="emerald" className="bg-white/95 shadow-md">
                {crop.quality_grade}
              </Badge>
              {crop.organic && (
                <Badge variant="amber" className="bg-amber-500 text-white shadow-md">
                  Certified Organic
                </Badge>
              )}
            </div>
          </div>

          {/* Description & Technical Agronomy Specs */}
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Crop Specifications & Agronomy</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {crop.description ||
                  'No additional qualitative notes provided. Produce has undergone standard APMC grading.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" /> Moisture
                </span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  {crop.moisture_percent ? `${crop.moisture_percent}%` : 'Standard'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5 text-amber-500" /> Storage Type
                </span>
                <span className="text-sm font-black text-slate-900 mt-1 block truncate">
                  {crop.storage_type || 'Dry Godown'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Harvest Date
                </span>
                <span className="text-sm font-black text-slate-900 mt-1 block">
                  {formatDate(crop.harvest_date)}
                </span>
              </div>
            </div>

            {crop.fertilizers_used && (
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                <FlaskConical className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Nutrient & Fertilizer Regimen:</strong>
                  <span>{crop.fertilizers_used}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Pricing, Farmer Identity, and Actions */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                {crop.category} · {crop.quality_grade}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                {crop.name}
              </h2>
              <p className="text-sm font-medium text-slate-500">{crop.variety}</p>
            </div>

            {/* Price Box */}
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-2xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Farm Gate Price Rate
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-900">
                  {formatCurrency(crop.price_per_unit)}
                </span>
                <span className="text-xs font-semibold text-slate-500">per {crop.unit}</span>
              </div>

              <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center justify-between text-xs text-slate-700">
                <span>Available Lot:</span>
                <strong className="font-black text-slate-900">
                  {crop.quantity.toLocaleString('en-IN')} {crop.unit}
                </strong>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setIsOrderModalOpen(true)}
                leftIcon={<ShoppingCart className="w-4 h-4" />}
              >
                Place Bulk Purchase Order
              </Button>

              <Button
                variant="outline"
                size="md"
                className="w-full"
                onClick={() => setIsSampleModalOpen(true)}
                leftIcon={<Send className="w-4 h-4 text-emerald-700" />}
              >
                Request 1-5 kg Quality Sample
              </Button>
            </div>

            {/* Location & Dispatch */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Dispatch location: <strong className="text-slate-800">{crop.location}</strong></span>
            </div>
          </Card>

          {/* Farmer Identity & Profile Link */}
          <Card className="p-5 border-slate-100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg ring-2 ring-emerald-600/20">
                <User className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-black text-slate-900 truncate">
                    {farmerIdentity}
                  </p>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                </div>
                <p className="text-xs text-slate-500 truncate">{crop.location}</p>
              </div>
            </div>

            <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Verified Producer</span>
              <Link
                href={`/profile/${crop.farmer_id}`}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                View Farmer Profile →
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Sample Request Modal */}
      <SampleRequestModal
        crop={crop}
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
      />

      {/* Bulk Order Modal */}
      <BulkOrderModal
        crop={crop}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}
