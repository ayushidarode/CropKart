'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getPriceTrends,
  getDemandForecast,
  getPricingIntelligence,
} from '@/lib/api/forecast';
import { PriceTrendPoint, DemandForecastData, PricingIntelligenceData } from '@/types/forecast';
import { PriceTrendChart } from '@/components/insights/PriceTrendChart';
import { SupplyArrivalChart } from '@/components/insights/SupplyArrivalChart';
import { DemandForecastCard } from '@/components/insights/DemandForecastCard';
import {
  WeatherImpactBadge,
  FestivalDemandAlert,
  MarketplaceDemandSignal,
} from '@/components/insights/WeatherImpactBadge';
import { RouteOptimizationPanel } from '@/components/transporter/RouteOptimizationPanel';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { TrendingUp, BarChart3, Filter, Sparkles } from 'lucide-react';

const COMMODITIES = ['Wheat', 'Tomato', 'Rice', 'Soybean', 'Onion', 'Cotton'];
const MANDIS = ['Pune Mandi Yard', 'Nashik APMC', 'Lasalgaon Mandi', 'Ludhiana Central', 'Anand Yard'];

export default function MarketIntelligencePage() {
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [selectedMandi, setSelectedMandi] = useState('Pune Mandi Yard');
  const [priceData, setPriceData] = useState<PriceTrendPoint[]>([]);
  const [dataSource, setDataSource] = useState('');
  const [forecastData, setForecastData] = useState<DemandForecastData | null>(null);
  const [pricingData, setPricingData] = useState<PricingIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIntelligenceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [trendRes, forecastRes, pricingRes] = await Promise.all([
        getPriceTrends(selectedCommodity),
        getDemandForecast(selectedCommodity, selectedMandi.split(' ')[0]),
        getPricingIntelligence(selectedCommodity, selectedMandi.split(' ')[0]),
      ]);

      setPriceData(trendRes.data);
      setDataSource(trendRes.source);
      setForecastData(forecastRes);
      setPricingData(pricingRes);
    } catch (err) {
      console.error('Error loading market intelligence data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCommodity, selectedMandi]);

  useEffect(() => {
    fetchIntelligenceData();
  }, [fetchIntelligenceData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
            </div>
            <Badge variant="emerald">Agmarknet & Fast-API Ingestion</Badge>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Market Intelligence & Demand Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Empowering producers with verified mandi modal trends, supply volume arrivals, and AI predictive signals.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-600 shadow-sm w-fit">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Source: {dataSource || 'Agmarknet Government Mandi Data'}</span>
        </div>
      </div>

      {/* Selectors Bar */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Commodity:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMMODITIES.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCommodity(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCommodity === c
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Regional Mandi:</span>
          <select
            value={selectedMandi}
            onChange={(e) => setSelectedMandi(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-600"
          >
            {MANDIS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Top Advisory Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <WeatherImpactBadge
          condition="Clear Weather · Safe for Field Packing"
          temp="32°C"
          rainfallMm={0}
        />
        <FestivalDemandAlert
          festivalName="Rabi Harvest & Procurement Rush"
          impact="+18% increased buyer bids for direct farm gate pickup"
        />
        <MarketplaceDemandSignal
          activeRequirements={52}
          topDemandedCrops={[selectedCommodity, 'Sharbati Wheat', 'Garwa Onion']}
        />
      </div>

      {/* Charts Section */}
      {isLoading ? (
        <LoadingState message="Synthesizing historical mandi data and predictive signals..." />
      ) : (
        <div className="space-y-8">
          {/* Historical Price Chart */}
          <Card className="p-6">
            <PriceTrendChart data={priceData} source={dataSource} />
          </Card>

          {/* Supply & Arrival Chart + Demand Forecast Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <Card className="p-6">
                <SupplyArrivalChart data={priceData} />
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <DemandForecastCard data={forecastData} />

              {pricingData && (
                <Card className="p-6 space-y-4 border-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-900">
                      Pricing Intelligence Benchmark
                    </h4>
                    <span className="text-xs font-mono font-bold text-emerald-700">
                      {pricingData.confidenceLevel} Confidence
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-semibold">Current Mandi Rate</span>
                      <strong className="text-base font-black text-slate-900 block mt-0.5">
                        ₹{pricingData.currentMarketPrice}/Qtl
                      </strong>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-xl">
                      <span className="text-emerald-800 block font-semibold">Recommended Offer</span>
                      <strong className="text-base font-black text-emerald-900 block mt-0.5">
                        ₹{pricingData.recommendedSellingPrice}/Qtl
                      </strong>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="text-slate-400 block font-semibold">Government MSP</span>
                      <strong className="text-base font-black text-slate-700 block mt-0.5">
                        ₹{pricingData.minimumSupportPrice}/Qtl
                      </strong>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl">
                      <span className="text-amber-800 block font-semibold">Price Trend</span>
                      <strong className="text-base font-black text-amber-900 block mt-0.5">
                        {pricingData.priceTrend}
                      </strong>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Integrated Route Optimization Panel */}
          <div className="pt-4">
            <RouteOptimizationPanel
              origin={`${selectedMandi.split(' ')[0]} Yard`}
              destination="Vashi APMC Central Terminal, Navi Mumbai"
              distanceKm={185}
              durationHours={4.2}
              estimatedCost={5600}
            />
          </div>
        </div>
      )}
    </div>
  );
}
