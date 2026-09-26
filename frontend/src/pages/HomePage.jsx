import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Truck,
  Sparkles,
  Users,
  Wheat,
  MapPin,
  CheckCircle2,
  PhoneCall,
  Award,
  CircleDollarSign,
} from 'lucide-react';
import MarketingShell from '../components/layout/MarketingShell';
import Squiggle from '../components/ui/Squiggle';
import Button from '../components/ui/Button';
import StatCard from '../components/ui/StatCard';
import SectionHeader from '../components/ui/SectionHeader';
import CropCard from '../components/ui/CropCard';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { crops, switchRole, language, setLanguage } = useApp();

  const handleRoleStart = (role) => {
    switchRole(role);
    navigate(role === 'farmer' ? '/farmer/dashboard' : role === 'transporter' ? '/logistics' : '/buyer/dashboard');
  };

  return (
    <MarketingShell language={language} setLanguage={setLanguage}>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        {/* Subtle Ambient Background circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-sage-100/70 to-cream-50/0 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-sage-100 text-forest-700 border border-line-200 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-forest-600 animate-pulse" />
              <span>Har Kisan, Har Khareedar — Ek Platform</span>
            </div>

            {/* Main Fraunces H1 */}
            <div className="relative inline-block mb-6">
              <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-forest-900 leading-[1.12] tracking-tight">
                Bech Bhi Karo, Kharido Bhi — <span className="text-forest-700 relative inline-block">
                  Seedha
                  <span className="absolute -bottom-2 left-0 right-0 flex justify-center">
                    <Squiggle className="w-full h-3 text-lime-400" />
                  </span>
                </span>
              </h1>
            </div>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-ink-500 max-w-2xl mx-auto leading-relaxed mb-8">
              India's premier B2B agricultural exchange connecting verified farmers directly to wholesale buyers & food processors with real-time APMC price guidance and AI route dispatch.
            </p>

            {/* Two CTAs as requested in spec §5.1 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link to="/marketplace">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto shadow-ambient text-base px-8 py-4"
                >
                  Explore Marketplace
                </Button>
              </Link>
              <button
                onClick={() => handleRoleStart('farmer')}
                className="w-full sm:w-auto"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto text-base px-8 py-4"
                >
                  Sell Your Crop
                </Button>
              </button>
            </div>

            {/* Interactive Demo Quick-Launcher Strip */}
            <div className="p-4 rounded-2xl bg-surface-0 border border-line-200 shadow-ambient max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-lime-100 text-forest-900 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <div>
                  <span className="text-xs font-bold text-forest-900 block">
                    SIH Evaluator Demo Shortcut
                  </span>
                  <span className="text-[11px] text-ink-500 block">
                    Jump straight into role-based workflows:
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleRoleStart('farmer')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-pill bg-forest-50 hover:bg-forest-100 text-forest-800 text-xs font-semibold border border-forest-200 transition-colors"
                >
                  Farmer UI
                </button>
                <button
                  onClick={() => handleRoleStart('buyer')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-pill bg-steel-50 hover:bg-steel-100 text-steel-700 text-xs font-semibold border border-steel-200 transition-colors"
                >
                  Buyer UI
                </button>
                <button
                  onClick={() => handleRoleStart('transporter')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-pill bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition-colors"
                >
                  Transporter UI
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stat Bar replacing the "25+ Years" card (§5.1) */}
      <section className="py-6 bg-sage-100/60 border-y border-line-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard
              title="Farmers Onboarded"
              value="48,500+"
              unit="Verified Kisans"
              delta="+24.6%"
              deltaText="vs last harvest"
              icon={Users}
              iconColor="text-forest-700 bg-forest-100"
            />
            <StatCard
              title="Crops Listed"
              value="120+"
              unit="Varieties & Grains"
              delta="+18%"
              deltaText="fresh weekly lots"
              icon={Wheat}
              iconColor="text-soil-600 bg-soil-100"
            />
            <StatCard
              title="Districts Covered"
              value="28"
              unit="Mandi Hubs & APMCs"
              delta="Live"
              deltaText="Maharashtra & North Corridor"
              icon={MapPin}
              iconColor="text-steel-600 bg-steel-100"
            />
          </div>
        </div>
      </section>

      {/* Featured Marketplace Crops Section */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <SectionHeader
              badge="Live Mandi Liquidity"
              title="Fresh Farm Lots Ready for Procurement"
              subtitle="Directly sourced from verified farms with moisture testing and standardized quality grading."
              align="left"
            />
          </div>
          <Link to="/marketplace">
            <Button variant="secondary" size="md" icon={ArrowRight} iconPosition="right">
              View All 120+ Crops
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.slice(0, 3).map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onSelect={() => navigate(`/crop/${crop.id}`)}
              onMakeOffer={() => navigate(`/crop/${crop.id}`)}
              onBuyNow={() => navigate(`/crop/${crop.id}`)}
            />
          ))}
        </div>
      </section>

      {/* "How It Works" Section (Numbered service-card pattern from Orgaanic reference) */}
      <section id="how-it-works" className="py-20 bg-sage-100/50 border-t border-line-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Process Flow"
            title="How CropKart Works for SIH Agri Supply Chain"
            subtitle="Eliminating middleman deductions with an end-to-end transparent digital workflow."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {[
              {
                num: '01',
                title: 'Login & Select Role',
                desc: 'Farmers, bulk institutional buyers, and fleet transporters authenticate and choose their workspace.',
                icon: Users,
              },
              {
                num: '02',
                title: 'List or Search Crops',
                desc: 'Farmers upload harvest specs with photos; buyers filter lots with tabular pricing and live mandi parity.',
                icon: Wheat,
              },
              {
                num: '03',
                title: 'Offer & Counterparty Match',
                desc: 'Buyers submit instant price bids. Farmers accept with one tap and lock payment via secured escrow.',
                icon: CircleDollarSign,
              },
              {
                num: '04',
                title: 'AI Route & Delivery',
                desc: 'Transporter assigned; CropSathi AI optimizes the transit corridor with live GPS milestone tracking.',
                icon: Truck,
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-surface-0 border border-line-200 rounded-hero p-6 sm:p-7 shadow-ambient flex flex-col justify-between hover:shadow-ambient-lg transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-display text-3xl font-extrabold text-forest-700/60 tabular-nums">
                        {step.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-sage-100 text-forest-700 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-lg text-forest-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-line-100 flex items-center gap-1.5 text-xs text-forest-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-500" />
                    <span>Verified Milestone</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Testimonial Section (§5.1) */}
      <section id="trust" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Verified Stakeholder Trust"
          title="Direct Stories from Indian Mandis & Warehouses"
          subtitle="Real testimonials from farmers who bypassed middlemen commissions and buyers who secured unadulterated produce."
          align="center"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            {
              quote: "CropKart helped me sell 450 quintals of Sharbati wheat directly to Metro Wholesale at ₹2,850/qtl. I saved ₹22,000 in dalal commissions and payment reached my bank the same evening.",
              author: "Ramesh Patel",
              role: "Wheat & Soybean Farmer",
              location: "Nashik, Maharashtra",
              badge: "Verified Kisan",
            },
            {
              quote: "Finding high-grade organic hybrid tomatoes with lab moisture certificates used to take days of mandi visits. Now our retail chain procures 15 tonnes weekly straight from farm gates.",
              author: "Priya Sharma",
              role: "Head of Agri Sourcing, Priya Agros",
              location: "Vashi APMC, Navi Mumbai",
              badge: "Institutional Buyer",
            },
            {
              quote: "The CropSathi AI route optimizer saved our 10-tonne insulated trucks over 28 kilometers per trip and routed us clear of congestion at the toll plaza. Empty return runs dropped by 40%.",
              author: "Baljit Singh",
              role: "Managing Director, Kisan Logistics",
              location: "Delhi-Mumbai Agri Corridor",
              badge: "Fleet Partner",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-surface-0 border border-line-200 rounded-hero p-7 shadow-ambient flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-base">★</span>
                  ))}
                </div>
                <p className="text-sm text-ink-700 italic leading-relaxed mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-line-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-forest-900">{item.author}</h4>
                  <p className="text-xs text-ink-500">{item.role}</p>
                  <p className="text-[11px] text-ink-400">{item.location}</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-pill bg-forest-50 text-forest-700 border border-forest-200">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Call to Action */}
      <section className="pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-forest-900 text-white rounded-hero p-8 sm:p-12 relative overflow-hidden shadow-ambient-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase font-bold tracking-wider text-lime-400 block mb-2">
              Empowering Indian Agriculture
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
              Join the Smart Agri B2B Revolution
            </h2>
            <p className="text-sm text-sage-200 leading-relaxed mb-6">
              Experience the end-to-end trade flow now: list crops, submit offers, assign transporters, and query CropSathi AI in seconds.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button variant="primary" size="md">
                  Register Free
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="ghost" size="md" className="text-white hover:text-white hover:bg-forest-800">
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-forest-800 border-2 border-forest-700 flex items-center justify-center p-4">
              <Sparkles className="w-12 h-12 text-lime-400 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
