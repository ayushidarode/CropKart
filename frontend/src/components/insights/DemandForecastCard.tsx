'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DemandForecastData } from '@/types/forecast';
import { Sparkles, TrendingUp, Compass } from 'lucide-react';

export function DemandForecastCard({ data }: { data: DemandForecastData | null }) {
  if (!data) {
    return (
      <Card className="p-6 text-center text-slate-400 text-xs">
        Forecast data unavailable for this selection.
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-emerald-50/20 border-emerald-100">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <CardTitle>AI Demand Projection: {data.crop}</CardTitle>
              <CardDescription>{data.location} · {data.forecastPeriod}</CardDescription>
            </div>
          </div>
          <Badge variant="emerald" size="sm">
            {data.confidenceScore ? `${Math.round(data.confidenceScore * 100)}% Confidence` : 'Verified'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100/60">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Market Sentiment
            </span>
            <span className="text-xl font-black text-emerald-900 mt-0.5 block flex items-center gap-1.5">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              {data.projectedDemand}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Demand Index
            </span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block font-mono">
              {data.demandIndex} / 100
            </span>
          </div>
        </div>

        {data.message && (
          <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
            {data.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
