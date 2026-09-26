import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Globe, PhoneCall } from 'lucide-react';
import Button from '../ui/Button';

export default function MarketingShell({ children, language = 'EN', setLanguage }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-ink-900 selection:bg-lime-200">
      {/* Top Utility Bar */}
      <div className="bg-forest-900 text-sage-200 text-xs py-2 px-4 border-b border-forest-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-400 inline-block animate-pulse" />
            <span className="font-medium text-white">Smart India Hackathon (SIH) MVP</span>
            <span className="hidden sm:inline text-sage-300">• Live mandi rates and multi-counterparty escrow verified</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline-flex items-center gap-1.5 text-sage-300">
              <PhoneCall className="w-3 h-3 text-lime-400" />
              Kisan Helpline: 1800-CROP-KART
            </span>
            <div className="flex items-center gap-1.5 bg-forest-800 px-2 py-0.5 rounded-pill border border-forest-700">
              <Globe className="w-3 h-3 text-lime-400" />
              <span>{language}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-30 bg-surface-0/90 backdrop-blur-md border-b border-line-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-forest-700 text-lime-300 flex items-center justify-center font-display font-extrabold text-xl shadow-sm group-hover:scale-105 transition-transform">
              <Leaf className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-tight text-forest-900 block leading-none">
                Crop<span className="text-forest-700">Kart</span>
              </span>
              <span className="text-[11px] font-semibold text-soil-600 tracking-wider uppercase block mt-0.5">
                B2B Agri Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-700">
            <Link to="/marketplace" className="hover:text-forest-700 transition-colors">
              Marketplace
            </Link>
            <Link to="/intelligence" className="hover:text-forest-700 transition-colors">
              Mandi Prices
            </Link>
            <a href="#how-it-works" className="hover:text-forest-700 transition-colors">
              How it Works
            </a>
            <a href="#trust" className="hover:text-forest-700 transition-colors">
              Trust & Quality
            </a>
          </nav>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Children */}
      <main className="flex-1">
        {children}
      </main>

      {/* Dark Footer in Forest-900 */}
      <footer className="bg-forest-900 text-sage-200 pt-16 pb-12 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-forest-800/80">
            {/* Col 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400 text-forest-900 flex items-center justify-center font-display font-bold text-xl">
                  CK
                </div>
                <span className="font-display font-bold text-2xl text-white">
                  Crop<span className="text-lime-400">Kart</span>
                </span>
              </div>
              <p className="text-xs text-sage-300 leading-relaxed">
                Empowering Indian farmers with fair wholesale pricing, direct institutional buyers, and AI-optimized farm-to-mandi logistics.
              </p>
              <div className="flex items-center gap-2 text-xs text-lime-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Escrow Protected Trades</span>
              </div>
            </div>

            {/* Col 2: Marketplace */}
            <div>
              <h4 className="font-display text-white font-semibold text-sm mb-4">Marketplace</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/marketplace" className="hover:text-lime-300 transition-colors">Grains & Cereals</Link></li>
                <li><Link to="/marketplace" className="hover:text-lime-300 transition-colors">Pulses & Oilseeds</Link></li>
                <li><Link to="/marketplace" className="hover:text-lime-300 transition-colors">Fresh Vegetables & Fruits</Link></li>
                <li><Link to="/intelligence" className="hover:text-lime-300 transition-colors">Live APMC Mandi Rates</Link></li>
              </ul>
            </div>

            {/* Col 3: Stakeholders */}
            <div>
              <h4 className="font-display text-white font-semibold text-sm mb-4">Roles & Ecosystem</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link to="/register" className="hover:text-lime-300 transition-colors">For Farmers (Kisan Portal)</Link></li>
                <li><Link to="/register" className="hover:text-lime-300 transition-colors">For Wholesale Buyers & Retailers</Link></li>
                <li><Link to="/register" className="hover:text-lime-300 transition-colors">For Transporters & Fleet Owners</Link></li>
                <li><Link to="/logistics" className="hover:text-lime-300 transition-colors">AI Logistics & Route Optimizer</Link></li>
              </ul>
            </div>

            {/* Col 4: Demo CTA */}
            <div className="bg-forest-800/80 rounded-2xl p-5 border border-forest-700 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-lime-400 block">
                SIH Judging Demo
              </span>
              <h5 className="font-display font-semibold text-white text-sm">
                Ready to experience direct agricultural trade?
              </h5>
              <p className="text-xs text-sage-300">
                Switch roles instantly or test the AI assistant with real market datasets.
              </p>
              <Link to="/register" className="block pt-1">
                <Button variant="primary" size="sm" className="w-full">
                  Launch Demo Flow
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sage-400">
            <p>© {new Date().getFullYear()} CropKart Technologies. Built for Smart India Hackathon.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Trade</a>
              <a href="#" className="hover:text-white transition-colors">APMC Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
