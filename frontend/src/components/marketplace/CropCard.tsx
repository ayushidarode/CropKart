'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, Leaf, ArrowRight, Eye } from 'lucide-react';
import { CropWithFarmer } from '@/types/crop';
import { CropImage } from './CropImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatFarmerIdentity } from '@/lib/utils';

export interface CropCardProps {
  crop: CropWithFarmer;
  onRequestSample?: (crop: CropWithFarmer) => void;
  onBuyOrder?: (crop: CropWithFarmer) => void;
}

export function CropCard({ crop, onRequestSample }: CropCardProps) {
  const farmerIdentity = formatFarmerIdentity(crop.farm_name, crop.farmer_name);

  return (
    <div className="group bg-white rounded-3xl border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Crop Image Header */}
      <div className="relative">
        <Link href={`/marketplace/${crop.id}`}>
          <CropImage
            name={crop.name}
            category={crop.category}
            src={crop.primary_image_url}
            aspectRatio="aspect-[16/10]"
          />
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <Badge variant="emerald" size="sm" className="bg-white/95 backdrop-blur-sm shadow-sm text-emerald-900 border-none">
            {crop.quality_grade}
          </Badge>
          {crop.organic && (
            <Badge variant="amber" size="sm" className="bg-amber-500 text-white border-none shadow-sm flex items-center gap-1 font-bold">
              <Leaf className="w-3 h-3" />
              <span>Organic</span>
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-xl text-[11px] font-bold tracking-wide">
          {crop.quantity.toLocaleString('en-IN')} {crop.unit} available
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Category */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/marketplace/${crop.id}`}>
                <h4 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1 tracking-tight">
                  {crop.name}
                </h4>
              </Link>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {crop.variety} · <span className="text-slate-400">{crop.category}</span>
              </p>
            </div>
          </div>

          {/* Farmer & Location */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            <Link
              href={`/profile/${crop.farmer_id}`}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 transition-colors"
              title="View farmer producer profile"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">{farmerIdentity}</span>
            </Link>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{crop.location}</span>
            </div>
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Price per {crop.unit}
            </p>
            <p className="text-lg font-black text-emerald-800 tracking-tight">
              {formatCurrency(crop.price_per_unit)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/marketplace/${crop.id}`}>
              <Button size="sm" variant="outline" className="px-2.5 py-1.5" title="View details">
                <Eye className="w-3.5 h-3.5 text-slate-600" />
              </Button>
            </Link>

            {onRequestSample && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onRequestSample(crop)}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                Sample
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
