'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { PriceTrendPoint } from '@/types/forecast';

export function SupplyArrivalChart({ data }: { data: PriceTrendPoint[] }) {
  return (
    <div className="w-full space-y-3">
      <div>
        <h4 className="text-sm font-bold text-slate-900">
          Daily Mandi Supply Arrival Volume (Tonnes)
        </h4>
        <p className="text-xs text-slate-500">
          Physical grain arrivals recorded at major district collection points
        </p>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const qty = payload[0].value;
                  return (
                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs">
                      <p className="text-slate-400 font-semibold">{label}</p>
                      <p className="text-amber-400 font-black text-sm">
                        Arrival: {qty} Tonnes
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="arrivalQuantity" fill="#d97706" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
