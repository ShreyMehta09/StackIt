'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Search, Bell, User, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout, isLoading } = useAuth()
  const userMenuRef = useRef<HTMLDivElement>(null)

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

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StackIt</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search questions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/questions" className="text-gray-700 hover:text-primary-600 font-medium">
              Questions
            </Link>
            <Link href="/tags" className="text-gray-700 hover:text-primary-600 font-medium">
              Tags
            </Link>
            <Link href="/users" className="text-gray-700 hover:text-primary-600 font-medium">
              Users
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {!isLoading && user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-primary-600">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
                
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:block">{user.username}</span>
                  </button>
                  
                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.reputation} reputation</p>
                      </div>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Settings
                      </Link>
                      <button 
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : !isLoading ? (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <nav className="space-y-2">
              <Link href="/questions" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                Questions
              </Link>
              <Link href="/tags" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                Tags
              </Link>
              <Link href="/users" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                Users
              </Link>
              <Link href="/ask" className="block py-2 text-primary-600 hover:text-primary-700 font-medium">
                Ask Question
              </Link>
              <Link href="/editor-demo" className="block py-2 text-gray-500 hover:text-gray-700 font-medium text-sm">
                Editor Demo
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}