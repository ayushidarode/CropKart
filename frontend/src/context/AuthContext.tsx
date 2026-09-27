'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { UserProfile } from '@/types/user';
import { UserRole } from '@/types/database';
import { DEMO_USERS, getUserProfile } from '@/lib/api/users';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    mobile?: string;
    location: string;
    farmOrCompanyName: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  switchRoleForDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Load session on mount
  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    async function initSession() {
      try {
        if (isConfigured) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            const profile = await getUserProfile(session.user.id);
            if (profile) {
              setUser(profile);
            }
          }
        } else {
          // Local demo default: Farmer Ramesh Kumar
          const savedRole = (typeof window !== 'undefined' && localStorage.getItem('cropkart_demo_role')) as UserRole | null;
          const target = DEMO_USERS.find((u) => u.role === (savedRole || 'farmer')) || DEMO_USERS[0];
          if (mounted) {
            setUser(target);
          }
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initSession();

    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (_event: unknown, session: any) => {
          if (session?.user) {
            const profile = await getUserProfile(session.user.id);
            if (profile && mounted) setUser(profile);
          } else if (mounted) {
            setUser(null);
          }
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, [isConfigured]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();

    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          const profile = await getUserProfile(data.user.id);
          if (profile) {
            setUser(profile);
            redirectByRole(profile.role);
            return { success: true };
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Login failed';
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // Demo authentication check
    const demo = DEMO_USERS.find(
      (u) => Boolean(u.email) && u.email!.toLowerCase() === email.toLowerCase()
    );
    if (demo) {
      setUser(demo);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cropkart_demo_role', demo.role);
      }
      setIsLoading(false);
      redirectByRole(demo.role);
      return { success: true };
    }

    // Any other demo credentials fallback
    const fallbackFarmer = DEMO_USERS[0];
    setUser(fallbackFarmer);
    setIsLoading(false);
    redirectByRole(fallbackFarmer.role);
    return { success: true };
  };

  const signUp = async (params: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    mobile?: string;
    location: string;
    farmOrCompanyName: string;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();

    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              name: params.name,
              role: params.role,
              mobile: params.mobile,
              location: params.location,
            },
          },
        });

        if (error) throw error;
        if (data.user) {
          // Insert into public.users and role specific table
          await supabase.from('users').insert({
            id: data.user.id,
            email: params.email,
            name: params.name,
            mobile: params.mobile || null,
            role: params.role,
            location: params.location,
          });

          if (params.role === 'farmer') {
            await supabase.from('farmer_profiles').insert({
              id: data.user.id,
              farm_name: params.farmOrCompanyName,
              district: params.location.split(',')[0]?.trim() || params.location,
              state: params.location.split(',')[1]?.trim() || 'Maharashtra',
            });
          } else if (params.role === 'buyer') {
            await supabase.from('buyer_profiles').insert({
              id: data.user.id,
              company_name: params.farmOrCompanyName,
              district: params.location.split(',')[0]?.trim() || params.location,
              state: params.location.split(',')[1]?.trim() || 'Maharashtra',
            });
          } else if (params.role === 'transporter') {
            await supabase.from('transporter_profiles').insert({
              id: data.user.id,
              company_name: params.farmOrCompanyName,
              district: params.location.split(',')[0]?.trim() || params.location,
              state: params.location.split(',')[1]?.trim() || 'Maharashtra',
            });
          }

          const profile = await getUserProfile(data.user.id);
          if (profile) setUser(profile);
          redirectByRole(params.role);
          return { success: true };
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Registration failed';
        setIsLoading(false);
        return { success: false, error: msg };
      }
    }

    // Demo registration fallback
    const newDemoUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: params.email,
      name: params.name,
      mobile: params.mobile || null,
      role: params.role,
      location: params.location,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      farmer_profile:
        params.role === 'farmer'
          ? {
              id: `user-${Date.now()}`,
              farm_name: params.farmOrCompanyName,
              years_active: 3,
              total_acres: 15.0,
              is_verified: true,
              rating: 4.8,
              review_count: 1,
              district: params.location,
              state: 'Maharashtra',
              upi_id: `${params.email.split('@')[0]}@upi`,
              bio: `Registered organic producer from ${params.location}.`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : undefined,
      buyer_profile:
        params.role === 'buyer'
          ? {
              id: `user-${Date.now()}`,
              company_name: params.farmOrCompanyName,
              business_type: 'Direct Wholesale Buyer',
              gst_number: null,
              is_verified: true,
              rating: 5.0,
              district: params.location,
              state: 'Maharashtra',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : undefined,
      transporter_profile:
        params.role === 'transporter'
          ? {
              id: `user-${Date.now()}`,
              company_name: params.farmOrCompanyName,
              vehicle_type: 'Commercial Canter',
              vehicle_number: 'MH-12-NEW-1234',
              capacity_tonnes: 8.0,
              is_verified: true,
              is_available: true,
              district: params.location,
              state: 'Maharashtra',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : undefined,
    };

    DEMO_USERS.push(newDemoUser);
    setUser(newDemoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cropkart_demo_role', newDemoUser.role);
    }
    setIsLoading(false);
    redirectByRole(newDemoUser.role);
    return { success: true };
  };

  const signOut = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cropkart_demo_role');
    }
    setIsLoading(false);
    router.push('/');
  };

  const switchRoleForDemo = (newRole: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === newRole);
    if (target) {
      setUser(target);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cropkart_demo_role', newRole);
      }
      redirectByRole(newRole);
    }
  };

  const redirectByRole = (userRole: UserRole) => {
    if (userRole === 'farmer') router.push('/farm');
    else if (userRole === 'buyer') router.push('/marketplace');
    else if (userRole === 'transporter') router.push('/transporter');
    else router.push('/marketplace');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        switchRoleForDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
