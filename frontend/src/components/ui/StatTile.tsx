import React from 'react';
import { Card } from './Card';

export interface StatTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'emerald' | 'amber' | 'blue' | 'purple';
}

export function StatTile({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'emerald',
}: StatTileProps) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-sky-50 text-sky-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <Card className="p-5 sm:p-6 hoverEffect">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </p>
          <h4 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            {value}
          </h4>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                  trend.isPositive
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {trend.value}
              </span>
              <span className="text-[11px] text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-2xl ${colorMap[color]}`}>{icon}</div>
        )}
      </div>
    </Card>
  );
}
