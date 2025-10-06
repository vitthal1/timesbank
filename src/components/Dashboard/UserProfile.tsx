// src/components/Dashboard/UserProfile.tsx
import { useEffect, useState } from 'react'
import { getUserById, updateUserProfile } from '../../services/userService'
import { User } from '../../types'

interface UserProfileProps {
  userId: string
}

export default function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    avatar_url: ''
  })

  useEffect(() => {
    loadUserData()
  }, [userId])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const userData = await getUserById(userId)
      if (userData) {
        setUser(userData)
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          bio: userData.bio || '',
          avatar_url: userData.avatar_url || ''
        })
      }
    } catch (err) {
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      await updateUserProfile(userId, {
        username: formData.username,
        bio: formData.bio,
        avatar_url: formData.avatar_url
      })
      
      await loadUserData()
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
      })
    }
    setIsEditing(false)
    setError('')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar
              </label>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    {formData.avatar_url && (
                      <img 
                        src={formData.avatar_url} 
                        alt="Avatar preview" 
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    )}
                    {!formData.avatar_url && (
                      <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-2xl text-gray-400">👤</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="url"
                    name="avatar_url"
                    value={formData.avatar_url}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-gray-500">Enter a URL to your avatar image</p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt="User avatar" 
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-2xl text-gray-400">👤</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              ) : (
                <p className="text-gray-900 py-2">{user?.username || 'Not set'}</p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <p className="text-gray-900 py-2">{user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900 py-2 whitespace-pre-wrap">{user?.bio || 'Not set'}</p>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Account Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">User ID:</span>
              <span className="text-gray-900 font-mono text-xs">{user?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Created:</span>
              <span className="text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type:</span>
              <span className={`font-medium ${user?.is_admin ? 'text-purple-600' : 'text-gray-900'}`}>
                {user?.is_admin ? 'Admin' : 'Member'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}