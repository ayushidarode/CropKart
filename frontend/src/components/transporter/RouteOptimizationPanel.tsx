'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Navigation, Clock, Fuel, ShieldAlert, Cpu } from 'lucide-react';

export interface RouteOptimizationPanelProps {
  origin?: string;
  destination?: string;
  distanceKm?: number;
  durationHours?: number;
  estimatedCost?: number;
  vehicle?: string;
}

export function RouteOptimizationPanel({
  origin = 'Baramati, Pune',
  destination = 'Vashi APMC, Navi Mumbai',
  distanceKm = 225,
  durationHours = 5.5,
  estimatedCost = 6500,
  vehicle = 'Eicher 14ft Canter (8.5T)',
}: RouteOptimizationPanelProps) {
  return (
    <Card className="border-emerald-100/80 bg-gradient-to-br from-white via-white to-emerald-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>AI Route & Freight Logistics Engine</CardTitle>
              <CardDescription>
                Real-time transport optimization connecting farm-gate pickups to mandi hubs
              </CardDescription>
            </div>
          </div>
          <Badge variant="blue" className="flex items-center gap-1 font-mono text-[11px]">
            <Cpu className="w-3 h-3 text-sky-600" />
            <span>Telemetry Ready</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Route Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Estimated Distance
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {distanceKm} km
            </span>
            <span className="text-[11px] text-slate-500 font-medium">via NH 48 Tollway</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Transit Time
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {durationHours} hrs
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">Low Congestion</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Vehicle Capacity
            </span>
            <span className="text-xl font-black text-slate-900 mt-1 block">
              {vehicle}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Perishable Insulated</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Benchmark Freight
            </span>
            <span className="text-xl font-black text-emerald-800 mt-1 block">
              ₹{estimatedCost.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Diesel & Toll Inclusive</span>
          </div>
        </div>

        {/* Route Visualizer Path */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-100" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin</span>
              <span className="font-bold text-slate-900">{origin}</span>
            </div>
          </div>

          <div className="flex-1 hidden sm:flex items-center justify-center px-4">
            <div className="w-full h-0.5 bg-slate-300 relative">
              <div className="absolute left-1/2 -top-2.5 -translate-x-1/2 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-[10px] text-slate-500 font-mono">
                {distanceKm} km
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-600 ring-4 ring-amber-100" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
              <span className="font-bold text-slate-900">{destination}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer as required by Section 18 */}
        <div className="flex items-center gap-2 p-3 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-sky-900">
          <Clock className="w-4 h-4 text-sky-700 flex-shrink-0" />
          <span>
            <strong>Route Telemetry Interface:</strong> Live GPS tracking and dynamic toll recalculation endpoints will link with transporter telematics when assigned.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
