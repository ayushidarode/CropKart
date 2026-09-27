'use client';

import React from 'react';
import { CloudSun, Calendar, ShoppingCart, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function WeatherImpactBadge({
  condition = 'Dry & Favorable for Harvest',
  temp = '31°C',
  rainfallMm = 0,
}: {
  condition?: string;
  temp?: string;
  rainfallMm?: number;
}) {
  return (
    <Card className="p-4 bg-sky-50/50 border-sky-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-sky-100 text-sky-800 rounded-2xl">
          <CloudSun className="w-5 h-5 text-sky-600" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-sky-800/80 tracking-wider block">
            Agri-Climatic Advisory
          </span>
          <span className="text-sm font-bold text-slate-900 block">{condition}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs font-black text-slate-800">{temp}</span>
        <span className="text-[10px] text-slate-500 block">Rainfall: {rainfallMm}mm</span>
      </div>
    </Card>
  );
}

export function FestivalDemandAlert({
  festivalName = 'Baisakhi & Chaitra Navratri Procurement',
  impact = '+24% surge in regional grain and pulse intake',
}: {
  festivalName?: string;
  impact?: string;
}) {
  return (
    <Card className="p-4 bg-amber-50/60 border-amber-200/80 flex items-center gap-3">
      <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl flex-shrink-0">
        <Calendar className="w-5 h-5 text-amber-700" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full">
            Seasonal Festival Alert
          </span>
        </div>
        <p className="text-xs font-bold text-slate-900 mt-1">{festivalName}</p>
        <p className="text-[11px] text-amber-900/90 font-medium">{impact}</p>
      </div>
    </Card>
  );
}

export function MarketplaceDemandSignal({
  activeRequirements = 48,
  topDemandedCrops = ['Sharbati Wheat', 'Desi Tomato', 'Pusa Basmati'],
}: {
  activeRequirements?: number;
  topDemandedCrops?: string[];
}) {
  return (
    <Card className="p-4 bg-emerald-50/50 border-emerald-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
          <ShoppingCart className="w-5 h-5 text-emerald-700" />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
            Marketplace Demand Signal
          </span>
          <p className="text-xs font-bold text-slate-900">
            {activeRequirements} verified wholesale requirements active
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            High demand for: {topDemandedCrops.join(', ')}
          </p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-emerald-700" />
    </Card>
  );
}
