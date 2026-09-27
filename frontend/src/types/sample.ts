import { SampleRequestStatus, Database } from './database';
import { CropRow } from './crop';

export type SampleRequestRow = Database['public']['Tables']['sample_requests']['Row'];
export type SampleRequestInsert = Database['public']['Tables']['sample_requests']['Insert'];
export type SampleRequestUpdate = Database['public']['Tables']['sample_requests']['Update'];

export interface SampleRequestWithDetails extends SampleRequestRow {
  crop?: CropRow;
  buyer?: {
    id: string;
    name: string;
    mobile?: string | null;
    buyer_profiles?: {
      company_name: string;
      business_type: string;
    } | null;
  };
  farmer?: {
    id: string;
    name: string;
    farmer_profiles?: {
      farm_name: string;
    } | null;
  };
}
