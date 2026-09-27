'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { CropFilterParams } from '@/types/crop';
import { CROP_CATEGORIES, QUALITY_GRADES } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

export interface FilterBarProps {
  filters: CropFilterParams;
  onChange: (filters: CropFilterParams) => void;
  onReset: () => void;
  totalResults?: number;
}

export function FilterBar({ filters, onChange, onReset, totalResults }: FilterBarProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  return (
    <div className="w-full space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search crop name, variety, district, or farm..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Category Chips for Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => onChange({ ...filters, category: 'All' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              !filters.category || filters.category === 'All'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Crops
          </button>
          {CROP_CATEGORIES.slice(0, 4).map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: cat })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                filters.category === cat
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort & Filter Toggle Button */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="newest">Sort: Newly Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="quantity_desc">Available Stock: High to Low</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            leftIcon={<SlidersHorizontal className="w-4 h-4 text-emerald-700" />}
          >
            Filters
          </Button>
        </div>
      </div>

      {/* Expanded Filter Panel / Drawer */}
      {mobileFiltersOpen && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6 animate-in fade-in-50 slide-in-from-top-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">Advanced Marketplace Filters</h4>
            </div>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Crop Category
              </label>
              <select
                value={filters.category || 'All'}
                onChange={(e) => onChange({ ...filters, category: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-emerald-600"
              >
                <option value="All">All Categories</option>
                {CROP_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Quality Grade
              </label>
              <select
                value={filters.quality || 'All'}
                onChange={(e) => onChange({ ...filters, quality: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-emerald-600"
              >
                <option value="All">All Grades</option>
                {QUALITY_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Quantity Stock */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Min Stock (kg)
              </label>
              <input
                type="number"
                value={filters.minStock || ''}
                onChange={(e) =>
                  onChange({
                    ...filters,
                    minStock: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="e.g. 1000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Location / District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Location / District
              </label>
              <input
                type="text"
                value={filters.location || ''}
                onChange={(e) => onChange({ ...filters, location: e.target.value })}
                placeholder="e.g. Pune, Nashik, Punjab"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Price Range & Organic Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">Price Range (₹/kg):</label>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-24 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
              <span className="text-slate-400">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })
                }
                className="w-24 px-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.organicOnly || false}
                  onChange={(e) => onChange({ ...filters, organicOnly: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700">Organic Only</span>
              </label>

              <Button size="sm" variant="ghost" onClick={onReset} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Result Counter */}
      {totalResults !== undefined && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <p>
            Showing <span className="font-bold text-slate-800">{totalResults}</span> verified agricultural listings
          </p>
          {(filters.search || filters.category !== 'All' || filters.organicOnly || filters.location) && (
            <button
              onClick={onReset}
              className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
