import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TransferForm({ userId }: { userId: string }) {
  const [toEmail, setToEmail] = useState('')
  const [hours, setHours] = useState<number>(0)
  const [note, setNote] = useState('')

  const handleTransfer = async () => {
    const { data: toUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', toEmail)
      .single()
    if (!toUser) return alert('User not found')

    const { error } = await supabase.from('time_ledger').insert([
      { from_user: userId, to_user: toUser.id, hours, note },
    ])
    if (error) alert(error.message)
    else alert('Transfer successful')
  }

  return (
    <div className="p-4 bg-white shadow rounded">
      <h3 className="text-lg font-bold mb-2">Transfer Time</h3>
      <input
        type="email"
        placeholder="Recipient Email"
        value={toEmail}
        onChange={e => setToEmail(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="number"
        placeholder="Hours"
        value={hours}
        onChange={e => setHours(Number(e.target.value))}
        className="w-full border p-2 mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Note"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full border p-2 mb-2 rounded"
      />
      <button
        onClick={handleTransfer}
        className="w-full bg-green-500 text-white py-2 rounded"
      >
        Transfer
      </button>
    </div>
  )
}
