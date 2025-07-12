'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, User, Award, Calendar, MessageSquare, HelpCircle } from 'lucide-react'

interface UserProfile {
  _id: string
  username: string
  bio?: string
  reputation: number
  joinedAt: string
  stats: {
    questionsAsked: number
    answersGiven: number
    upvotesReceived: number
    downvotesReceived: number
    acceptedAnswers: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSort, setCurrentSort] = useState('reputation')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchUsers = async (sort = 'reputation', page = 1, search = '') => {
    try {
      setLoading(true)
      let url = `/api/users?sort=${sort}&page=${page}&limit=20`
      if (search.trim()) {
        url += `&search=${encodeURIComponent(search.trim())}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Failed to fetch users:', data.error)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers(currentSort, currentPage, searchQuery)
  }, [currentSort, currentPage])

  const handleSortChange = (sort: string) => {
    setCurrentSort(sort)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers(currentSort, 1, searchQuery)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 86400) return 'today'
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">
          Discover and connect with the StackIt community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="btn-primary px-4"
          >
            Search
          </button>
        </form>

        {/* Sort Options */}
        <div className="flex gap-2 overflow-x-auto">
          <button 
            onClick={() => handleSortChange('reputation')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              currentSort === 'reputation' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Reputation
          </button>
          <button 
            onClick={() => handleSortChange('newest')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              currentSort === 'newest' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Newest
          </button>
          <button 
            onClick={() => handleSortChange('name')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              currentSort === 'name' 
                ? 'bg-primary-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Name
          </button>
        </div>
      </div>

      {/* Users List - Horizontal Layout */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          [...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="flex gap-6">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : users.length > 0 ? (
          users.map((user) => (
            <Link key={user._id} href={`/users/${user.username}`}>
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-white" />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{user.username}</h3>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium">{user.reputation}</span>
                        <span>reputation</span>
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    {/* Stats and Join Date */}
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4 text-primary-600" />
                        <span className="font-medium text-gray-900">{user.stats.questionsAsked}</span>
                        <span>questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-gray-900">{user.stats.answersGiven}</span>
                        <span>answers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {formatTimeAgo(user.joinedAt)}</span>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="flex items-center gap-6 text-xs text-gray-400 mt-2">
                      <span>{user.stats.upvotesReceived} upvotes received</span>
                      <span>{user.stats.acceptedAnswers} accepted answers</span>
                    </div>
                  </div>

                  {/* Right side stats */}
                  <div className="hidden md:flex flex-col items-end text-right space-y-1">
                    <div className="text-2xl font-bold text-primary-600">
                      {user.reputation}
                    </div>
                    <div className="text-xs text-gray-500">reputation</div>
                    
                    <div className="flex gap-4 mt-2 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{user.stats.questionsAsked}</div>
                        <div className="text-xs text-gray-500">questions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{user.stats.answersGiven}</div>
                        <div className="text-xs text-gray-500">answers</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // Empty State
          <div className="card text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms.' : 'No users have joined yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === pageNum
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}