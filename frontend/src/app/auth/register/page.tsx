'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Sprout, UserPlus, AlertCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '@/types/database';

export default function RegisterPage() {
  const { signUp, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('Pune, Maharashtra');
  const [farmOrCompanyName, setFarmOrCompanyName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await signUp({
        name,
        email,
        password,
        role,
        mobile,
        location,
        farmOrCompanyName: farmOrCompanyName || (role === 'farmer' ? `${name}'s Farm` : `${name} Enterprises`),
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed');
      }
    } catch {
      setErrorMessage('Registration failed. Please check network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Join the CropKart Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Select your role to connect directly to India&apos;s agricultural B2B network.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-100">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['farmer', 'buyer', 'transporter'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`p-3 rounded-2xl border text-center font-bold text-xs capitalize transition-all ${
                    role === r
                      ? 'bg-emerald-800 text-white border-emerald-900 shadow-md'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="10-Digit Mobile Number"
                placeholder="9876543210"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <Input
              label={
                role === 'farmer'
                  ? 'Farm / FPO Name'
                  : role === 'buyer'
                  ? 'Company / Supermarket Chain Name'
                  : 'Logistics Fleet Name'
              }
              placeholder={
                role === 'farmer'
                  ? 'e.g. Green Valley Organic Farms'
                  : role === 'buyer'
                  ? 'e.g. FreshMart Wholesale India'
                  : 'e.g. Kisan Express Logistics'
              }
              value={farmOrCompanyName}
              onChange={(e) => setFarmOrCompanyName(e.target.value)}
              required
            />

            <Input
              label="Location / Mandi Hub"
              placeholder="e.g. Baramati, Pune, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Create Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={submitting || isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Already registered on CropKart?{' '}
          <Link href="/auth/login" className="text-emerald-700 font-bold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
