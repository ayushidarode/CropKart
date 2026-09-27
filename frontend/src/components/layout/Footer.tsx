import React from 'react';
import Link from 'next/link';
import { Sprout, ShieldCheck, Truck, BarChart3, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Crop<span className="text-emerald-400">Kart</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India&apos;s Next-Gen B2B Agricultural Marketplace connecting farmers,
              wholesale buyers, and logistics networks with real-time market intelligence
              and CropSathi AI assistance.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-emerald-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Farmers
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-500" /> Direct Logistics
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-500" /> Agmarknet Mandi Data
              </span>
            </div>
          </div>

          {/* Marketplace Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Marketplace
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/marketplace?category=Grain" className="hover:text-emerald-400 transition-colors">
                  Grains & Cereals
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Vegetable" className="hover:text-emerald-400 transition-colors">
                  Fresh Vegetables
                </Link>
              </li>
              <li>
                <Link href="/marketplace?category=Pulse" className="hover:text-emerald-400 transition-colors">
                  Pulses & Dal
                </Link>
              </li>
              <li>
                <Link href="/marketplace?organic=true" className="hover:text-emerald-400 transition-colors">
                  Certified Organic
                </Link>
              </li>
              <li>
                <Link href="/nearby" className="hover:text-emerald-400 transition-colors">
                  Find Crops Nearby
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & AI */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Intelligence
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/insights" className="hover:text-emerald-400 transition-colors">
                  Mandi Price Trends
                </Link>
              </li>
              <li>
                <Link href="/insights#forecast" className="hover:text-emerald-400 transition-colors">
                  Demand Forecasting
                </Link>
              </li>
              <li>
                <Link href="/transporter" className="hover:text-emerald-400 transition-colors">
                  Logistics & Routes
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-emerald-400 transition-colors">
                  Platform Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              User Portals
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/farm" className="hover:text-emerald-400 transition-colors">
                  Farmer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/buyer" className="hover:text-emerald-400 transition-colors">
                  Buyer Orders
                </Link>
              </li>
              <li>
                <Link href="/transporter" className="hover:text-emerald-400 transition-colors">
                  Transporter Hub
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="hover:text-emerald-400 transition-colors">
                  Join as Producer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CropKart Technologies. Built with Supabase & Next.js.</p>
          <div className="flex items-center gap-6">
            <Link href="/settings" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="/settings" className="hover:text-slate-300">Terms of Trade</Link>
            <Link href="/settings" className="hover:text-slate-300">MSP Guidelines</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
