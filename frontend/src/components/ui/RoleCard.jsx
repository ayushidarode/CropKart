import React from 'react';
import { Check } from 'lucide-react';

export default function RoleCard({
  number = '01',
  roleKey,
  title,
  subtitle,
  description,
  features = [],
  icon: Icon,
  isSelected = false,
  onSelect,
}) {
  return (
    <div
      onClick={() => onSelect && onSelect(roleKey)}
      className={`relative cursor-pointer transition-all duration-200 rounded-hero p-6 sm:p-7 border-2 text-left flex flex-col justify-between ${
        isSelected
          ? 'bg-lime-50/70 border-forest-700 shadow-ambient-lg ring-1 ring-forest-700 scale-[1.01]'
          : 'bg-surface-0 border-line-200 hover:border-forest-400 hover:shadow-ambient'
      }`}
    >
      {/* Top Header: Number and Selected Indicator */}
      <div className="flex items-center justify-between mb-5">
        <span className="font-display text-2xl font-bold text-forest-700/60 tabular-nums">
          {number}
        </span>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
            isSelected
              ? 'bg-forest-700 border-forest-700 text-white'
              : 'border-line-200 bg-sage-50 text-transparent'
          }`}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      </div>

      {/* Role Icon */}
      <div className="mb-4">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-forest-700 text-lime-300'
              : 'bg-sage-100 text-forest-700 group-hover:bg-lime-100'
          }`}
        >
          <Icon className="w-7 h-7" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h3 className="font-display text-xl sm:text-2xl font-semibold text-forest-900 mb-1">
          {title}
        </h3>
        <p className="text-xs uppercase tracking-wider font-semibold text-soil-600 mb-3">
          {subtitle}
        </p>
        <p className="text-sm text-ink-500 mb-5 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Features list */}
      <div className="pt-4 border-t border-line-100 space-y-2">
        {features.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-ink-700">
            <span className="w-1.5 h-1.5 rounded-full bg-forest-500 shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Bottom CTA tag */}
      <div className="mt-5 pt-3">
        <span
          className={`inline-block text-xs font-semibold px-3 py-1 rounded-pill transition-colors ${
            isSelected
              ? 'bg-forest-700 text-white'
              : 'bg-sage-100 text-forest-900'
          }`}
        >
          {isSelected ? 'Selected Role' : 'Select ' + title}
        </span>
      </div>
    </div>
  );
}
