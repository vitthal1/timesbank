// ============================================
// src/services/notificationsService.ts
// ============================================
// Service module for all notifications-related Supabase operations.
// Handles fetching, marking as read, and real-time subscriptions for unread counts/live updates.

import { supabase } from '../lib/supabaseClient';
import type { Notification } from '../types';

/**
 * Fetches user's notifications, ordered by created_at descending.
 * @param userId - The user's ID.
 * @returns Promise<Notification[]>
 */
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch notifications: ${error.message}`);
    return data || [];
  } catch (err) {
    console.error('Notifications fetch error:', err);
    return [];
  }
}

/**
 * Marks a single notification as read.
 * @param notificationId - The notification ID.
 * @returns Promise<boolean>
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw new Error(`Failed to mark as read: ${error.message}`);
    return true;
  } catch (err) {
    console.error('Mark as read error:', err);
    return false;
  }
}

/**
 * Marks all unread notifications as read for a user.
 * @param userId - The user's ID.
 * @returns Promise<boolean>
 */
export async function markAllAsRead(userId: string): Promise<boolean> {
  try {
    const { data: unreadIds } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('read', false);

    if (!unreadIds || unreadIds.length === 0) return true;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds.map(id => id.id));

    if (error) throw new Error(`Failed to mark all as read: ${error.message}`);
    return true;
  } catch (err) {
    console.error('Mark all as read error:', err);
    return false;
  }
}

/**
 * Subscribes to real-time changes in user's notifications (focus on unread for bell).
 * @param userId - The user's ID.
 * @param callback - Function to call on changes (passes updated notifications).
 * @returns Function to unsubscribe.
 */
export function subscribeToUserNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
  const channel = supabase
    .channel('user_notifications')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      async () => {
        const updatedNotifications = await getUserNotifications(userId);
        callback(updatedNotifications);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}