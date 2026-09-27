import { OrderStatus, PaymentStatus, Database } from './database';
import { CropRow } from './crop';

export type OrderRow = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderUpdate = Database['public']['Tables']['orders']['Update'];

export interface OrderWithDetails extends OrderRow {
  crop?: CropRow | null;
  buyer?: {
    id: string;
    name: string;
    mobile?: string | null;
    buyer_profiles?: {
      company_name: string;
      gst_number?: string | null;
    } | null;
  };
  farmer?: {
    id: string;
    name: string;
    mobile?: string | null;
    farmer_profiles?: {
      farm_name: string;
      upi_id?: string | null;
    } | null;
  };
}
