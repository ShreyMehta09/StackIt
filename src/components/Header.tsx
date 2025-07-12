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

  // Fetch unread notification count
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  // Close user menu when clicking outside
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
      setIsMenuOpen(false) // Close mobile menu after search
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
    <header className="bg-black border-b border-zinc-700">
      <div className="container mx-auto px-4 max-w-6xl" >
        <div className="flex items-center h-16 w-full">
          {/* Left: Logo */}
          <div className="flex-shrink-0 flex items-center mr-6 md:mr-10 lg:mr-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow" style={{ boxShadow: '0 0 12px 2px #22c55e88' }}>
                <span className="text-black font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-white">StackIt</span>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 flex justify-center">
            <div className="hidden md:flex flex-1 max-w-lg">
              <form onSubmit={(e) => handleSearchSubmit(e, searchQuery)} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleSearchKeyPress(e, searchQuery)}
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-400"
                />
              </form>
            </div>
          </div>

          {/* Right: Navigation and Buttons */}
          <div className="flex items-center ml-6 space-x-4">
            {/* Navigation - Desktop */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/questions" className="text-gray-200 hover:text-green-400 font-medium">
                Questions
              </Link>
              <Link href="/tags" className="text-gray-200 hover:text-green-400 font-medium">
                Tags
              </Link>
              <Link href="/users" className="text-gray-200 hover:text-green-400 font-medium">
                Users
              </Link>
              <Link href="/search" className="text-gray-200 hover:text-green-400 font-medium">
                Search
              </Link>
            </nav>

            {/* User Actions */}
            {!isLoading && user ? (
              <>
                {/* Notifications */}
                <Link href="/notifications" className="relative p-2 text-gray-300 hover:text-green-400 transition-colors">
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
                    className="flex items-center space-x-2 text-gray-200 hover:text-green-400"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:block">{user.username}</span>
                  </button>
                  
                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 rounded-lg shadow-lg border border-zinc-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-zinc-700">
                        <p className="text-sm font-medium text-white">{user.username}</p>
                        <p className="text-xs text-gray-400">{user.reputation} reputation</p>
                      </div>
                      <Link href={`/users/${user.username}`} className="block px-4 py-2 text-sm text-gray-200 hover:bg-zinc-800">
                        Profile
                      </Link>
                      <Link href="/notifications" className="block px-4 py-2 text-sm text-gray-200 hover:bg-zinc-800">
                        Notifications
                        {unreadCount > 0 && (
                          <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-200 hover:bg-zinc-800">
                        Settings
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-zinc-800 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !isLoading ? (
              <div className="flex items-center space-x-6">
                <Link href="/login" className="text-gray-200 hover:text-green-400 font-medium">
                  Log in
                </Link>
                <Link href="/register" className="bg-green-500 hover:bg-green-400 text-black font-semibold py-2 px-4 rounded-lg transition">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-zinc-700 bg-zinc-900">
            {/* Mobile Search */}
            <div className="mb-4">
              <form onSubmit={(e) => handleSearchSubmit(e, mobileSearchQuery)} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={mobileSearchQuery}
                  onChange={(e) => setMobileSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleSearchKeyPress(e, mobileSearchQuery)}
                  placeholder="Search questions, users, tags..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-zinc-400"
                />
              </form>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link href="/questions" className="block py-2 text-gray-200 hover:text-green-400 font-medium">
                Questions
              </Link>
              <Link href="/tags" className="block py-2 text-gray-200 hover:text-green-400 font-medium">
                Tags
              </Link>
              <Link href="/users" className="block py-2 text-gray-200 hover:text-green-400 font-medium">
                Users
              </Link>
              <Link href="/ask" className="block py-2 text-green-400 hover:text-green-300 font-medium">
                Ask Question
              </Link>
              <Link href="/editor-demo" className="block py-2 text-gray-500 hover:text-gray-400 font-medium text-sm">
                Editor Demo
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}