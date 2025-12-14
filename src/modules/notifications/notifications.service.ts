import { supabase } from '@/src/lib/supabaseClient';
import { CreateNotificationInput, UpdateNotificationInput, Notification } from './notifications.schema';

export async function getNotifications(userId?: string, unreadOnly?: boolean) {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification[];
}

export async function getNotificationById(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification | null;
}

export async function createNotification(input: CreateNotificationInput) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification;
}

export async function updateNotification(id: string, input: UpdateNotificationInput) {
  const { data, error } = await supabase
    .from('notifications')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function markAsRead(id: string, read: boolean = true) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification;
}

export async function markAllAsRead(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification[];
}
