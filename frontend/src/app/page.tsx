'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Truck,
  ShoppingBag,
  Users,
  Search,
  Sparkles,
  MapPin,
  CheckCircle2,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getCrops } from '@/lib/api/crops';
import { CropWithFarmer } from '@/types/crop';
import { CropCard } from '@/components/marketplace/CropCard';
import { SampleRequestModal } from '@/components/marketplace/SampleRequestModal';
import { formatCurrency } from '@/lib/utils';

export default function HomePage() {
  const [featuredCrops, setFeaturedCrops] = useState<CropWithFarmer[]>([]);
  const [selectedCropForSample, setSelectedCropForSample] = useState<CropWithFarmer | null>(null);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const { crops } = await getCrops({ limit: 4 });
      setFeaturedCrops(crops.slice(0, 4));
    }
    loadData();
  }, []);

  const handleRequestSample = (crop: CropWithFarmer) => {
    setSelectedCropForSample(crop);
    setIsSampleModalOpen(true);
  };

  return (
    <div className="flex flex-col gap-16 sm:gap-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 text-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        {/* Subtle patterned overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.1),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 backdrop-blur-sm text-xs font-bold text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>India&apos;s Verified B2B Agricultural Trade Engine</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Direct Crop Trading from{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                Farm Gate
              </span>{' '}
              to Wholesale Buyer.
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-2xl font-normal">
              Eliminate predatory middlemen. Discover certified harvest produce, request laboratory verification samples, lock in fair MSP-benchmarked contracts, and coordinate integrated transport.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-4">
              <Link href="/marketplace">
                <Button size="lg" variant="amber" rightIcon={<ArrowRight className="w-5 h-5" />} className="w-full sm:w-auto font-black shadow-lg">
                  Explore Marketplace
                </Button>
              </Link>
              <Link href="/nearby">
                <Button size="lg" variant="outline" leftIcon={<MapPin className="w-5 h-5 text-emerald-400" />} className="w-full sm:w-auto bg-emerald-950/80 text-white border-emerald-700/80 hover:bg-emerald-800/50">
                  Find Crops Nearby
                </Button>
              </Link>
            </div>

            {/* Quick Metrics Banner */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-emerald-800/60 mt-8">
              <div>
                <p className="text-2xl font-black text-white">₹0</p>
                <p className="text-xs text-emerald-200/70 font-medium">Middleman Margin</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400">100%</p>
                <p className="text-xs text-emerald-200/70 font-medium">Sample Verification</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">1,200+</p>
                <p className="text-xs text-emerald-200/70 font-medium">Mandi Price Feeds</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">CropSathi</p>
                <p className="text-xs text-emerald-200/70 font-medium">AI Advisory Engine</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE WORKFLOW: FARMER -> MARKETPLACE -> BUYER -> SAMPLE -> ORDER -> TRANSPORTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="emerald">Integrated B2B Lifecycle</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            How CropKart Powers Direct Agriculture Commerce
          </h2>
          <p className="text-sm text-slate-600">
            A trusted end-to-end framework built for transparent bulk grain and vegetable procurement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-slate-100 hoverEffect">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black text-lg mb-4">
              1
            </div>
            <h4 className="text-base font-bold text-slate-900">Producer Listing</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Farmers post verified harvest batches with variety, moisture %, storage type, and transparent minimum price.
            </p>
          </Card>

          <Card className="p-6 border-slate-100 hoverEffect">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-black text-lg mb-4">
              2
            </div>
            <h4 className="text-base font-bold text-slate-900">Sample Quality Check</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Wholesale buyers request physical 1-5 kg sample batches with courier tracking prior to committing capital.
            </p>
          </Card>

          <Card className="p-6 border-slate-100 hoverEffect">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center font-black text-lg mb-4">
              3
            </div>
            <h4 className="text-base font-bold text-slate-900">Bulk Trade Contract</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Upon sample approval, buyer places formal purchase contract with secure digital escrow protection.
            </p>
          </Card>

          <Card className="p-6 border-slate-100 hoverEffect">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-black text-lg mb-4">
              4
            </div>
            <h4 className="text-base font-bold text-slate-900">Transporter Fulfillment</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Regional logistics operators are assigned pickup routes with verified tare weight and live delivery updates.
            </p>
          </Card>
        </div>
      </section>

      {/* 3. FEATURED LIVE MARKETPLACE LISTINGS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <Badge variant="emerald">Live Harvest Catalog</Badge>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Fresh Verified Farm Listings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Direct from certified farmers in Maharashtra, Punjab, Gujarat & MP
            </p>
          </div>
          <Link href="/marketplace">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All 100+ Crops
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCrops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onRequestSample={handleRequestSample}
            />
          ))}
        </div>
      </section>

      {/* 4. CROPSATHI AI HIGHLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>CropSathi AI Automation</span>
              </div>
              <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Your Digital Farming & Mandi Advisory Partner
              </h3>
              <p className="text-sm text-emerald-100/80 leading-relaxed">
                Powered by FastAPI, LangFlow, and Gemini agronomy intelligence. Ask CropSathi in English, Hindi (हिंदी), or Marathi (मराठी) for upcoming demand forecasts, fertilizer schedules, or real-time mandi prices.
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-200 text-xs font-semibold border border-emerald-700/50">
                  🌾 Demand Projections
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-200 text-xs font-semibold border border-emerald-700/50">
                  💰 MSP Benchmarking
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-200 text-xs font-semibold border border-emerald-700/50">
                  🐛 Organic Pest Defense
                </span>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30 space-y-4 text-xs">
              <div className="flex items-center gap-3 border-b border-emerald-700/50 pb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white">
                  CS
                </div>
                <div>
                  <p className="font-bold text-white text-sm">CropSathi Interactive Assistant</p>
                  <p className="text-[10px] text-emerald-300">Live FastAPI Connection · Tri-lingual</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800 text-emerald-100">
                  <p className="font-bold text-[11px] text-amber-300">Buyer Query:</p>
                  <p className="mt-0.5">&ldquo;Which crop demand will be high across Western India over the next 7 days?&rdquo;</p>
                </div>

                <div className="bg-white p-3 rounded-xl text-slate-800 shadow-sm">
                  <p className="font-bold text-[11px] text-emerald-700">CropSathi Response:</p>
                  <p className="mt-0.5">
                    &ldquo;Wheat and Red Onion demand is projected to rise by 18-24% due to festival procurement. Sharbati wheat modal rates are steady at ₹2,420 - ₹2,850/quintal.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. VALUE PROPOSITION BY ROLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="blue">Role-Specific Value</Badge>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Designed for Every Agricultural Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-slate-100 hoverEffect space-y-4">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-2xl w-fit">
              <Sprout className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">For Farmers & FPOs</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Zero commission on direct farm-gate sales</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sample dispatch management with DTDC courier</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Guaranteed payment escrow before truck release</span>
              </li>
            </ul>
            <Link href="/farm" className="block pt-2">
              <Button size="sm" variant="secondary" className="w-full">
                Farmer Dashboard
              </Button>
            </Link>
          </Card>

          <Card className="p-6 border-slate-100 hoverEffect space-y-4">
            <div className="p-3 bg-amber-50 text-amber-800 rounded-2xl w-fit">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">For Wholesale Buyers</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Request laboratory test samples before bulk purchase</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Standardized quality grading (Grade A, Organic, etc.)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Live mandi price benchmarks for fair negotiation</span>
              </li>
            </ul>
            <Link href="/buyer" className="block pt-2">
              <Button size="sm" variant="secondary" className="w-full">
                Buyer Portal
              </Button>
            </Link>
          </Card>

          <Card className="p-6 border-slate-100 hoverEffect space-y-4">
            <div className="p-3 bg-sky-50 text-sky-800 rounded-2xl w-fit">
              <Truck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">For Transporters</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Direct freight jobs with fixed pickup and delivery points</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Route distance and transit time calculations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Prompt digital settlement upon delivery verification</span>
              </li>
            </ul>
            <Link href="/transporter" className="block pt-2">
              <Button size="sm" variant="secondary" className="w-full">
                Transporter Portal
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* SAMPLE REQUEST MODAL */}
      <SampleRequestModal
        crop={selectedCropForSample}
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
      />
    </div>
  );
}
