import { Database, NotificationType } from './database';

export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export interface NotificationItem extends NotificationRow {
  formattedTime?: string;
}
