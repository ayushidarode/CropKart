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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-0 border border-line-200 rounded-xl p-3 shadow-ambient-lg text-xs">
        <p className="font-semibold text-ink-500 mb-1">{label}</p>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
          <span className="font-bold text-forest-900 tabular-nums text-sm">
            ₹{Number(payload[0].value).toLocaleString('en-IN')}/qtl
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function TrendChart({
  data = [],
  dataKey = "price",
  xKey = "date",
  height = 260,
  cropName = "Crop",
}) {
  return (
    <div className="w-full bg-surface-0 rounded-card p-4 sm:p-5 border border-line-200 shadow-ambient">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold">
            30-Day Mandi Price Trend
          </span>
          <h4 className="font-display text-base font-bold text-forest-900">
            {cropName} Historical & AI Forecast
          </h4>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-forest-700">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-700" />
            Spot Rate
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-lime-600">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
            AI Forecast
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cropFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4E85A" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#285C38" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EEE1" />
            <XAxis
              dataKey={xKey}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5B6459', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#5B6459', fontSize: 11 }}
              tickFormatter={(val) => `₹${val}`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#285C38"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#cropFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
