import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, ShoppingBag, Truck, Sparkles } from 'lucide-react';

export default function MobileTabBar({ currentRole, onOpenCropSathi }) {
  const dashboardPath =
    currentRole === 'farmer'
      ? '/farmer/dashboard'
      : currentRole === 'transporter'
      ? '/logistics'
      : '/buyer/dashboard';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-forest-900 border-t border-forest-800 text-white px-3 py-2 flex items-center justify-around shadow-ambient-xl">
      <NavLink
        to={dashboardPath}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-xl ${
            isActive ? 'text-lime-400' : 'text-sage-200'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/marketplace"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-xl ${
            isActive ? 'text-lime-400' : 'text-sage-200'
          }`
        }
      >
        <Store className="w-5 h-5" />
        <span>Market</span>
      </NavLink>

      {/* Floating AI Button Center Tab */}
      <button
        onClick={onOpenCropSathi}
        className="flex flex-col items-center -mt-6 focus:outline-none"
      >
        <div className="w-12 h-12 rounded-full bg-lime-400 text-forest-900 flex items-center justify-center shadow-ambient-lg ring-4 ring-forest-900 active:scale-95 transition-transform">
          <Sparkles className="w-6 h-6" />
        </div>
        <span className="text-[10px] font-bold text-lime-400 mt-1">CropSathi</span>
      </button>

      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-xl ${
            isActive ? 'text-lime-400' : 'text-sage-200'
          }`
        }
      >
        <ShoppingBag className="w-5 h-5" />
        <span>Orders</span>
      </NavLink>

      <NavLink
        to="/logistics"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-semibold py-1 px-2 rounded-xl ${
            isActive ? 'text-lime-400' : 'text-sage-200'
          }`
        }
      >
        <Truck className="w-5 h-5" />
        <span>Fleet</span>
      </NavLink>
    </nav>
  );
}
