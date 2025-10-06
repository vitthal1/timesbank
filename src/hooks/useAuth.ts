// src/hooks/useAuth.ts - FIXED: Simplified to work with database trigger
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { User } from '../types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialAuthState: AuthState = {
  user: null,
  loading: true,
  error: null
}

// Simplified: Just fetch user, don't create
const fetchUser = async (authUserId: string): Promise<User | null> => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUserId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // User not found - this is expected right after signup
      // The trigger will create them, so we'll return null and let the auth state change handler pick it up
      return null
    }
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return user
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Checking session...')
        }
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Session error:', sessionError)
          }
          setAuthState({ user: null, loading: false, error: sessionError.message })
          return
        }

        if (session?.user) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Session found, fetching user data...')
          }
          const fetchedUser = await fetchUser(session.user.id)

          if (!mounted) return

          if (fetchedUser) {
            setAuthState({ user: fetchedUser, loading: false, error: null })
          } else {
            // User not in database yet, wait for trigger
            setAuthState({ user: null, loading: true, error: null })
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('No active session')
          }
          setAuthState({ user: null, loading: false, error: null })
        }
      } catch (err) {
        if (!mounted) return
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
        if (process.env.NODE_ENV === 'development') {
          console.error('Auth check error:', err)
        }
        setAuthState({ user: null, loading: false, error: errorMessage })
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state changed:', event)
      }

      if (!mounted) return

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Wait a moment for the trigger to complete
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const fetchedUser = await fetchUser(session.user.id)
          
          if (fetchedUser) {
            setAuthState({ user: fetchedUser, loading: false, error: null })
          } else {
            // Still not created, try again
            setTimeout(async () => {
              const retryUser = await fetchUser(session.user.id)
              if (retryUser && mounted) {
                setAuthState({ user: retryUser, loading: false, error: null })
              }
            }, 1000)
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'User setup failed'
          if (process.env.NODE_ENV === 'development') {
            console.error('SIGNED_IN user setup error:', err)
          }
          setAuthState({ user: null, loading: false, error: errorMessage })
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({ user: null, loading: false, error: null })
      } else if (event === 'PASSWORD_RECOVERY') {
        router.push('/reset-password')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting sign in for:', email)
      }
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Sign in error:', error)
        }
        const errorMessage = error.message || 'Sign in failed'
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }

      if (!data.user) {
        setAuthState(prev => ({ ...prev, loading: false, error: 'Sign in failed - no user data' }))
        return { success: false, error: 'Sign in failed - no user data' }
      }

      // Don't fetch user here, let the auth state change handler do it
      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign in failed'
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign in exception:', err)
      }
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signUp = async (
    email: string, 
    password: string, 
    username: string,
    bio?: string,
    phone?: string,
    location?: string
  ) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Attempting sign up for:', email, username)
      }
      setAuthState(prev => ({ ...prev, loading: true, error: null }))

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            bio,
            phone,
            location
          }
        }
      })

      if (authError) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Sign up error:', authError)
        }
        const errorMessage = authError.message || 'Sign up failed'
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }

      if (!authData.user) {
        if (process.env.NODE_ENV === 'development') {
          console.error('No user returned from sign up')
        }
        setAuthState(prev => ({ ...prev, loading: false, error: 'Sign up failed' }))
        return { success: false, error: 'Sign up failed' }
      }

      // User creation in public.users is handled by database trigger
      // The auth state change handler will fetch the user once it's created
      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign up failed'
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign up exception:', err)
      }
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const signOut = async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Signing out...')
      }
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Sign out error:', error)
        }
        const errorMessage = error.message || 'Sign out failed'
        setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
        return { success: false, error: errorMessage }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Sign out successful')
      }
      setAuthState({ user: null, loading: false, error: null })
      router.push('/')
      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed'
      if (process.env.NODE_ENV === 'development') {
        console.error('Sign out exception:', err)
      }
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }))
      return { success: false, error: errorMessage }
    }
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const { data: { user: authUser }, error: verifyError } = await supabase.auth.getUser()
      
      if (verifyError || !authUser) {
        return { success: false, error: 'Not authenticated' }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password update failed'
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
      return { success: false, error: errorMessage }
    }
  }

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signOut,
    logout: signOut,
    updatePassword,
    resetPassword
  }
}

export default useAuth