import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TransactionList({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<any[]>([])

  const fetchTransactions = async () => {
    const { data } = await supabase
      .from('time_ledger')
      .select('*')
      .or(`from_user.eq.${userId},to_user.eq.${userId}`)
      .order('created_at', { ascending: false })
    setTransactions(data || [])
  }

  useEffect(() => {
    fetchTransactions()

    // Realtime subscription using Supabase v2+ API
    const channel = supabase
      .channel('time_ledger_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'time_ledger' },
        (payload: any) => {
          if (
            payload.new.from_user === userId ||
            payload.new.to_user === userId
          ) {
            setTransactions(prev => [payload.new, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2">Transaction History</h3>
      <ul className="divide-y divide-gray-200">
        {transactions.map(tx => (
          <li key={tx.id} className="py-2">
            {tx.from_user === userId ? 'Sent' : 'Received'} {tx.hours} hrs - {tx.note}
          </li>
        ))}
      </ul>
    </div>
  )
}