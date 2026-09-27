import { TransportStatus, Database } from './database';
import { OrderRow } from './order';

export type TransportRequestRow = Database['public']['Tables']['transport_requests']['Row'];
export type TransportRequestInsert = Database['public']['Tables']['transport_requests']['Insert'];
export type TransportRequestUpdate = Database['public']['Tables']['transport_requests']['Update'];

export interface TransportWithOrder extends TransportRequestRow {
  order?: OrderRow & {
    crop_name?: string;
  };
}
