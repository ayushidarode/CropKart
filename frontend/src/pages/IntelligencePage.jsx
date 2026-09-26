import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart3,
  Wheat,
  Calendar,
  MapPin,
  Leaf,
  Info,
} from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import StatCard from '../components/ui/StatCard';
import TrendChart from '../components/ui/TrendChart';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';

// Historical 30-day APMC spot prices for Recharts
const WHEAT_CHART_DATA = [
  { date: '1 Sep', price: 2680 },
  { date: '5 Sep', price: 2710 },
  { date: '10 Sep', price: 2740 },
  { date: '15 Sep', price: 2790 },
  { date: '20 Sep', price: 2820 },
  { date: '23 Sep', price: 2840 },
  { date: '26 Sep', price: 2850 },
  { date: '30 Sep (AI)', price: 2920 },
  { date: '5 Oct (AI)', price: 2980 },
];

const TOMATO_CHART_DATA = [
  { date: '1 Sep', price: 1800 },
  { date: '5 Sep', price: 1950 },
  { date: '10 Sep', price: 2100 },
  { date: '15 Sep', price: 2050 },
  { date: '20 Sep', price: 2180 },
  { date: '23 Sep', price: 2240 },
  { date: '26 Sep', price: 2200 },
  { date: '30 Sep (AI)', price: 2350 },
  { date: '5 Oct (AI)', price: 2450 },
];

const SOYBEAN_CHART_DATA = [
  { date: '1 Sep', price: 4750 },
  { date: '5 Sep', price: 4800 },
  { date: '10 Sep', price: 4820 },
  { date: '15 Sep', price: 4880 },
  { date: '20 Sep', price: 4900 },
  { date: '23 Sep', price: 4910 },
  { date: '26 Sep', price: 4920 },
  { date: '30 Sep (AI)', price: 5040 },
  { date: '5 Oct (AI)', price: 5120 },
];

const HIGH_DEMAND_CROPS = [
  { rank: '01', name: 'Sharbati Wheat (Grade A+)', demandScore: 94, volume: '14,200 Tonnes', growth: '+22%' },
  { rank: '02', name: 'Hybrid Tomatoes (Abhinav F1)', demandScore: 88, volume: '9,800 Tonnes', growth: '+18%' },
  { rank: '03', name: 'Nashik Red Onions', demandScore: 82, volume: '12,500 Tonnes', growth: '+15%' },
  { rank: '04', name: 'Yellow Soybeans (JS 335)', demandScore: 78, volume: '8,400 Tonnes', growth: '+12%' },
  { rank: '05', name: 'Basmati Rice Pusa 1121', demandScore: 74, volume: '6,100 Tonnes', growth: '+9%' },
];

export default function IntelligencePage() {
  const {
    currentUser,
    currentRole,
    switchRole,
    notifications,
    markAllNotificationsRead,
    language,
    setLanguage,
    searchQuery,
    setSearchQuery,
  } = useApp();

  const [selectedCropChart, setSelectedCropChart] = useState('wheat');

  const chartData =
    selectedCropChart === 'wheat'
      ? WHEAT_CHART_DATA
      : selectedCropChart === 'tomato'
      ? TOMATO_CHART_DATA
      : SOYBEAN_CHART_DATA;

  const currentChartTitle =
    selectedCropChart === 'wheat'
      ? 'Sharbati Wheat (Grade A+)'
      : selectedCropChart === 'tomato'
      ? 'Hybrid Tomatoes'
      : 'Yellow Soybeans';

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
              Agri Market Intelligence
            </span>
            <span className="text-xs text-ink-500">• Government APMC Live Feeds</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-forest-900">
            Mandi Price Intelligence & AI Demand Forecasting
          </h1>
          <p className="text-xs sm:text-sm text-ink-500">
            Real-time APMC wholesale price discovery with 30-day econometric trend analysis and AI guidance.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-500 bg-surface-0 border border-line-200 px-3 py-1.5 rounded-pill shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-forest-700" />
          <span>Last Updated: Today 08:30 AM IST</span>
        </div>
      </div>

      {/* Mandi Price Cards with Sparklines & 7-Day Deltas (§5.9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Sharbati Wheat"
          value="₹2,850"
          unit="/qtl"
          delta="+₹70 (+2.5%)"
          deltaText="vs last week"
          sparklineData={[40, 50, 65, 70, 75, 85, 95]}
        />
        <StatCard
          title="Hybrid Tomatoes"
          value="₹2,200"
          unit="/qtl"
          delta="+₹120 (+5.7%)"
          deltaText="vs last week"
          sparklineData={[30, 45, 60, 55, 70, 80, 90]}
        />
        <StatCard
          title="Yellow Soybeans"
          value="₹4,920"
          unit="/qtl"
          delta="+₹40 (+0.8%)"
          deltaText="vs last week"
          sparklineData={[60, 65, 70, 72, 75, 78, 82]}
        />
        <StatCard
          title="Red Onions"
          value="₹2,400"
          unit="/qtl"
          delta="-₹35 (-1.4%)"
          deltaText="vs last week"
          sparklineData={[80, 85, 82, 78, 75, 72, 70]}
        />
      </div>

      {/* Interactive Price Trend Chart & AI Forecast (§5.9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left Column (8 cols): TrendChart */}
        <div className="lg:col-span-8 space-y-4">
          {/* Crop Selector Tabs for Chart */}
          <div className="flex items-center gap-2 bg-surface-0 border border-line-200 p-1 rounded-pill w-fit text-xs font-semibold">
            <button
              onClick={() => setSelectedCropChart('wheat')}
              className={`px-3 py-1.5 rounded-pill transition-all ${
                selectedCropChart === 'wheat'
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-ink-600 hover:text-forest-900'
              }`}
            >
              Sharbati Wheat
            </button>
            <button
              onClick={() => setSelectedCropChart('tomato')}
              className={`px-3 py-1.5 rounded-pill transition-all ${
                selectedCropChart === 'tomato'
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-ink-600 hover:text-forest-900'
              }`}
            >
              Hybrid Tomatoes
            </button>
            <button
              onClick={() => setSelectedCropChart('soybean')}
              className={`px-3 py-1.5 rounded-pill transition-all ${
                selectedCropChart === 'soybean'
                  ? 'bg-forest-700 text-white shadow-sm'
                  : 'text-ink-600 hover:text-forest-900'
              }`}
            >
              Yellow Soybeans
            </button>
          </div>

          {/* Recharts Wrapper Component */}
          <TrendChart
            data={chartData}
            cropName={currentChartTitle}
            dataKey="price"
            xKey="date"
            height={320}
          />
        </div>

        {/* Right Column (4 cols): Demand Forecast Card (§5.9) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Demand Forecast AI Card visually tied to CropSathi */}
          <div className="bg-gradient-to-br from-forest-900 to-forest-950 text-white rounded-card p-6 shadow-ambient-lg border border-forest-800">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-lime-400 text-forest-900 flex items-center justify-center font-bold">
                <Leaf className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white">
                  CropSathi AI Demand Forecast
                </h3>
                <span className="text-[10px] text-lime-400 font-semibold">
                  30-Day Outlook Matrix
                </span>
              </div>
            </div>

            <p className="text-xs text-sage-200 leading-relaxed mb-4">
              "Heavy institutional procurement demand observed across Western Maharashtra for <strong className="text-lime-300">Sharbati Wheat & Organic Tomatoes</strong>. Supply arrivals are down 12% in major APMCs, creating a favorable pricing window for farmers holding Grade A inventory."
            </p>

            <div className="space-y-2 border-t border-forest-800/80 pt-3 text-xs">
              <div className="flex items-center justify-between text-sage-300">
                <span>Price Volatility Index:</span>
                <span className="text-lime-400 font-bold">Low (Stable Upward)</span>
              </div>
              <div className="flex items-center justify-between text-sage-300">
                <span>Recommended Farmer Action:</span>
                <span className="text-white font-bold">Hold for +₹80 Target</span>
              </div>
              <div className="flex items-center justify-between text-sage-300">
                <span>Buyer Buying Pressure:</span>
                <span className="text-lime-400 font-bold">High (3.4x Bids)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "High-Demand Crops" Ranked List with Steel-500 Bar Indicators (§5.9) */}
      <section className="bg-surface-0 border border-line-200 rounded-card p-6 shadow-ambient">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-lg text-forest-900">
              High-Demand Commodities (Ranked by Institutional Liquidity)
            </h3>
            <p className="text-xs text-ink-500">
              Aggregated procurement tenders from retailers, flour mills, and export hubs.
            </p>
          </div>
          <span className="text-xs font-semibold text-steel-600 bg-steel-50 px-3 py-1 rounded-pill border border-steel-200">
            Steel Indicator Bars Active
          </span>
        </div>

        <div className="divide-y divide-line-100">
          {HIGH_DEMAND_CROPS.map((item) => (
            <div key={item.rank} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sage-50/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3 sm:w-1/3">
                <span className="font-display text-lg font-bold text-forest-700/60 tabular-nums">
                  {item.rank}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-forest-900">{item.name}</h4>
                  <span className="text-[11px] text-ink-400">Total Inquiry: {item.volume}</span>
                </div>
              </div>

              {/* Steel-500 Bar Indicator (§5.9) */}
              <div className="flex-1 max-w-xs flex items-center gap-3">
                <div className="flex-1 bg-steel-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.demandScore}%` }}
                    className="h-full bg-steel-500 rounded-full transition-all duration-500"
                  />
                </div>
                <span className="text-xs font-bold text-steel-600 tabular-nums w-8">
                  {item.demandScore}%
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 sm:w-1/4">
                <span className="text-xs font-semibold text-forest-600 bg-forest-50 px-2.5 py-1 rounded-pill">
                  {item.growth} MoM
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
