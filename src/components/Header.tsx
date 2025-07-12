'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, User, Menu, X, LogOut, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileSearchQuery, setMobileSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, logout, isLoading } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?unread=true&limit=1')
      const data = await response.json()
      if (response.ok) {
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setIsMenuOpen(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent, query: string) => {
    e.preventDefault()
    handleSearch(query)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent, query: string) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
  }

  return (
    <header className="bg-black shadow-sm border-b border-zinc-800">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-green-400">StackIt</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={(e) => handleSearchSubmit(e, searchQuery)} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => handleSearchKeyPress(e, searchQuery)}
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 text-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
              />
            </form>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/questions" className="text-green-400 hover:text-green-300 font-medium">
              Questions
            </Link>
            <Link href="/tags" className="text-zinc-200 hover:text-green-300 font-medium">
              Tags
            </Link>
            <Link href="/users" className="text-zinc-200 hover:text-green-300 font-medium">
              Users
            </Link>
            <Link href="/search" className="text-zinc-200 hover:text-green-300 font-medium">
              Search
            </Link>
            {user && user.role === 'admin' && (
              <Link href="/admin" className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                <Shield className="w-4 h-4" />
                <span className="hidden lg:block">Admin</span>
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {!isLoading && user ? (
              <>
                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 text-zinc-300 hover:text-green-400 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    className="flex items-center space-x-2 text-zinc-200 hover:text-green-400"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:block">{user.username}</span>
                    {user.role === 'admin' && (
                      <span title="Administrator"><Shield className="w-4 h-4 text-red-600" /></span>
                    )}
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-lg border border-zinc-800 py-2 z-50">
                      <div className="px-4 py-2 border-b border-zinc-800">
                        <p className="text-sm font-medium text-green-400 flex items-center gap-2">
                          {user.username}
                          {user.role === 'admin' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-zinc-400">{user.reputation} reputation</p>
                      </div>
                      <Link href={`/users/${user.username}`} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
                        Profile
                      </Link>
                      <Link href="/notifications" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
                        Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-zinc-800 mt-1">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Admin Panel
                          </div>
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 border-t border-zinc-800 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !isLoading ? (
              <div className="flex items-center space-x-8 ml-8">
                <Link href="/login" className="text-zinc-200 hover:text-green-400 font-medium">
                  Log in
                </Link>
                <Link href="/register" className="bg-green-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="w-20 h-8 bg-zinc-800 rounded animate-pulse"></div>
            )}
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-zinc-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-800">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={(e) => handleSearchSubmit(e, mobileSearchQuery)} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleSearchKeyPress(e, mobileSearchQuery)}
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 text-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-500"
                />
              </form>
            </div>
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link href="/questions" className="block py-2 text-green-400 hover:text-green-300 font-medium">
                Questions
              </Link>
              <Link href="/tags" className="block py-2 text-zinc-200 hover:text-green-300 font-medium">
                Tags
              </Link>
              <Link href="/users" className="block py-2 text-zinc-200 hover:text-green-300 font-medium">
                Users
              </Link>
              <Link href="/ask" className="block py-2 text-green-400 hover:text-green-300 font-medium">
                Ask Question
              </Link>
              {user && user.role === 'admin' && (
                <Link href="/admin" className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 font-medium border-t border-zinc-800 pt-4 mt-4">
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
              <Link href="/editor-demo" className="block py-2 text-zinc-500 hover:text-zinc-400 font-medium text-sm">
                Editor Demo
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
