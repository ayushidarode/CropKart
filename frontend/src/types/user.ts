import { UserRole, Database } from './database';

export type UserRow = Database['public']['Tables']['users']['Row'];
export type FarmerProfileRow = Database['public']['Tables']['farmer_profiles']['Row'];
export type BuyerProfileRow = Database['public']['Tables']['buyer_profiles']['Row'];
export type TransporterProfileRow = Database['public']['Tables']['transporter_profiles']['Row'];

export interface UserProfile extends UserRow {
  farmer_profile?: FarmerProfileRow;
  buyer_profile?: BuyerProfileRow;
  transporter_profile?: TransporterProfileRow;
}

export interface FarmerWithProfile {
  id: string;
  name: string;
  mobile?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  farm_name: string;
  years_active: number;
  total_acres: number;
  is_verified: boolean;
  rating: number;
  review_count: number;
  district?: string | null;
  state?: string | null;
  bio?: string | null;
  upi_id?: string | null;
}
