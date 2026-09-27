'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  MapPin,
  CreditCard,
  Languages,
  ShieldCheck,
  HelpCircle,
  FileText,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { updateUserProfile } from '@/lib/api/users';

export default function SettingsPage() {
  const { user, role, signOut, isConfigured } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [location, setLocation] = useState(user?.location || '');
  const [upiId, setUpiId] = useState(user?.farmer_profile?.upi_id || 'ramesh@upi');
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Marathi'>('English');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    await updateUserProfile(user.id, { name, mobile, location });
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="emerald" className="capitalize">
              {role || 'Farmer'} Account
            </Badge>
            <Badge variant={isConfigured ? 'emerald' : 'amber'}>
              {isConfigured ? 'Supabase Live Connected' : 'Local Preview Mode'}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account & Enterprise Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your agricultural identity, payout accounts, and platform preferences.
          </p>
        </div>

        <Button variant="danger" size="sm" onClick={signOut} leftIcon={<LogOut className="w-4 h-4" />}>
          Sign Out
        </Button>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile configuration saved to Supabase!</span>
        </div>
      )}

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <User className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <CardTitle>Trade Entity Identity</CardTitle>
              <CardDescription>Primary contact details shared on verified transaction receipts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Registered Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <Input
              label="Farm Gate / Warehouse Address"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div className="pt-2 flex justify-end">
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
                Save Identity Details
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Payment & UPI Escrow Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
              <CreditCard className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <CardTitle>Direct Payment & Bank Settlement</CardTitle>
              <CardDescription>Accounts used for bulk purchase escrow payouts and freight disbursements</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Virtual Payment Address (UPI ID)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. yourname@upi"
            />
            <Input
              label="Bank IFSC Code"
              defaultValue="SBIN0001234"
              placeholder="e.g. SBIN0001234"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Escrow payouts are settled directly to this account within 24 hours of buyer delivery confirmation.
          </p>
        </CardContent>
      </Card>

      {/* Language & Localisation */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-50 text-sky-800 rounded-xl">
              <Languages className="w-5 h-5 text-sky-700" />
            </div>
            <div>
              <CardTitle>Regional Language Preference</CardTitle>
              <CardDescription>Select default language for CropSathi AI and platform interfaces</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(['English', 'Hindi', 'Marathi'] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setLanguage(lang)}
                className={`p-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                  language === lang
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {lang === 'English' ? 'English' : lang === 'Hindi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help & Legal Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Card className="p-4 flex items-center justify-between hoverEffect">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">CropKart Support & Agronomy Help</h5>
              <p className="text-[11px] text-slate-500">24/7 dedicated farmer helpline</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 font-mono">1800-AGRI-KART</span>
        </Card>

        <Card className="p-4 flex items-center justify-between hoverEffect">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-xl text-slate-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">MSP Policy & APMC Standards</h5>
              <p className="text-[11px] text-slate-500">Government statutory grain standards</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">v2.4</span>
        </Card>
      </div>
    </div>
  );
}
