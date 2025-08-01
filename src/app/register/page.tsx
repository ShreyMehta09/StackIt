'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service and Privacy Policy')
      setIsLoading(false)
      return
    }

    try {
      const result = await register(username, email, password, confirmPassword)
      
      if (result.success) {
        router.push('/')
      } else {
        setError(result.error || 'Registration failed')
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md p-8 bg-black rounded-2xl shadow-lg " style={{ boxShadow: '2px 2px 30px 5px #22c55e88' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Join StackIt</h1>
          <p className="text-gray-300 mt-2">Create your account to start asking and answering questions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-200 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
              placeholder="Choose a username"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              3-30 characters, letters, numbers, and underscores only
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
              placeholder="Create a password"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              At least 6 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
              placeholder="Confirm your password"
              disabled={isLoading}
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-400 mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
              className="h-4 w-4 text-green-500 focus:ring-green-500 border-zinc-700 bg-zinc-900 rounded mt-1"
              disabled={isLoading}
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
              I agree to the{' '}
              <a href="#" className="text-green-400 hover:text-green-300 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-green-400 hover:text-green-300 underline">
                Privacy Policy
              </a>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !username || !email || !password || !confirmPassword || !acceptTerms}
            className="w-full bg-green-500 hover:bg-green-700 text-black font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-green-400 hover:text-green-300 font-medium underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}