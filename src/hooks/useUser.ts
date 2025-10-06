import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User } from '../types'

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const session = await supabase.auth.getSession()
      if (!session.data.session?.user) return
      const { data } = await supabase.from('users').select('*').eq('id', session.data.session.user.id).single()
      setUser(data)
    }
    fetchUser()
  }, [])

  return { user }
}
