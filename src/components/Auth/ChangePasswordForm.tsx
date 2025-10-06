// ============================================
// src/components/Auth/ChangePasswordForm.tsx
// ============================================
import { useState, useCallback } from 'react'
import { Eye, EyeOff, Lock, Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { debounce } from 'lodash' // Assuming lodash is installed; if not, add: npm i lodash @types/lodash

/**
 * Calculates password strength based on criteria:
 * - Length >= 8
 * - Uppercase letter
 * - Lowercase letter
 * - Number
 * - Special character
 * Returns score (0-4) and label for UI feedback.
 */
const getPasswordStrength = (password: string): { score: number; label: string } => {
  let score = 0
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password)
  ]
  score = checks.filter(Boolean).length
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  return { score, label: labels[score] || 'Weak' }
}

export default function ChangePasswordForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string }>({ score: 0, label: 'Weak' })

  const { updatePassword } = useAuth()

  // Debounced password strength calculation for real-time feedback without perf hit
  const debouncedStrengthCheck = useCallback(
    debounce((pwd: string) => {
      if (pwd) {
        const strength = getPasswordStrength(pwd)
        setPasswordStrength(strength)
      }
    }, 300),
    []
  )

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPassword(value)
    debouncedStrengthCheck(value)
    // Clear errors on change
    if (error.includes('password')) setError('')
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (error === 'New passwords do not match') setError('')
  }

  // Validation logic extracted for reusability/testability
  const validateForm = (): string | null => {
    if (!newPassword || !confirmPassword) {
      return 'All fields are required'
    }
    if (newPassword !== confirmPassword) {
      return 'New passwords do not match'
    }
    if (newPassword.length < 6) {
      return 'New password must be at least 6 characters'
    }
    if (passwordStrength.score < 2) {
      return 'Password is too weak. Please make it stronger.'
    }
    return null // Valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validateForm()
    setError(validationError || '')
    setSuccess('')

    if (validationError) return

    setLoading(true)

    try {
      const result = await updatePassword(newPassword)
      if (result.success) {
        setSuccess('Password changed successfully!')
        handleReset() // Clear form on success
        // Auto-clear success message after 3s
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Failed to change password')
      }
    } catch (err) {
      // Fallback error handling (though updatePassword should handle)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNewPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
    setPasswordStrength({ score: 0, label: 'Weak' })
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="bg-white rounded-lg shadow" role="region" aria-labelledby="change-password-heading">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center" aria-hidden="true">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 id="change-password-heading" className="text-2xl font-bold text-gray-900">Change Password</h2>
            <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-2" 
            role="alert"
            aria-live="polite"
          >
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div 
            className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-start gap-2" 
            role="alert"
            aria-live="polite"
          >
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                clipRule="evenodd" 
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate aria-describedby="password-tips">
          <div className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:bg-gray-50"
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  aria-describedby="new-password-strength"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                  disabled={loading}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500" id="new-password-strength">
                Must be at least 6 characters
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition disabled:bg-gray-50"
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                  disabled={loading}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2" id="password-strength-indicator">
                <p className="text-sm font-medium text-gray-700">Password Strength:</p>
                <div className="flex gap-1" role="img" aria-label={`Password strength: ${passwordStrength.label}`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded transition-colors ${
                        i < passwordStrength.score ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p 
                  className={`text-xs font-medium ${
                    passwordStrength.score >= 3 ? 'text-green-600' : 'text-gray-500'
                  }`}
                  aria-live="polite"
                >
                  {passwordStrength.label} {passwordStrength.score < 3 && '- Improve for better security'}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || !!error}
                className="flex-1 bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Update password"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div 
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" 
                      aria-hidden="true"
                    />
                    Updating...
                  </span>
                ) : (
                  'Update Password'
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Reset form"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg" id="password-tips">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Password Security Tips</h3>
          <ul className="text-xs text-blue-800 space-y-1" role="list">
            <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
            <li>• Don't use common words or personal information</li>
            <li>• Use a unique password for each account</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div>
      </div>
    </div>
  )
}