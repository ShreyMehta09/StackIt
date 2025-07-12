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

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          [...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <div className="h-5 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                </div>
              </div>
            </div>
          ))
        ) : users.length > 0 ? (
          users.map((user) => (
            <Link key={user._id} href={`/users/${user.username}`}>
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-white" />
                  </div>

                  {/* User Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{user.username}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600 mb-3">
                    <Award className="w-4 h-4" />
                    <span>{user.reputation} reputation</span>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {user.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-primary-600">
                        <HelpCircle className="w-4 h-4" />
                        <span className="font-medium">{user.stats.questionsAsked}</span>
                      </div>
                      <div className="text-xs text-gray-500">Questions</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-green-600">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{user.stats.answersGiven}</span>
                      </div>
                      <div className="text-xs text-gray-500">Answers</div>
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-4">
                    <Calendar className="w-3 h-3" />
                    <span>Joined {formatTimeAgo(user.joinedAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          // Empty State
          <div className="col-span-full">
            <div className="card text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms.' : 'No users have joined yet.'}
              </p>
            </div>
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