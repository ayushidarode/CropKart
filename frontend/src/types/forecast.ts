import { Database } from './database';

export type MarketDataRow = Database['public']['Tables']['market_data']['Row'];
export type ForecastResultRow = Database['public']['Tables']['forecast_results']['Row'];
export type RouteEstimateRow = Database['public']['Tables']['route_estimates']['Row'];

export interface PriceTrendPoint {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  arrivalQuantity?: number;
}

export interface DemandForecastData {
  crop: string;
  location: string;
  forecastPeriod: string;
  projectedDemand: string;
  demandIndex: number;
  confidenceScore: number;
  status: string;
  message?: string;
}

export interface PricingIntelligenceData {
  crop: string;
  location: string;
  currency: string;
  currentMarketPrice: number;
  recommendedSellingPrice: number;
  minimumSupportPrice: number;
  priceTrend: string;
  confidenceLevel: string;
  status: string;
  message?: string;
}
