import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { CropWithFarmer, CropFilterParams, CropInsert, CropUpdate } from '@/types/crop';
import { DEMO_USERS } from './users';

export const INITIAL_DEMO_CROPS: CropWithFarmer[] = [
  {
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
    description: 'Naturally sun-dried golden Sharbati wheat with high protein and low moisture. Direct from organic farm gate.',
    moisture_percent: 10.5,
    storage_type: 'Silo Dry Storage',
    fertilizers_used: 'Vermicompost, Neem Cake',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    farmer: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      location: 'Baramati, Pune',
      farmer_profiles: {
        farm_name: 'Green Valley Farms',
        is_verified: true,
        rating: 4.85,
        review_count: 34,
        district: 'Pune',
        state: 'Maharashtra',
      },
    },
    farm_name: 'Green Valley Farms',
    farmer_name: 'Ramesh Kumar',
  },
  {
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
    description: 'Firm, bright red culinary tomatoes suitable for supermarket distribution and puree processing. Freshly harvested.',
    moisture_percent: 88.0,
    storage_type: 'Ventilated Crates',
    fertilizers_used: 'Drip Fertigation (NPK)',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    farmer: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Anita Patil',
      mobile: '9876501234',
      location: 'Niphad, Nashik',
      farmer_profiles: {
        farm_name: 'Patil Fresh Produce',
        is_verified: true,
        rating: 4.9,
        review_count: 48,
        district: 'Nashik',
        state: 'Maharashtra',
      },
    },
    farm_name: 'Patil Fresh Produce',
    farmer_name: 'Anita Patil',
  },
  {
    id: '11111111-1111-1111-1111-111111110003',
    farmer_id: '00000000-0000-0000-0000-000000000001',
    name: 'Yellow Soybean',
    variety: 'JS 335 Non-GMO',
    category: 'Oilseed',
    quantity: 9500,
    unit: 'kg',
    price_per_unit: 46.5,
    quality_grade: 'Standard',
    organic: true,
    harvest_date: '2026-02-15',
    available_from: '2026-02-20',
    location: 'Indapur, Pune',
    district: 'Pune',
    state: 'Maharashtra',
    description: 'High oil content soybeans ideal for crushing and oil extraction plants, clean and moisture controlled.',
    moisture_percent: 9.8,
    storage_type: 'Hermetic Bags',
    fertilizers_used: 'Organic Biofertilizers',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    farmer: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      location: 'Baramati, Pune',
      farmer_profiles: {
        farm_name: 'Green Valley Farms',
        is_verified: true,
        rating: 4.85,
        review_count: 34,
        district: 'Pune',
        state: 'Maharashtra',
      },
    },
    farm_name: 'Green Valley Farms',
    farmer_name: 'Ramesh Kumar',
  },
  {
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
    description: 'Uniform sized tight-skin red onions with excellent shelf life (up to 4 months in ambient storage).',
    moisture_percent: 14.0,
    storage_type: 'Traditional Chawl Storage',
    fertilizers_used: 'Standard NPK',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    farmer: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Anita Patil',
      mobile: '9876501234',
      location: 'Niphad, Nashik',
      farmer_profiles: {
        farm_name: 'Patil Fresh Produce',
        is_verified: true,
        rating: 4.9,
        review_count: 48,
        district: 'Nashik',
        state: 'Maharashtra',
      },
    },
    farm_name: 'Patil Fresh Produce',
    farmer_name: 'Anita Patil',
  },
  {
    id: '11111111-1111-1111-1111-111111110005',
    farmer_id: '00000000-0000-0000-0000-000000000001',
    name: 'Basmati Rice',
    variety: 'Pusa 1121 Traditional',
    category: 'Grain',
    quantity: 12000,
    unit: 'kg',
    price_per_unit: 78.0,
    quality_grade: 'Premium',
    organic: true,
    harvest_date: '2026-02-20',
    available_from: '2026-02-25',
    location: 'Punjab / Pune Warehouse',
    district: 'Pune',
    state: 'Maharashtra',
    description: 'Extra-long grain aromatic Basmati rice, aged 12 months for exceptional fragrance and elongation.',
    moisture_percent: 11.2,
    storage_type: 'Dry Storage',
    fertilizers_used: 'Organic Farmyard Manure',
    status: 'available',
    primary_image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    farmer: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Ramesh Kumar',
      mobile: '9876543210',
      location: 'Baramati, Pune',
      farmer_profiles: {
        farm_name: 'Green Valley Farms',
        is_verified: true,
        rating: 4.85,
        review_count: 34,
        district: 'Pune',
        state: 'Maharashtra',
      },
    },
    farm_name: 'Green Valley Farms',
    farmer_name: 'Ramesh Kumar',
  },
];

let localCropsStore = [...INITIAL_DEMO_CROPS];

export async function getCrops(
  filters: CropFilterParams = {}
): Promise<{ crops: CropWithFarmer[]; total: number }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('crops')
        .select(`
          *,
          farmer:users!farmer_id(
            id, name, mobile, location, avatar_url,
            farmer_profiles(farm_name, is_verified, rating, review_count, district, state)
          )
        `, { count: 'exact' });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,variety.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      }
      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }
      if (filters.quality && filters.quality !== 'All') {
        query = query.eq('quality_grade', filters.quality);
      }
      if (filters.minPrice !== undefined) {
        query = query.gte('price_per_unit', filters.minPrice);
      }
      if (filters.maxPrice !== undefined) {
        query = query.lte('price_per_unit', filters.maxPrice);
      }
      if (filters.minStock !== undefined) {
        query = query.gte('quantity', filters.minStock);
      }
      if (filters.organicOnly) {
        query = query.eq('organic', true);
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Sorting
      if (filters.sortBy === 'price_asc') {
        query = query.order('price_per_unit', { ascending: true });
      } else if (filters.sortBy === 'price_desc') {
        query = query.order('price_per_unit', { ascending: false });
      } else if (filters.sortBy === 'quantity_desc') {
        query = query.order('quantity', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, count, error } = await query;
      if (!error && data && data.length > 0) {
        const mappedCrops: CropWithFarmer[] = data.map((item: any) => {
          const farmerProfile = item.farmer?.farmer_profiles
            ? (Array.isArray(item.farmer.farmer_profiles) ? item.farmer.farmer_profiles[0] : item.farmer.farmer_profiles)
            : null;

          return {
            ...item,
            farm_name: farmerProfile?.farm_name || item.farmer?.name || 'Local Farm',
            farmer_name: item.farmer?.name || 'Farmer Producer',
          };
        });
        return { crops: mappedCrops, total: count || mappedCrops.length };
      }
    } catch (err) {
      console.warn('Supabase getCrops query failed, using local fallback:', err);
    }
  }

  // Local filtered fallback
  let result = [...localCropsStore];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(s) ||
        c.variety.toLowerCase().includes(s) ||
        c.location.toLowerCase().includes(s) ||
        (c.farm_name && c.farm_name.toLowerCase().includes(s))
    );
  }
  if (filters.category && filters.category !== 'All') {
    result = result.filter((c) => c.category === filters.category);
  }
  if (filters.quality && filters.quality !== 'All') {
    result = result.filter((c) => c.quality_grade === filters.quality);
  }
  if (filters.minPrice !== undefined) {
    result = result.filter((c) => c.price_per_unit >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    result = result.filter((c) => c.price_per_unit <= filters.maxPrice!);
  }
  if (filters.minStock !== undefined) {
    result = result.filter((c) => c.quantity >= filters.minStock!);
  }
  if (filters.organicOnly) {
    result = result.filter((c) => c.organic === true);
  }
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter((c) => c.location.toLowerCase().includes(loc));
  }

  // Sort
  if (filters.sortBy === 'price_asc') {
    result.sort((a, b) => a.price_per_unit - b.price_per_unit);
  } else if (filters.sortBy === 'price_desc') {
    result.sort((a, b) => b.price_per_unit - a.price_per_unit);
  } else if (filters.sortBy === 'quantity_desc') {
    result.sort((a, b) => b.quantity - a.quantity);
  } else {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return { crops: result, total: result.length };
}

export async function getCropById(id: string): Promise<CropWithFarmer | null> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('crops')
        .select(`
          *,
          farmer:users!farmer_id(
            id, name, mobile, location, avatar_url,
            farmer_profiles(farm_name, is_verified, rating, review_count, district, state)
          )
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        const item = data as any;
        const farmerProfile = item.farmer?.farmer_profiles
          ? (Array.isArray(item.farmer.farmer_profiles) ? item.farmer.farmer_profiles[0] : item.farmer.farmer_profiles)
          : null;

        return {
          ...item,
          farm_name: farmerProfile?.farm_name || item.farmer?.name,
          farmer_name: item.farmer?.name,
        };
      }
    } catch (err) {
      console.warn('Supabase getCropById error, using fallback:', err);
    }
  }

  const found = localCropsStore.find((c) => c.id === id);
  return found || null;
}

export async function getFarmerCrops(farmerId: string): Promise<CropWithFarmer[]> {
  const { crops } = await getCrops();
  return crops.filter((c) => c.farmer_id === farmerId);
}

export async function createCrop(crop: CropInsert): Promise<{ success: boolean; data?: CropWithFarmer; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('crops')
        .insert(crop)
        .select(`
          *,
          farmer:users!farmer_id(
            id, name, mobile, location, avatar_url,
            farmer_profiles(farm_name, is_verified, rating, review_count, district, state)
          )
        `)
        .single();

      if (error) throw error;
      const item = data as any;
      const farmerProfile = item.farmer?.farmer_profiles
        ? (Array.isArray(item.farmer.farmer_profiles) ? item.farmer.farmer_profiles[0] : item.farmer.farmer_profiles)
        : null;

      const created: CropWithFarmer = {
        ...item,
        farm_name: farmerProfile?.farm_name || item.farmer?.name,
        farmer_name: item.farmer?.name,
      };
      return { success: true, data: created };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create crop';
      return { success: false, error: message };
    }
  }

  // Local fallback creation
  const demoFarmer = DEMO_USERS.find((u) => u.id === crop.farmer_id) || DEMO_USERS[0];
  const newCrop: CropWithFarmer = {
    id: `local-${Date.now()}`,
    farmer_id: crop.farmer_id,
    name: crop.name,
    variety: crop.variety,
    category: crop.category || 'Grain',
    quantity: crop.quantity,
    unit: crop.unit || 'kg',
    price_per_unit: crop.price_per_unit,
    quality_grade: crop.quality_grade || 'Grade A',
    organic: crop.organic ?? false,
    harvest_date: crop.harvest_date || null,
    available_from: crop.available_from || new Date().toISOString().split('T')[0],
    location: crop.location,
    district: crop.district || null,
    state: crop.state || null,
    description: crop.description || null,
    moisture_percent: crop.moisture_percent || null,
    storage_type: crop.storage_type || null,
    fertilizers_used: crop.fertilizers_used || null,
    status: crop.status || 'available',
    primary_image_url: crop.primary_image_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    farmer: {
      id: demoFarmer.id,
      name: demoFarmer.name,
      mobile: demoFarmer.mobile,
      location: demoFarmer.location,
      farmer_profiles: demoFarmer.farmer_profile
        ? {
            farm_name: demoFarmer.farmer_profile.farm_name,
            is_verified: demoFarmer.farmer_profile.is_verified,
            rating: demoFarmer.farmer_profile.rating,
            review_count: demoFarmer.farmer_profile.review_count,
            district: demoFarmer.farmer_profile.district,
            state: demoFarmer.farmer_profile.state,
          }
        : null,
    },
    farm_name: demoFarmer.farmer_profile?.farm_name || demoFarmer.name,
    farmer_name: demoFarmer.name,
  };

  localCropsStore.unshift(newCrop);
  return { success: true, data: newCrop };
}

export async function updateCrop(
  id: string,
  updates: CropUpdate
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('crops')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      return { success: false, error: message };
    }
  }

  const idx = localCropsStore.findIndex((c) => c.id === id);
  if (idx !== -1) {
    localCropsStore[idx] = {
      ...localCropsStore[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    } as CropWithFarmer;
    return { success: true };
  }
  return { success: false, error: 'Crop not found' };
}

export async function deleteCrop(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from('crops').delete().eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      return { success: false, error: message };
    }
  }

  localCropsStore = localCropsStore.filter((c) => c.id !== id);
  return { success: true };
}
