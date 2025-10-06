// src/pages/test-supabase.tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function TestSupabase() {
  const [status, setStatus] = useState('Testing...')

  useEffect(() => {
    async function test() {
      try {
        // Test 1: Check client exists
        if (!supabase) {
          setStatus('❌ Supabase client not initialized')
          return
        }
        
        // Test 2: Check session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setStatus(`❌ Session error: ${error.message}`)
          return
        }
        
        setStatus(`✅ Supabase connected! Session: ${session ? 'Active' : 'None'}`)
      } catch (err) {
        setStatus(`❌ Error: ${err.message}`)
      }
    }
    test()
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Supabase Connection Test</h1>
      <p>{status}</p>
    </div>
  )
}