// pages/auth/callback.tsx
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase automatically handles the token from URL
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error:', error)
        router.push('/auth/login?error=confirmation_failed')
        return
      }

      if (session) {
        // Wait for profile creation
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-500">
      <div className="text-white text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Confirming your email...</p>
      </div>
    </div>
  )
}