// ============================================
// src/services/adminService.ts
// ============================================
// Admin service for Supabase operations

import { supabase } from '../lib/supabaseClient';

export const adminService = {
  // Deposit credits to a user
  async depositCredits(userId: string, amount: number, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('admin_deposit_credits', {
      p_admin_id: user.id,
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_ip_address: null
    });

    if (error) throw error;
    return data;
  },

  // Withdraw credits from a user
  async withdrawCredits(userId: string, amount: number, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('admin_withdraw_credits', {
      p_admin_id: user.id,
      p_user_id: userId,
      p_amount: amount,
      p_reason: reason,
      p_ip_address: null
    });

    if (error) throw error;
    return data;
  },

  // Cancel a transaction
  async cancelTransaction(transactionId: string, reason: string, refund: boolean = true) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('admin_cancel_transaction', {
      p_admin_id: user.id,
      p_transaction_id: transactionId,
      p_reason: reason,
      p_refund: refund,
      p_ip_address: null
    });

    if (error) throw error;
    return data;
  },

  // Get system statistics
  async getSystemStats() {
    const { data, error } = await supabase.rpc('get_system_statistics');
    if (error) throw error;
    return data;
  },

  // Get all users with details (admin only)
  async getAllUsers(search?: string) {
    let query = supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get all transactions with details (admin only)
  async getAllTransactions(search?: string) {
    const query = supabase
      .from('ledger')
      .select(`
        *,
        from_user_details:users!ledger_from_user_fkey(username, email, avatar_url),
        to_user_details:users!ledger_to_user_fkey(username, email, avatar_url),
        skill:skills(name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get admin action logs
  async getActionLogs(limit: number = 50) {
    const { data, error } = await supabase
      .from('admin_action_logs')
      .select(`
        *,
        admin:users!admin_action_logs_admin_user_id_fkey(username, email),
        target_user:users!admin_action_logs_target_user_id_fkey(username, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  // Update user status
  async updateUserStatus(userId: string, isActive: boolean, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;

    // Log the action
    const { error: logError } = await supabase
      .from('admin_action_logs')
      .insert({
        admin_user_id: user.id,
        action_type: isActive ? 'user_activate' : 'user_suspend',
        target_user_id: userId,
        reason: reason
      });

    if (logError) throw logError;

    return userData;
  },

  // Update user role
  async updateUserRole(userId: string, role: string, reason: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ 
        role: role,
        is_admin: role === 'admin',
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;

    // Log the action
    const { error: logError } = await supabase
      .from('admin_action_logs')
      .insert({
        admin_user_id: user.id,
        action_type: 'role_change',
        target_user_id: userId,
        reason: reason,
        metadata: { new_role: role }
      });

    if (logError) throw logError;

    return userData;
  }
};