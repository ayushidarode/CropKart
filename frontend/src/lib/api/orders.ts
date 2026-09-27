import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { OrderWithDetails, OrderInsert, OrderUpdate } from '@/types/order';
import { OrderStatus } from '@/types/database';

export const INITIAL_DEMO_ORDERS: OrderWithDetails[] = [
  {
    id: '33333333-3333-3333-3333-333333330001',
    order_number: 'CK-2026-0819',
    buyer_id: '00000000-0000-0000-0000-000000000004',
    farmer_id: '00000000-0000-0000-0000-000000000001',
    crop_id: '11111111-1111-1111-1111-111111110001',
    quantity: 3000,
    unit: 'kg',
    price_per_unit: 28.5,
    total_price: 85500.0,
    pickup_location: 'Baramati Farm Gate, Pune, Maharashtra',
    delivery_location: 'FreshMart Central Hub, APMC Yard, Vashi, Navi Mumbai',
    status: 'in_transit',
    payment_status: 'paid',
    payment_method: 'upi',
    notes: 'Approved post-sample verification. Urgent dispatch requested.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    crop: {
      id: '11111111-1111-1111-1111-111111110001',
      farmer_id: '00000000-0000-0000-0000-000000000001',
      name: 'Sharbati Wheat',
      variety: 'Premium Sharbati Gold',
      category: 'Grain',
      quantity: 4500,
      unit: 'kg',
      price_per_unit: 28.5,
      quality_grade: 'Grade A',
      organic: true,
      harvest_date: '2026-03-10',
      available_from: '2026-03-15',
      location: 'Baramati, Pune',
      district: 'Pune',
      state: 'Maharashtra',
      description: 'Naturally sun-dried golden Sharbati wheat.',
      moisture_percent: 10.5,
      storage_type: 'Silo Dry Storage',
      fertilizers_used: 'Vermicompost',
      status: 'available',
      primary_image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    buyer: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Rajesh Gupta',
      mobile: '9123456789',
      buyer_profiles: {
        company_name: 'FreshMart Wholesale India',
        gst_number: '27AABCU9603R1ZM',
      },
    },
    farmer: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      farmer_profiles: {
        farm_name: 'Green Valley Farms',
        upi_id: 'ramesh@upi',
      },
    },
  },
  {
    id: '33333333-3333-3333-3333-333333330002',
    order_number: 'CK-2026-0922',
    buyer_id: '00000000-0000-0000-0000-000000000004',
    farmer_id: '00000000-0000-0000-0000-000000000002',
    crop_id: '11111111-1111-1111-1111-111111110004',
    quantity: 5000,
    unit: 'kg',
    price_per_unit: 24.0,
    total_price: 120000.0,
    pickup_location: 'Lasalgaon Mandi Yard, Nashik, Maharashtra',
    delivery_location: 'FreshMart Central Hub, APMC Yard, Vashi, Navi Mumbai',
    status: 'pending',
    payment_status: 'escrow',
    payment_method: 'bank_transfer',
    notes: 'Bulk order scheduled for Monday morning arrival.',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    crop: {
      id: '11111111-1111-1111-1111-111111110004',
      farmer_id: '00000000-0000-0000-0000-000000000002',
      name: 'Red Onions',
      variety: 'Garwa Late Red',
      category: 'Vegetable',
      quantity: 18000,
      unit: 'kg',
      price_per_unit: 24.0,
      quality_grade: 'Grade A',
      organic: false,
      harvest_date: '2026-03-01',
      available_from: '2026-03-05',
      location: 'Lasalgaon, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      description: 'Uniform sized tight-skin red onions.',
      moisture_percent: 14.0,
      storage_type: 'Traditional Chawl Storage',
      fertilizers_used: 'Standard NPK',
      status: 'available',
      primary_image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    buyer: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Rajesh Gupta',
      mobile: '9123456789',
      buyer_profiles: {
        company_name: 'FreshMart Wholesale India',
        gst_number: '27AABCU9603R1ZM',
      },
    },
    farmer: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Anita Patil',
      mobile: '9876501234',
      farmer_profiles: {
        farm_name: 'Patil Fresh Produce',
        upi_id: 'anita@upi',
      },
    },
  },
];

let localOrdersStore = [...INITIAL_DEMO_ORDERS];

export async function getOrders(
  role: 'buyer' | 'farmer',
  userId: string
): Promise<OrderWithDetails[]> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const column = role === 'buyer' ? 'buyer_id' : 'farmer_id';
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          crop:crops(*),
          buyer:users!buyer_id(id, name, mobile, buyer_profiles(company_name, gst_number)),
          farmer:users!farmer_id(id, name, mobile, farmer_profiles(farm_name, upi_id))
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as unknown as OrderWithDetails[];
      }
    } catch (err) {
      console.warn('Supabase getOrders error:', err);
    }
  }

  return localOrdersStore.filter((o) =>
    role === 'buyer' ? o.buyer_id === userId : o.farmer_id === userId
  );
}

export async function createOrder(
  order: OrderInsert
): Promise<{ success: boolean; data?: OrderWithDetails; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select(`
          *,
          crop:crops(*),
          buyer:users!buyer_id(id, name, mobile, buyer_profiles(company_name, gst_number)),
          farmer:users!farmer_id(id, name, mobile, farmer_profiles(farm_name, upi_id))
        `)
        .single();

      if (error) throw error;
      return { success: true, data: data as unknown as OrderWithDetails };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Order creation failed';
      return { success: false, error: message };
    }
  }

  const newOrder: OrderWithDetails = {
    id: `order-${Date.now()}`,
    order_number: order.order_number || `CK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    buyer_id: order.buyer_id,
    farmer_id: order.farmer_id,
    crop_id: order.crop_id || null,
    quantity: order.quantity,
    unit: order.unit || 'kg',
    price_per_unit: order.price_per_unit,
    total_price: order.total_price,
    pickup_location: order.pickup_location,
    delivery_location: order.delivery_location,
    status: order.status || 'pending',
    payment_status: order.payment_status || 'escrow',
    payment_method: order.payment_method || 'upi',
    notes: order.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localOrdersStore.unshift(newOrder);
  return { success: true, data: newOrder };
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update order status failed';
      return { success: false, error: message };
    }
  }

  const idx = localOrdersStore.findIndex((o) => o.id === id);
  if (idx !== -1) {
    localOrdersStore[idx] = {
      ...localOrdersStore[idx],
      status,
      updated_at: new Date().toISOString(),
    };
    return { success: true };
  }
  return { success: false, error: 'Order not found' };
}
