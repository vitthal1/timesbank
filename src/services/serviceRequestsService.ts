// ============================================
// src/services/serviceRequestsService.ts
// ============================================
// Service module for all service requests-related Supabase operations.
// Handles fetching, creation, status updates, and real-time subscriptions.

import { supabase } from '../lib/supabaseClient';
import type { ServiceRequest, ServiceOffering, User } from '../types';

/**
 * Fetches service requests for a user (as requester) or provider (incoming).
 * Includes joined offering and requester/provider data.
 * @param userId - User ID (requester or provider).
 * @param asProvider - If true, fetch incoming requests.
 * @param offeringId - Optional specific offering filter.
 * @returns Promise<(ServiceRequest & { service_offerings: Pick<ServiceOffering, 'title' | 'description' | 'price_in_hours'>; users: Pick<User, 'username' | 'avatar_url'> })[]>
 */
export async function getServiceRequests(
  userId: string,
  asProvider: boolean = false,
  offeringId?: string
): Promise<(ServiceRequest & { service_offerings: Pick<ServiceOffering, 'title' | 'description' | 'price_in_hours'>; users: Pick<User, 'username' | 'avatar_url'> })[]> {
  try {
    const tableFilter = asProvider ? 'service_offerings.user_id' : 'requester_user_id';
    const eqValue = asProvider ? userId : userId;
    let query = supabase
      .from('service_requests')
      .select(`
        *,
        service_offerings!inner(title, description, price_in_hours, user_id),
        users!requester_user_id_fkey(username, avatar_url)
      `)
      .eq(tableFilter, eqValue)
      .order('created_at', { ascending: false });

    if (offeringId) {
      query = query.eq('service_offering_id', offeringId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch requests: ${error.message}`);
    return data || [];
  } catch (err) {
    console.error('Service requests fetch error:', err);
    return [];
  }
}

/**
 * Creates a new service request.
 * @param request - Omit id/created_at/updated_at.
 * @returns Promise<ServiceRequest | null>
 */
export async function createServiceRequest(partialRequest: Omit<ServiceRequest, 'id' | 'created_at' | 'updated_at'>): Promise<ServiceRequest | null> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .insert(partialRequest)
      .select()
      .single();

    if (error) throw new Error(`Failed to create request: ${error.message}`);
    return data;
  } catch (err) {
    console.error('Create request error:', err);
    return null;
  }
}

/**
 * Updates a service request status.
 * @param requestId - The request ID.
 * @param status - New status.
 * @returns Promise<ServiceRequest | null>
 */
export async function updateServiceRequestStatus(requestId: string, status: ServiceRequest['status']): Promise<ServiceRequest | null> {
  try {
    const { data, error } = await supabase
      .from('service_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update request: ${error.message}`);
    return data;
  } catch (err) {
    console.error('Update request status error:', err);
    return null;
  }
}

/**
 * Subscribes to real-time changes in user's requests (as provider or requester).
 * @param userId - The user's ID.
 * @param asProvider - If true, subscribe to incoming.
 * @param callback - Function to call on changes.
 * @returns Function to unsubscribe.
 */
export function subscribeToUserRequests(userId: string, asProvider: boolean = false, callback: (requests: ServiceRequest[]) => void): () => void {
  const filter = asProvider ? `service_offerings.user_id=eq.${userId}` : `requester_user_id=eq.${userId}`;
  const channel = supabase
    .channel('user_requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_requests',
        filter,
      },
      async () => {
        const updatedRequests = await getServiceRequests(userId, asProvider);
        callback(updatedRequests);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}