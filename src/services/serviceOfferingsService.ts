// src/services/serviceOfferingsService.ts - FIXED: Added status filter parameter
import { supabase } from '../lib/supabaseClient';
import type { ServiceOffering } from '../types';

/**
 * Get service offerings with optional filters
 * @param status - Filter by status ('active', 'inactive', 'booked', or null for all)
 */
export async function getServiceOfferings(
  searchTerm: string = '',
  category: string = 'all',
  range: [number, number] = [0, 9],
  status: 'active' | 'inactive' | 'booked' | null = null // FIXED: Added status parameter
) {
  try {
    let query = supabase
      .from('service_offerings')
      .select(`
        *,
        users!service_offerings_user_id_fkey(username, avatar_url, location, rating),
        skills(name, category)
      `)
      .order('created_at', { ascending: false })
      .range(range[0], range[1]);

    // FIXED: Filter by status if provided (defaults to active for marketplace)
    if (status) {
      query = query.eq('status', status);
    }

    // Search filter
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    // Category filter via skills join
    if (category !== 'all') {
      query = query.eq('skills.category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching service offerings:', error);
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetched ${data?.length || 0} offerings with status: ${status || 'all'}`);
    }

    return data || [];
  } catch (error) {
    console.error('Service offerings fetch failed:', error);
    return [];
  }
}

/**
 * Get service offerings for a specific user
 */
export async function getUserServiceOfferings(userId: string): Promise<ServiceOffering[]> {
  try {
    const { data, error } = await supabase
      .from('service_offerings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user offerings:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('User offerings fetch failed:', error);
    return [];
  }
}

/**
 * Create a new service offering
 */
export async function createServiceOffering(
  offering: Omit<ServiceOffering, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  userId: string
): Promise<ServiceOffering | null> {
  try {
    const { data, error } = await supabase
      .from('service_offerings')
      .insert({
        ...offering,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating offering:', error);
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Service offering created:', data?.title);
    }

    return data;
  } catch (error) {
    console.error('Create offering failed:', error);
    return null;
  }
}

/**
 * Update an existing service offering
 */
export async function updateServiceOffering(
  offeringId: string,
  updates: Partial<ServiceOffering>
): Promise<ServiceOffering | null> {
  try {
    const { data, error } = await supabase
      .from('service_offerings')
      .update(updates)
      .eq('id', offeringId)
      .select()
      .single();

    if (error) {
      console.error('Error updating offering:', error);
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Service offering updated:', data?.title);
    }

    return data;
  } catch (error) {
    console.error('Update offering failed:', error);
    return null;
  }
}

/**
 * Delete a service offering
 */
export async function deleteServiceOffering(offeringId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('service_offerings')
      .delete()
      .eq('id', offeringId);

    if (error) {
      console.error('Error deleting offering:', error);
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Service offering deleted:', offeringId);
    }

    return true;
  } catch (error) {
    console.error('Delete offering failed:', error);
    return false;
  }
}

/**
 * Subscribe to real-time updates for service offerings
 * @param userId - If provided, only subscribe to offerings from this user. Empty string for all.
 */
export function subscribeToUserOfferings(
  userId: string,
  callback: (offerings: ServiceOffering[]) => void
) {
  const channel = supabase
    .channel('service-offerings-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'service_offerings',
        ...(userId && { filter: `user_id=eq.${userId}` }),
      },
      async () => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Service offerings updated in real-time');
        }
        // Refetch offerings
        const offerings = userId 
          ? await getUserServiceOfferings(userId)
          : await getServiceOfferings('', 'all', [0, 100], 'active');
        callback(offerings as ServiceOffering[]);
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}