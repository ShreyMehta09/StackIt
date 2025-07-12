'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Shield, 
  UserPlus, 
  Crown, 
  Users, 
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function CreateAdminUserPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    reason: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Redirect if not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this page.</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('All fields are required')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please provide a valid email address')
      return
    }

    try {
      setLoading(true)
      
      console.log('Sending request to create admin user:', {
        username: formData.username,
        email: formData.email,
        role: 'admin',
        reason: formData.reason
      })
      
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: 'admin',
          reason: formData.reason
        }),
      })

      const data = await response.json()
      console.log('API Response:', response.status, data)

      if (response.ok) {
        setSuccess(`Administrator "${formData.username}" created successfully!`)
        setFormData({
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          reason: ''
        })
      } else {
        setError(data.error || 'Failed to create admin user')
      }
    } catch (error) {
      console.error('Create admin error:', error)
      setError('Network error: Unable to create admin user. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UserPlus className="w-8 h-8 text-blue-600" />
          Create Administrator
        </h1>
        <p className="text-gray-600 mt-2">Create new administrator accounts with full platform access</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Debug Info</h3>
          <p className="text-sm text-blue-800">Current user: {user.username} (Role: {user.role})</p>
          <p className="text-sm text-blue-800">API Endpoint: /api/admin/create-admin</p>
        </div>
      )}

      {/* Create Admin Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Display - Admin Only */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <div className="w-full">
              <div className="relative flex items-center p-4 border-2 border-blue-500 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-600" />
                  <div>
                    <div className="font-medium text-gray-900">Administrator</div>
                    <div className="text-sm text-gray-600">Full platform access and management capabilities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              3-30 characters, letters, numbers, and underscores only
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Minimum 6 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Creation
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              placeholder="Enter reason for creating this admin account..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Provide context for audit trail
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Administrator
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Administrator Account Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Admin users have full access to all platform features</li>
              <li>• Can create additional admin accounts</li>
              <li>• All admin actions are logged for audit purposes</li>
              <li>• Admin accounts are automatically verified</li>
              <li>• Starting reputation: 1000 points</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/admin"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Shield className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-medium text-gray-900">Back to Dashboard</h3>
              <p className="text-sm text-gray-600">Return to admin dashboard</p>
            </div>
          </div>
        </Link>

        <Link
          href="/users"
          className="card hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="font-medium text-gray-900">View All Users</h3>
              <p className="text-sm text-gray-600">Browse community members</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}