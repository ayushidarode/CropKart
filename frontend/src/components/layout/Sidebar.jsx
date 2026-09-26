import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  Truck,
  TrendingUp,
  User,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  MapPin,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  user,
  currentRole,
  onSwitchRole,
  onOpenCropSathi,
}) {
  const navigate = useNavigate();

  // Navigation items adapted dynamically based on current role
  const getNavItems = () => {
    const base = [
      {
        path: currentRole === 'farmer' ? '/farmer/dashboard' : currentRole === 'transporter' ? '/logistics' : '/buyer/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
      },
      {
        path: '/marketplace',
        label: 'Marketplace',
        icon: Store,
      },
      {
        path: '/orders',
        label: 'Orders & Trades',
        icon: ShoppingBag,
      },
      {
        path: '/logistics',
        label: 'Fleet & Logistics',
        icon: Truck,
        badge: 'AI Route',
      },
      {
        path: '/intelligence',
        label: 'Mandi Intelligence',
        icon: TrendingUp,
      },
      {
        path: '/profile',
        label: 'Profile & KYC',
        icon: User,
      },
    ];

    if (currentRole === 'buyer') {
      base.splice(2, 0, {
        path: '/favorites',
        label: 'Watchlist',
        icon: Heart,
      });
    }

    return base;
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`hidden md:flex flex-col justify-between bg-forest-900 text-white transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-forest-800/80">
          <NavLink to="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-lime-400 text-forest-900 flex items-center justify-center font-display font-extrabold text-lg shrink-0 shadow-sm">
              CK
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-display font-bold text-lg tracking-tight text-white block">
                  Crop<span className="text-lime-400">Kart</span>
                </span>
                <span className="text-[10px] text-sage-200 tracking-wider uppercase block font-semibold">
                  Agri B2B & Logistics
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg bg-forest-800 text-sage-200 hover:text-white hover:bg-forest-700 flex items-center justify-center transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Quick-Switcher Pill (Crucial for SIH Judging Flow) */}
        {!isCollapsed && (
          <div className="px-4 py-3 border-b border-forest-800/60 bg-forest-950/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage-200">
                Active Demo Role
              </span>
              <span className="text-[10px] text-lime-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                Live Demo
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-forest-800 p-1 rounded-pill text-[11px] font-semibold text-center">
              <button
                onClick={() => onSwitchRole('farmer')}
                className={`py-1 rounded-pill transition-all ${
                  currentRole === 'farmer'
                    ? 'bg-lime-400 text-forest-900 shadow-sm'
                    : 'text-sage-200 hover:text-white'
                }`}
              >
                Farmer
              </button>
              <button
                onClick={() => onSwitchRole('buyer')}
                className={`py-1 rounded-pill transition-all ${
                  currentRole === 'buyer'
                    ? 'bg-lime-400 text-forest-900 shadow-sm'
                    : 'text-sage-200 hover:text-white'
                }`}
              >
                Buyer
              </button>
              <button
                onClick={() => onSwitchRole('transporter')}
                className={`py-1 rounded-pill transition-all ${
                  currentRole === 'transporter'
                    ? 'bg-lime-400 text-forest-900 shadow-sm'
                    : 'text-sage-200 hover:text-white'
                }`}
              >
                Transporter
              </button>
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all group ${
                    isActive
                      ? 'bg-forest-700 text-lime-300 shadow-sm font-semibold'
                      : 'text-sage-200 hover:text-white hover:bg-forest-800/80'
                  }`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110`} />
                {!isCollapsed && (
                  <span className="flex-1 truncate">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-pill bg-lime-400 text-forest-900">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: CropSathi Promo Card & User Badge */}
      <div className="p-3 border-t border-forest-800/80 space-y-3">
        {/* CropSathi Assistant Trigger */}
        {!isCollapsed ? (
          <div
            onClick={onOpenCropSathi}
            className="p-3 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-850 border border-forest-700/80 cursor-pointer hover:border-lime-400/50 transition-all group shadow-ambient"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-lime-400 animate-pulse" />
              <span className="text-xs font-bold text-white group-hover:text-lime-300">
                CropSathi AI
              </span>
            </div>
            <p className="text-[11px] text-sage-200 leading-snug">
              Instant mandi rate check & AI route optimization.
            </p>
          </div>
        ) : (
          <button
            onClick={onOpenCropSathi}
            className="w-10 h-10 mx-auto rounded-xl bg-lime-400 text-forest-900 flex items-center justify-center hover:scale-105 transition-transform"
            title="Open CropSathi AI"
          >
            <Sparkles className="w-5 h-5" />
          </button>
        )}

        {/* User Profile Info */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} gap-2 px-1`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-forest-700 border border-lime-400/30 flex items-center justify-center font-bold text-xs text-lime-300 shrink-0">
              {(user?.name || 'Ramesh Patel')[0]}
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="text-xs font-semibold text-white block truncate">
                  {user?.name || 'Ramesh Patel'}
                </span>
                <span className="text-[10px] text-lime-400 uppercase tracking-wider block font-semibold">
                  {currentRole} • Verified
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => navigate('/login')}
              className="text-sage-200 hover:text-terracotta-400 transition-colors p-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
