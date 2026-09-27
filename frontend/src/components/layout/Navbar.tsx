'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sprout,
  Store,
  MapPin,
  TrendingUp,
  Tractor,
  Truck,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types/database';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, signOut, switchRoleForDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitchOpen, setRoleSwitchOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { href: '/marketplace', label: 'Marketplace', icon: <Store className="w-4 h-4" /> },
    { href: '/nearby', label: 'Nearby Crops', icon: <MapPin className="w-4 h-4" /> },
    { href: '/insights', label: 'Market Intelligence', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  const getRoleDashboardLink = () => {
    if (role === 'farmer') return { href: '/farm', label: 'Farmer Dashboard', icon: <Tractor className="w-4 h-4" /> };
    if (role === 'buyer') return { href: '/buyer', label: 'Buyer Dashboard', icon: <ShoppingBag className="w-4 h-4" /> };
    if (role === 'transporter') return { href: '/transporter', label: 'Transporter Portal', icon: <Truck className="w-4 h-4" /> };
    return null;
  };

  const roleDashboard = getRoleDashboardLink();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1">
                Crop<span className="text-emerald-700">Kart</span>
              </span>
              <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-widest -mt-1">
                B2B Agri-Trade
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {roleDashboard && (
              <Link
                href={roleDashboard.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ml-1 ${
                  isActive(roleDashboard.href)
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                }`}
              >
                {roleDashboard.icon}
                <span>{roleDashboard.label}</span>
              </Link>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitchOpen(!roleSwitchOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-[11px] font-bold text-slate-700 transition-colors"
                title="Switch active role for testing"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="capitalize">{role || 'Select Role'}</span>
                <span className="text-[9px] bg-white px-1.5 py-0.5 rounded text-slate-500 font-mono">Role</span>
              </button>

              {roleSwitchOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  {(['farmer', 'buyer', 'transporter'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        switchRoleForDemo(r);
                        setRoleSwitchOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-1.5 text-xs capitalize flex items-center justify-between hover:bg-slate-50 ${
                        role === r ? 'font-bold text-emerald-700 bg-emerald-50/40' : 'text-slate-700'
                      }`}
                    >
                      <span>{r}</span>
                      {role === r && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
                <Link
                  href="/settings"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full hover:bg-slate-50 transition-colors"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {user.farmer_profile?.farm_name || user.buyer_profile?.company_name || user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:hidden">
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 rounded-xl hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold ${
                isActive(link.href)
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {roleDashboard && (
            <Link
              href={roleDashboard.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-emerald-700 text-white"
            >
              {roleDashboard.icon}
              <span>{roleDashboard.label}</span>
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>Active Persona:</span>
              <span className="capitalize font-black text-emerald-800">{role}</span>
            </div>

            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 font-medium"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-rose-600 hover:bg-rose-50 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
