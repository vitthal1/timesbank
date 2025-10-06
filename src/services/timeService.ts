import { supabase } from '../lib/supabaseClient'
import { TimeTransaction } from '../types'

// Fetch transactions (sent/received)
export const getTransactions = async (userId: string) => {
  const { data, error } = await supabase
    .from('time_ledger')
    .select('*')
    .or(`from_user.eq.${userId},to_user.eq.${userId}`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as TimeTransaction[]
}

// Create a transaction
export const createTransaction = async (fromUser: string, toUser: string, hours: number, note?: string) => {
  const { data, error } = await supabase.from('time_ledger').insert([{ from_user: fromUser, to_user: toUser, hours, note }])
  if (error) throw error
  return data
}

// Calculate balance
export const getBalance = async (userId: string) => {
  const { data: sent } = await supabase.from('time_ledger').select('hours').eq('from_user', userId)
  const { data: received } = await supabase.from('time_ledger').select('hours').eq('to_user', userId)
  const balance = (received?.reduce((acc, t) => acc + t.hours, 0) || 0) - (sent?.reduce((acc, t) => acc + t.hours, 0) || 0)
  return balance
}
