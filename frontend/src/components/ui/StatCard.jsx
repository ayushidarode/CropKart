import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({
  title,
  value,
  unit = '',
  delta, // e.g. "+12.4%" or "-3.2%"
  deltaText, // e.g. "vs last week"
  icon: Icon,
  iconColor = 'text-forest-700 bg-forest-50',
  sparklineData,
  className = '',
  badge,
}) {
  const isPositive = delta && delta.startsWith('+');
  const isNegative = delta && delta.startsWith('-');

  return (
    <div className={`bg-surface-0 border border-line-200 rounded-card p-5 shadow-ambient flex flex-col justify-between transition-all hover:shadow-ambient-lg ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-xl shrink-0 ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
        {badge && !Icon && (
          <div>{badge}</div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-ink-900 tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-ink-500">{unit}</span>
        )}
      </div>

      {(delta || deltaText || sparklineData) && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-line-100">
          {delta && (
            <div className="flex items-center gap-1.5 text-xs font-medium">
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-pill ${
                  isPositive
                    ? 'bg-forest-50 text-forest-600 font-semibold'
                    : isNegative
                    ? 'bg-terracotta-50 text-terracotta-600 font-semibold'
                    : 'bg-sage-100 text-ink-500'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : isNegative ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                {delta}
              </span>
              {deltaText && <span className="text-ink-500 text-[11px]">{deltaText}</span>}
            </div>
          )}

          {sparklineData && (
            <div className="flex items-end gap-1 h-6">
              {sparklineData.map((val, idx) => (
                <div
                  key={idx}
                  style={{ height: `${Math.max(15, (val / 100) * 100)}%` }}
                  className={`w-1.5 rounded-t-sm ${
                    idx === sparklineData.length - 1 ? 'bg-lime-400' : 'bg-forest-700/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
