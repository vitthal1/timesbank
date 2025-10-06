import { supabase } from '../lib/supabaseClient'
import { User } from '../types'

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const updateUserProfile = async (id: string, updates: Partial<User>) => {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select()
  if (error) throw error
  return data
}
