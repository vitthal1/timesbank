// ============================================
// src/hooks/useNotifications.ts
// ============================================
// Custom hook for fetching/managing notifications with TanStack Query.
// Integrates real-time subscriptions via service for live unread counts/updates.
// Supports marking as read with optimistic updates.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getUserNotifications, markNotificationAsRead, markAllAsRead, subscribeToUserNotifications } from '../services/notificationsService';
import type { Notification } from '../types';

export function useNotifications(userId?: string) {
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => getUserNotifications(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToUserNotifications(userId, (updatedNotifications) => {
      queryClient.setQueryData(['notifications', userId], updatedNotifications);
    });
    return unsubscribe;
  }, [userId, queryClient]);

  // Mark single as read mutation (optimistic)
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onMutate: async (notificationId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notifications', userId] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', userId]);
      queryClient.setQueryData<Notification[]>(['notifications', userId], (old) =>
        old?.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      return { previousNotifications };
    },
    onError: (err, notificationId, context) => {
      // Rollback
      queryClient.setQueryData(['notifications', userId], context?.previousNotifications);
      console.error('Failed to mark as read:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllAsRead(userId!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications', userId] });
      const previousNotifications = queryClient.getQueryData<Notification[]>(['notifications', userId]);
      queryClient.setQueryData<Notification[]>(['notifications', userId], (old) =>
        old?.map(n => ({ ...n, read: true }))
      );
      return { previousNotifications };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(['notifications', userId], context?.previousNotifications);
      console.error('Failed to mark all as read:', err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    isMarking: markAsReadMutation.isPending || markAllAsReadMutation.isPending,
  };
}