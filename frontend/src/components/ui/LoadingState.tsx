import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState({
  message = 'Loading data from Supabase...',
  height = 'h-64',
}: {
  message?: string;
  height?: string;
}) {
  return (
    <div
      className={`w-full ${height} flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-slate-100/80 animate-pulse`}
    >
      <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 mb-3">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-600">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4 animate-pulse">
      <div className="h-44 bg-slate-100 rounded-xl w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-100 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
      <div className="flex justify-between pt-2 border-t border-slate-50">
        <div className="h-5 bg-slate-100 rounded w-1/3" />
        <div className="h-5 bg-slate-100 rounded w-1/4" />
      </div>
    </div>
  );
}
