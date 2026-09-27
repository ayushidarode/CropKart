import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { SampleRequestWithDetails, SampleRequestInsert, SampleRequestUpdate } from '@/types/sample';
import { SampleRequestStatus } from '@/types/database';

export const INITIAL_DEMO_SAMPLES: SampleRequestWithDetails[] = [
  {
    id: '22222222-2222-2222-2222-222222220001',
    buyer_id: '00000000-0000-0000-0000-000000000004',
    farmer_id: '00000000-0000-0000-0000-000000000001',
    crop_id: '11111111-1111-1111-1111-111111110001',
    quantity: 2.0,
    unit: 'kg',
    delivery_address: 'FreshMart Central Hub, APMC Yard, Vashi, Navi Mumbai 400703',
    tracking_number: 'DTDC-8849201',
    notes: 'Testing wheat quality for supermarket flour distribution.',
    status: 'sample_sent',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
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
        business_type: 'Wholesaler & Supermarket Chain',
      },
    },
    farmer: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ramesh Kumar',
      farmer_profiles: {
        farm_name: 'Green Valley Farms',
      },
    },
  },
  {
    id: '22222222-2222-2222-2222-222222220002',
    buyer_id: '00000000-0000-0000-0000-000000000004',
    farmer_id: '00000000-0000-0000-0000-000000000002',
    crop_id: '11111111-1111-1111-1111-111111110002',
    quantity: 5.0,
    unit: 'kg',
    delivery_address: 'FreshMart Central Hub, APMC Yard, Vashi, Navi Mumbai 400703',
    tracking_number: null,
    notes: 'Evaluating shelf life for quick commerce 10-minute dispatch.',
    status: 'sample_requested',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    crop: {
      id: '11111111-1111-1111-1111-111111110002',
      farmer_id: '00000000-0000-0000-0000-000000000002',
      name: 'Desi Tomatoes',
      variety: 'Abhinav Hybrid',
      category: 'Vegetable',
      quantity: 2800,
      unit: 'kg',
      price_per_unit: 32.0,
      quality_grade: 'Grade A',
      organic: false,
      harvest_date: '2026-04-01',
      available_from: '2026-04-02',
      location: 'Niphad, Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      description: 'Firm, bright red culinary tomatoes.',
      moisture_percent: 88.0,
      storage_type: 'Ventilated Crates',
      fertilizers_used: 'Drip Fertigation',
      status: 'available',
      primary_image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    buyer: {
      id: '00000000-0000-0000-0000-000000000004',
      name: 'Rajesh Gupta',
      buyer_profiles: {
        company_name: 'FreshMart Wholesale India',
        business_type: 'Wholesaler & Supermarket Chain',
      },
    },
    farmer: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Anita Patil',
      farmer_profiles: {
        farm_name: 'Patil Fresh Produce',
      },
    },
  },
];

let localSamplesStore = [...INITIAL_DEMO_SAMPLES];

export async function getSampleRequests(
  role: 'buyer' | 'farmer',
  userId: string
): Promise<SampleRequestWithDetails[]> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const column = role === 'buyer' ? 'buyer_id' : 'farmer_id';
      const { data, error } = await supabase
        .from('sample_requests')
        .select(`
          *,
          crop:crops(*),
          buyer:users!buyer_id(id, name, mobile, buyer_profiles(company_name, business_type)),
          farmer:users!farmer_id(id, name, farmer_profiles(farm_name))
        `)
        .eq(column, userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as unknown as SampleRequestWithDetails[];
      }
    } catch (err) {
      console.warn('Supabase getSampleRequests error:', err);
    }
  }

  // Fallback demo filtering
  return localSamplesStore.filter((s) =>
    role === 'buyer' ? s.buyer_id === userId : s.farmer_id === userId
  );
}

export async function createSampleRequest(
  request: SampleRequestInsert
): Promise<{ success: boolean; data?: SampleRequestWithDetails; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('sample_requests')
        .insert(request)
        .select(`
          *,
          crop:crops(*),
          buyer:users!buyer_id(id, name, mobile, buyer_profiles(company_name, business_type)),
          farmer:users!farmer_id(id, name, farmer_profiles(farm_name))
        `)
        .single();

      if (error) throw error;
      return { success: true, data: data as unknown as SampleRequestWithDetails };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sample request failed';
      return { success: false, error: message };
    }
  }

  const newSample: SampleRequestWithDetails = {
    id: `sample-${Date.now()}`,
    buyer_id: request.buyer_id,
    farmer_id: request.farmer_id,
    crop_id: request.crop_id,
    quantity: request.quantity || 1.0,
    unit: request.unit || 'kg',
    delivery_address: request.delivery_address,
    tracking_number: null,
    notes: request.notes || null,
    status: 'sample_requested',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localSamplesStore.unshift(newSample);
  return { success: true, data: newSample };
}

export async function updateSampleStatus(
  id: string,
  status: SampleRequestStatus,
  trackingNumber?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const updates: SampleRequestUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (trackingNumber) {
        updates.tracking_number = trackingNumber;
      }

      const { error } = await supabase
        .from('sample_requests')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      return { success: false, error: message };
    }
  }

  const idx = localSamplesStore.findIndex((s) => s.id === id);
  if (idx !== -1) {
    localSamplesStore[idx] = {
      ...localSamplesStore[idx],
      status,
      tracking_number: trackingNumber || localSamplesStore[idx].tracking_number,
      updated_at: new Date().toISOString(),
    };
    return { success: true };
  }
  return { success: false, error: 'Sample request not found' };
}
