import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { TransportWithOrder, TransportRequestUpdate } from '@/types/transport';
import { TransportStatus } from '@/types/database';

export const INITIAL_DEMO_TRANSPORTS: TransportWithOrder[] = [
  {
    id: '44444444-4444-4444-4444-444444440001',
    order_id: '33333333-3333-3333-3333-333333330001',
    transporter_id: '00000000-0000-0000-0000-000000000005',
    pickup_location: 'Baramati Farm Gate, Pune, Maharashtra',
    delivery_location: 'FreshMart Central Hub, APMC Yard, Vashi, Navi Mumbai',
    distance_km: 225.0,
    estimated_hours: 5.5,
    vehicle_type: 'Eicher 14ft Canter',
    vehicle_number: 'MH-12-QW-4521',
    cost: 6500.0,
    status: 'in_transit',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    order: {
      id: '33333333-3333-3333-3333-333333330001',
      order_number: 'CK-2026-0819',
      buyer_id: '00000000-0000-0000-0000-000000000004',
      farmer_id: '00000000-0000-0000-0000-000000000001',
      crop_id: '11111111-1111-1111-1111-111111110001',
      quantity: 3000,
      unit: 'kg',
      price_per_unit: 28.5,
      total_price: 85500.0,
      pickup_location: 'Baramati Farm Gate, Pune',
      delivery_location: 'FreshMart Central Hub, Vashi, Navi Mumbai',
      status: 'in_transit',
      payment_status: 'paid',
      payment_method: 'upi',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      crop_name: 'Sharbati Wheat',
    },
  },
  {
    id: '44444444-4444-4444-4444-444444440002',
    order_id: '33333333-3333-3333-3333-333333330002',
    transporter_id: '00000000-0000-0000-0000-000000000005',
    pickup_location: 'Lasalgaon Mandi Yard, Nashik, Maharashtra',
    delivery_location: 'FreshMart Central Hub, APMC Yard, Vashi, Navi Mumbai',
    distance_km: 195.0,
    estimated_hours: 4.8,
    vehicle_type: 'Tata 407',
    vehicle_number: 'MH-12-QW-4521',
    cost: 5800.0,
    status: 'assigned',
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    order: {
      id: '33333333-3333-3333-3333-333333330002',
      order_number: 'CK-2026-0922',
      buyer_id: '00000000-0000-0000-0000-000000000004',
      farmer_id: '00000000-0000-0000-0000-000000000002',
      crop_id: '11111111-1111-1111-1111-111111110004',
      quantity: 5000,
      unit: 'kg',
      price_per_unit: 24.0,
      total_price: 120000.0,
      pickup_location: 'Lasalgaon Mandi Yard, Nashik',
      delivery_location: 'FreshMart Central Hub, Vashi, Navi Mumbai',
      status: 'pending',
      payment_status: 'escrow',
      payment_method: 'bank_transfer',
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      crop_name: 'Red Onions',
    },
  },
];

let localTransportsStore = [...INITIAL_DEMO_TRANSPORTS];

export async function getTransporterJobs(
  transporterId: string
): Promise<TransportWithOrder[]> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('transport_requests')
        .select(`
          *,
          order:orders(*)
        `)
        .eq('transporter_id', transporterId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as unknown as TransportWithOrder[];
      }
    } catch (err) {
      console.warn('Supabase getTransporterJobs error:', err);
    }
  }

  return localTransportsStore.filter(
    (t) => !t.transporter_id || t.transporter_id === transporterId
  );
}

export async function updateTransportStatus(
  id: string,
  status: TransportStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('transport_requests')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update transport status failed';
      return { success: false, error: message };
    }
  }

  const idx = localTransportsStore.findIndex((t) => t.id === id);
  if (idx !== -1) {
    localTransportsStore[idx] = {
      ...localTransportsStore[idx],
      status,
      updated_at: new Date().toISOString(),
    };
    return { success: true };
  }
  return { success: false, error: 'Transport job not found' };
}
