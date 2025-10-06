// src/components/ProtectedRoute.tsx
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { User } from '../types' // Import your User interface

/**
 * ProtectedRoute component that guards routes requiring authentication.
 * In development mode, skips auth and mocks a user for quick testing.
 * In production, redirects to login if not authenticated.
 */
interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Mock dev user for bypassing auth in development (customize as needed)
  const getMockDevUser = (): User => ({
    id: 'dev-mock-user-id', // Use a fixed UUID for dev
    email: 'dev@example.com',
    username: 'devuser',
    bio: 'Development mock user bio',
    avatar_url: '/avatar-placeholder.png', // Optional: add a placeholder image
    phone: null,
    location: null,
    role: 'user',
    is_admin: false, // Set to true for admin testing
    time_balance: 100.00, // Generous balance for dev testing
    rating: 4.5,
    total_hours_given: 50.00,
    total_hours_received: 30.00,
    verification_status: 'verified', // Skip verification hurdles in dev
    is_active: true,
    last_active_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  useEffect(() => {
    // In development, always allow access (mock user if needed)
    if (process.env.NODE_ENV === 'development') {
      return // Proceed directly; user can be null, but components handle it
    }

    // In production, enforce auth
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push('/auth/login')
    }
  }, [user, loading, router])

  // If loading, show spinner; otherwise render children
  // In dev, children render even if user is null (components should gracefully handle)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // For dev convenience, you could wrap children with a mock user context if needed,
  // but here we let components fall back to user || mockDevUser in their logic.
  // Example: In DashboardContent, use user || getMockDevUser()
  return <>{children}</>
}