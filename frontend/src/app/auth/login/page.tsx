'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sprout, LogIn, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      const res = await signIn(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    } catch {
      setErrorMessage('Login failed. Please check network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto shadow-md">
            <Sprout className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Log In to CropKart
          </h1>
          <p className="text-xs text-slate-500">
            Access your agricultural marketplace portal and order contracts.
          </p>
        </div>

        <Card className="p-6 sm:p-8 space-y-6 shadow-xl border-slate-100">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. ramesh@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={submitting || isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Logins for evaluators */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick Test Personas (One-Click)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('ramesh@example.com')}
                className="p-2 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100 text-[11px] font-bold text-emerald-800 text-center transition-colors"
              >
                Farmer
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('buyer@example.com')}
                className="p-2 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100 text-[11px] font-bold text-amber-800 text-center transition-colors"
              >
                Buyer
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('transporter@example.com')}
                className="p-2 rounded-xl border border-sky-100 bg-sky-50/50 hover:bg-sky-100 text-[11px] font-bold text-sky-800 text-center transition-colors"
              >
                Transporter
              </button>
            </div>
          </div>
        </Card>

        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an agricultural account?{' '}
          <Link href="/auth/register" className="text-emerald-700 font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
