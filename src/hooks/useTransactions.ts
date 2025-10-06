import { useEffect, useState } from 'react'
import { TimeTransaction } from '../types'
import { supabase } from '../lib/supabaseClient'

export const useTransactions = (userId: string) => {
  const [transactions, setTransactions] = useState<TimeTransaction[]>([])

  useEffect(() => {
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('time_ledger')
        .select('*')
        .or(`from_user.eq.${userId},to_user.eq.${userId}`)
        .order('created_at', { ascending: false })
      setTransactions(data || [])
    }
    fetchTransactions()

    const channel = supabase
      .channel('time_ledger_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'time_ledger' },
        (payload) => {
          const newTransaction = payload.new as TimeTransaction
          if (newTransaction.from_user === userId || newTransaction.to_user === userId) {
            setTransactions(prev => [newTransaction, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return { transactions }
}
