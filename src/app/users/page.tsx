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
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl mx-auto flex flex-col space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Users</h1>
          <p className="text-gray-400 text-lg">Discover and connect with the StackIt community</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff7f] w-6 h-6 drop-shadow-[0_0_8px_#00ff7f]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-12 pr-4 py-3 bg-black border border-[#00ff7f55] rounded-2xl text-white placeholder-white/60 shadow-[0_0_16px_2px_#00ff7f22] focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] transition"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00ff7f] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f]"
            >
              Search
            </button>
          </form>

          {/* Sort Options */}
          <div className="flex gap-2 overflow-x-auto">
            {['reputation', 'newest', 'name'].map((sort) => (
              <button
                key={sort}
                onClick={() => handleSortChange(sort)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap border transition-all
                  ${currentSort === sort
                    ? 'bg-[#00ff7f] text-black border-[#00ff7f] shadow-[0_0_8px_#00ff7f]'
                    : 'bg-black text-white border-[#222] hover:border-[#00ff7f88] hover:text-[#00ff7f]'}
                `}
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Users List - Neon Cards */}
        <div className="space-y-6 w-full">
          {loading ? (
            // Loading skeleton
            [...Array(8)].map((_, i) => (
              <div key={i} className="bg-black border border-[#00ff7f33] rounded-2xl p-6 flex items-center gap-6 animate-pulse shadow-[0_0_16px_2px_#00ff7f22]">
                <div className="w-16 h-16 bg-[#222] rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-[#222] rounded w-32" />
                    <div className="h-4 bg-[#222] rounded w-24" />
                  </div>
                  <div className="h-4 bg-[#222] rounded w-3/4" />
                  <div className="flex gap-6">
                    <div className="h-4 bg-[#222] rounded w-20" />
                    <div className="h-4 bg-[#222] rounded w-20" />
                    <div className="h-4 bg-[#222] rounded w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <Link key={user._id} href={`/users/${user.username}`}>
                <div className="bg-black border border-[#00ff7f55] rounded-2xl p-6 flex items-center gap-6 hover:shadow-[0_0_24px_4px_#00ff7f88] transition-shadow cursor-pointer shadow-[0_0_16px_2px_#00ff7f22]">
                  {/* Avatar */}
                  <div className="w-16 h-16 bg-[#00ff7f] rounded-full flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_2px_#00ff7f88]">
                    <User className="w-8 h-8 text-black" />
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-white">{user.username}</h3>
                      <div className="flex items-center gap-1 text-sm text-[#00ff7f]">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium">{user.reputation}</span>
                        <span className="text-gray-400">reputation</span>
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-gray-400 mb-3 line-clamp-2">{user.bio}</p>
                    )}

                    {/* Stats and Join Date */}
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <HelpCircle className="w-4 h-4 text-[#00ff7f]" />
                        <span className="font-medium text-white">{user.stats.questionsAsked}</span>
                        <span>questions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-green-400" />
                        <span className="font-medium text-white">{user.stats.answersGiven}</span>
                        <span>answers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>Joined {formatTimeAgo(user.joinedAt)}</span>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="flex items-center gap-6 text-xs text-gray-500 mt-2">
                      <span>{user.stats.upvotesReceived} upvotes received</span>
                      <span>{user.stats.acceptedAnswers} accepted answers</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            // Empty State
            <div className="bg-black border border-[#00ff7f55] rounded-2xl p-12 text-center flex flex-col items-center shadow-[0_0_16px_2px_#00ff7f22]">
              <User className="w-16 h-16 mb-4 text-[#00ff7f] drop-shadow-[0_0_8px_#00ff7f]" />
              <h3 className="text-2xl font-semibold text-white mb-2">No users yet</h3>
              <p className="text-gray-400">User profiles will appear here once people start joining the community.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                    className={`px-3 py-2 rounded-lg border transition-all
                      ${currentPage === pageNum
                        ? 'bg-[#00ff7f] text-black border-[#00ff7f] shadow-[0_0_8px_#00ff7f]'
                        : 'bg-black text-white border-[#222] hover:border-[#00ff7f88] hover:text-[#00ff7f]'}
                    `}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}