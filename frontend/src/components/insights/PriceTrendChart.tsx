'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PriceTrendPoint } from '@/types/forecast';
import { formatCurrency } from '@/lib/utils';

export function PriceTrendChart({
  data,
  source,
}: {
  data: PriceTrendPoint[];
  source?: string;
}) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900">
            Historical Mandi Modal Price Trend (₹/Quintal)
          </h4>
          <p className="text-xs text-slate-500">
            Daily price band comparison across major regional wholesale mandis
          </p>
        </div>
        {source && (
          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {source}
          </span>
        )}
      </div>

      <div className="w-full h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#15803d" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const p = payload[0].payload as PriceTrendPoint;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-200">{label}</p>
                      <p className="text-emerald-400 font-black text-sm">
                        Modal Rate: {formatCurrency(p.modalPrice)}
                      </p>
                      <div className="text-[10px] text-slate-400 flex gap-3 pt-1 border-t border-slate-800">
                        <span>Min: ₹{p.minPrice}</span>
                        <span>Max: ₹{p.maxPrice}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="modalPrice"
              stroke="#15803d"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
