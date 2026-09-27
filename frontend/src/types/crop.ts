import { CropCategory, QualityGrade, CropStatus, Database } from './database';

export type CropRow = Database['public']['Tables']['crops']['Row'];
export type CropInsert = Database['public']['Tables']['crops']['Insert'];
export type CropUpdate = Database['public']['Tables']['crops']['Update'];

export interface CropWithFarmer extends CropRow {
  farmer?: {
    id: string;
    name: string;
    mobile?: string | null;
    location?: string | null;
    avatar_url?: string | null;
    farmer_profiles?: {
      farm_name: string;
      is_verified: boolean;
      rating: number;
      review_count: number;
      district?: string | null;
      state?: string | null;
    } | null;
  };
  farmer_name?: string;
  farm_name?: string;
}

export interface CropFilterParams {
  search?: string;
  category?: CropCategory | 'All';
  quality?: QualityGrade | 'All';
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  organicOnly?: boolean;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'quantity_desc';
  page?: number;
  limit?: number;
}
