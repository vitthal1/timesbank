// pages/reset-password.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff, Lock, Check } from 'lucide-react'

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has access token from email link
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    
    if (!accessToken) {
      setError('Invalid or expired reset link')
    }
  }, [])

  const validatePassword = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
    return checks
  }

  const passwordChecks = validatePassword(newPassword)
  const isPasswordValid = Object.values(passwordChecks).every(check => check)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!isPasswordValid) {
      setError('Password does not meet requirements')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Password Reset Successful!</h2>
              <p className="text-gray-300 mb-4">Your password has been updated successfully.</p>
              <p className="text-gray-400 text-sm">Redirecting to login page...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-gray-300">Enter your new password below</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-gray-300">Password must contain:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.length ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.length ? 'bg-green-500/20' : 'bg-white/10'}`}>
                        {passwordChecks.length && <Check className="w-3 h-3" />}
                      </div>
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.uppercase ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.uppercase ? 'bg-green-500/20' : 'bg-white/10'}`}>
                        {passwordChecks.uppercase && <Check className="w-3 h-3" />}
                      </div>
                      One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.lowercase ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.lowercase ? 'bg-green-500/20' : 'bg-white/10'}`}>
                        {passwordChecks.lowercase && <Check className="w-3 h-3" />}
                      </div>
                      One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.number ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.number ? 'bg-green-500/20' : 'bg-white/10'}`}>
                        {passwordChecks.number && <Check className="w-3 h-3" />}
                      </div>
                      One number
                    </div>
                    <div className={`flex items-center gap-2 text-xs ${passwordChecks.special ? 'text-green-400' : 'text-gray-400'}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${passwordChecks.special ? 'bg-green-500/20' : 'bg-white/10'}`}>
                        {passwordChecks.special && <Check className="w-3 h-3" />}
                      </div>
                      One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Remember your password?{' '}
          <button
            onClick={() => router.push('/login')}
            className="text-purple-300 hover:text-purple-200 transition"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  )
}