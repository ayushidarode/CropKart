import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { NotificationItem } from '@/types/notification';

export const INITIAL_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '55555555-5555-5555-5555-555555550001',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'New Sample Request',
    message: 'FreshMart Wholesale India requested 2 kg sample of Sharbati Wheat.',
    type: 'sample_request',
    link: '/farm?tab=samples',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: '55555555-5555-5555-5555-555555550002',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Bulk Order Confirmed',
    message: 'Order #CK-2026-0819 for 3000 kg Wheat confirmed and in transit.',
    type: 'order_status',
    link: '/farm?tab=orders',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '55555555-5555-5555-5555-555555550003',
    user_id: '00000000-0000-0000-0000-000000000004',
    title: 'Sample Dispatched',
    message: 'Farmer Ramesh Kumar dispatched your 2 kg Wheat sample via DTDC.',
    type: 'sample_status',
    link: '/buyer',
    is_read: false,
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: '55555555-5555-5555-5555-555555550004',
    user_id: '00000000-0000-0000-0000-000000000005',
    title: 'New Transport Assigned',
    message: 'Assigned route: Baramati to Vashi (225 km). Pickup scheduled.',
    type: 'transport_update',
    link: '/transporter',
    is_read: false,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
];

let localNotificationsStore = [...INITIAL_DEMO_NOTIFICATIONS];

export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data as NotificationItem[];
      }
    } catch (err) {
      console.warn('Supabase getNotifications error:', err);
    }
  }

  return localNotificationsStore.filter(
    (n) => n.user_id === userId || n.user_id === '00000000-0000-0000-0000-000000000001'
  );
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (err) {
      console.warn('Supabase markNotificationAsRead error:', err);
    }
  }

  const item = localNotificationsStore.find((n) => n.id === id);
  if (item) {
    item.is_read = true;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId);
    } catch (err) {
      console.warn('Supabase markAllNotificationsAsRead error:', err);
    }
  }

  localNotificationsStore.forEach((n) => {
    if (n.user_id === userId) {
      n.is_read = true;
    }
  });
}
