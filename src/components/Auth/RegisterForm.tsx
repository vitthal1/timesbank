// src/components/Auth/RegisterForm.tsx - MAGIC LINK VERSION
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

interface RegisterData {
  email: string
  username: string
  password: string
  bio?: string
  phone?: string
  location?: string
}

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    username: '',
    password: '',
    bio: '',
    phone: '',
    location: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  const router = useRouter()

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user)
        router.push('/dashboard')
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const getValidationErrors = (): Record<string, string> => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username || formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email is required'
    }
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = getValidationErrors()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            username: formData.username,
            bio: formData.bio,
            phone: formData.phone,
            location: formData.location
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        setErrors({ general: error.message })
        setIsSubmitting(false)
        return
      }

      console.log('Signup successful:', data)

      // Show confirmation message
      setShowConfirmation(true)
      setIsSubmitting(false)
    } catch (err) {
      console.error('Registration error:', err)
      setErrors({ general: 'Registration failed. Please try again.' })
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => {
      const { [field as string]: omitted, ...rest } = prev
      return rest
    })
  }

  // Confirmation Screen
  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-500">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Check Your Email!</h2>
          </div>
          
          <p className="text-white/90 text-center mb-6">
            We've sent a confirmation link to <strong className="text-white">{formData.email}</strong>
          </p>

          <div className="bg-blue-500/20 border border-blue-300/30 rounded-lg p-4 mb-6">
            <p className="text-white/80 text-sm text-center">
              Click the link in your email to activate your account and get started!
            </p>
          </div>

          <div className="space-y-3 text-white/70 text-sm">
            <p className="flex items-start">
              <span className="mr-2">📧</span>
              <span>Check your inbox (and spam folder)</span>
            </p>
            <p className="flex items-start">
              <span className="mr-2">⏱️</span>
              <span>The link expires in 24 hours</span>
            </p>
            <p className="flex items-start">
              <span className="mr-2">🔄</span>
              <span>Didn't receive it? Check your email and try again</span>
            </p>
          </div>

          <button
            onClick={() => {
              setShowConfirmation(false)
              setFormData({
                email: '',
                username: '',
                password: '',
                bio: '',
                phone: '',
                location: ''
              })
            }}
            className="w-full mt-6 text-white/70 hover:text-white text-sm underline"
          >
            Back to registration
          </button>
        </div>
      </div>
    )
  }

  // Registration Form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-500">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Register</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-white mb-2 text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              className={`w-full bg-white/10 border rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.username ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="johndoe"
            />
            {errors.username && <p className="text-red-300 text-xs mt-1">{errors.username}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-white mb-2 text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full bg-white/10 border rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                errors.email ? 'border-red-400' : 'border-white/20'
              }`}
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-300 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-white mb-2 text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full bg-white/10 border rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 ${
                  errors.password ? 'border-red-400' : 'border-white/20'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <p className="text-red-300 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="bio" className="block text-white mb-2 text-sm font-medium">
              Bio (Optional)
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-white mb-2 text-sm font-medium">
              Phone (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-white mb-2 text-sm font-medium">
              Location (Optional)
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="City, State"
            />
          </div>

          {errors.general && (
            <div className="bg-red-500/20 border border-red-400 text-white px-4 py-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="text-white/70 text-center mt-6 text-sm">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-200 hover:text-white font-medium underline">
            Login
          </a>
        </p>
      </div>
    </div>
  )
}