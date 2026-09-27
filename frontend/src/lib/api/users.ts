import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile, FarmerWithProfile } from '@/types/user';
import { UserRole } from '@/types/database';

export const DEMO_USERS: UserProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'ramesh@example.com',
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    role: 'farmer',
    location: 'Baramati, Pune, Maharashtra',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    farmer_profile: {
      id: '00000000-0000-0000-0000-000000000001',
      farm_name: 'Green Valley Farms',
      years_active: 9,
      total_acres: 25.0,
      is_verified: true,
      rating: 4.85,
      review_count: 34,
      district: 'Pune',
      state: 'Maharashtra',
      upi_id: 'ramesh@upi',
      bio: 'Specializing in chemical-free certified organic wheat and pulses. Direct farm-gate dispatch.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'anita@example.com',
    name: 'Anita Patil',
    mobile: '9876501234',
    role: 'farmer',
    location: 'Niphad, Nashik, Maharashtra',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    farmer_profile: {
      id: '00000000-0000-0000-0000-000000000002',
      farm_name: 'Patil Fresh Produce',
      years_active: 12,
      total_acres: 40.0,
      is_verified: true,
      rating: 4.9,
      review_count: 48,
      district: 'Nashik',
      state: 'Maharashtra',
      upi_id: 'anita@upi',
      bio: 'Direct harvest fresh vegetables, export quality red onions and juicy tomatoes.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'buyer@example.com',
    name: 'Rajesh Gupta',
    mobile: '9123456789',
    role: 'buyer',
    location: 'Vashi, Navi Mumbai, Maharashtra',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    buyer_profile: {
      id: '00000000-0000-0000-0000-000000000004',
      company_name: 'FreshMart Wholesale India',
      business_type: 'Wholesaler & Supermarket Chain',
      gst_number: '27AABCU9603R1ZM',
      is_verified: true,
      rating: 4.9,
      district: 'Mumbai',
      state: 'Maharashtra',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'transporter@example.com',
    name: 'Vikram Shinde',
    mobile: '9890123456',
    role: 'transporter',
    location: 'Hadapsar, Pune, Maharashtra',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    transporter_profile: {
      id: '00000000-0000-0000-0000-000000000005',
      company_name: 'Kisan Express Cargo',
      vehicle_type: 'Tata 407 & Eicher 14ft Canter',
      vehicle_number: 'MH-12-QW-4521',
      capacity_tonnes: 8.5,
      is_verified: true,
      is_available: true,
      district: 'Pune',
      state: 'Maharashtra',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          *,
          farmer_profile:farmer_profiles(*),
          buyer_profile:buyer_profiles(*),
          transporter_profile:transporter_profiles(*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return user as unknown as UserProfile;
    } catch (err) {
      console.warn('Supabase profile fetch error, checking demo users:', err);
    }
  }

  const demo = DEMO_USERS.find((u) => u.id === userId || u.email === userId);
  return demo || null;
}

export async function getFarmerPublicProfile(farmerId: string): Promise<FarmerWithProfile | null> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id, name, mobile, location, avatar_url,
          farmer_profiles!inner(farm_name, years_active, total_acres, is_verified, rating, review_count, district, state, bio, upi_id)
        `)
        .eq('id', farmerId)
        .single();

      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row = data as any;
        const fp = Array.isArray(row.farmer_profiles)
          ? row.farmer_profiles[0]
          : row.farmer_profiles;
        return {
          id: row.id,
          name: row.name,
          mobile: row.mobile,
          location: row.location,
          avatar_url: row.avatar_url,
          farm_name: fp?.farm_name || row.name,
          years_active: fp?.years_active || 5,
          total_acres: fp?.total_acres || 10,
          is_verified: fp?.is_verified ?? true,
          rating: fp?.rating || 4.8,
          review_count: fp?.review_count || 10,
          district: fp?.district,
          state: fp?.state,
          bio: fp?.bio,
          upi_id: fp?.upi_id,
        };
      }
    } catch (err) {
      console.warn('Failed to fetch public farmer from Supabase, checking fallback:', err);
    }
  }

  const demo = DEMO_USERS.find((u) => u.id === farmerId && u.role === 'farmer');
  if (demo && demo.farmer_profile) {
    return {
      id: demo.id,
      name: demo.name,
      mobile: demo.mobile,
      location: demo.location,
      avatar_url: demo.avatar_url,
      farm_name: demo.farmer_profile.farm_name,
      years_active: demo.farmer_profile.years_active,
      total_acres: demo.farmer_profile.total_acres,
      is_verified: demo.farmer_profile.is_verified,
      rating: demo.farmer_profile.rating,
      review_count: demo.farmer_profile.review_count,
      district: demo.farmer_profile.district,
      state: demo.farmer_profile.state,
      bio: demo.farmer_profile.bio,
      upi_id: demo.farmer_profile.upi_id,
    };
  }

  return null;
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: updates.name,
          mobile: updates.mobile,
          location: updates.location,
          avatar_url: updates.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      return { success: false, error: message };
    }
  }

  // Demo state update
  const index = DEMO_USERS.findIndex((u) => u.id === userId);
  if (index !== -1) {
    DEMO_USERS[index] = { ...DEMO_USERS[index], ...updates };
  }
  return { success: true };
}
