import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, UserCheck, Wheat, Store, Truck } from 'lucide-react';
import MarketingShell from '../components/layout/MarketingShell';
import Button from '../components/ui/Button';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { switchRole } = useApp();

  const [phone, setPhone] = useState('+91 98231 44512');
  const [password, setPassword] = useState('••••••••');

  const handleQuickLogin = (role) => {
    switchRole(role);
    if (role === 'farmer') navigate('/farmer/dashboard');
    else if (role === 'transporter') navigate('/logistics');
    else navigate('/buyer/dashboard');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleQuickLogin('farmer');
  };

  return (
    <MarketingShell>
      <div className="py-12 sm:py-16 px-4 max-w-lg mx-auto">
        <div className="bg-surface-0 border border-line-200 rounded-hero p-6 sm:p-8 shadow-ambient">
          {/* Tab switch between Login and Register */}
          <div className="flex bg-cream-50 p-1 rounded-pill mb-6 border border-line-100 text-xs font-semibold">
            <div className="flex-1 py-2 text-center rounded-pill bg-surface-0 text-forest-900 font-bold shadow-sm">
              Sign In
            </div>
            <Link
              to="/register"
              className="flex-1 py-2 text-center rounded-pill text-ink-500 hover:text-forest-900 transition-colors"
            >
              Register Free
            </Link>
          </div>

          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-forest-700 text-lime-300 mx-auto flex items-center justify-center font-display font-extrabold text-xl mb-3 shadow-sm">
              <Leaf className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h2 className="font-display font-bold text-2xl text-forest-900 mb-1">
              Welcome to CropKart
            </h2>
            <p className="text-xs text-ink-500">
              Direct B2B trade, instant APMC prices & AI logistics dispatch.
            </p>
          </div>

          {/* Quick 1-Click Persona Login for Hackathon Judges */}
          <div className="mb-6 p-3.5 bg-lime-50/70 border border-lime-200 rounded-2xl">
            <span className="text-[11px] font-bold text-forest-900 uppercase tracking-wider block mb-2">
              ⚡ 1-Click Evaluator Sign-In
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('farmer')}
                className="p-2 rounded-xl bg-surface-0 hover:bg-forest-50 border border-forest-200 text-left transition-all hover:scale-102 flex flex-col items-center text-center"
              >
                <Wheat className="w-4 h-4 text-forest-700 mb-1" />
                <span className="text-[11px] font-bold text-forest-900 block leading-tight">Farmer</span>
                <span className="text-[9px] text-ink-400">Ramesh Patel</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('buyer')}
                className="p-2 rounded-xl bg-surface-0 hover:bg-steel-50 border border-steel-200 text-left transition-all hover:scale-102 flex flex-col items-center text-center"
              >
                <Store className="w-4 h-4 text-steel-600 mb-1" />
                <span className="text-[11px] font-bold text-forest-900 block leading-tight">Buyer</span>
                <span className="text-[9px] text-ink-400">Metro Wholesale</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('transporter')}
                className="p-2 rounded-xl bg-surface-0 hover:bg-amber-50 border border-amber-200 text-left transition-all hover:scale-102 flex flex-col items-center text-center"
              >
                <Truck className="w-4 h-4 text-amber-600 mb-1" />
                <span className="text-[11px] font-bold text-forest-900 block leading-tight">Fleet</span>
                <span className="text-[9px] text-ink-400">Kisan Logistics</span>
              </button>
            </div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block text-ink-700 font-semibold mb-1 text-xs">
                Phone Number / Kisan ID
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-ink-700 font-semibold text-xs">
                  Password / PIN
                </label>
                <a href="#" className="text-[11px] text-forest-700 hover:underline">
                  Forgot PIN?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-cream-50/70 border border-line-200 rounded-xl px-4 py-2.5 text-ink-900 focus:outline-none focus:ring-2 focus:ring-forest-700"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="solid-forest"
                size="md"
                className="w-full py-3"
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MarketingShell>
  );
}
