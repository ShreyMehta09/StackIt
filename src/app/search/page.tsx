'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MessageSquare, User, Hash, Clock, Eye, ArrowUp, ArrowDown } from 'lucide-react'

interface SearchResult {
  _id: string
  type: 'question' | 'user' | 'tag'
  title?: string
  content?: string
  username?: string
  name?: string
  description?: string
  bio?: string
  author?: {
    username: string
    reputation: number
  }
  tags?: string[]
  voteScore?: number
  answerCount?: number
  views?: number
  reputation?: number
  questionCount?: number
  createdAt?: string
  joinedAt?: string
}

interface SearchResults {
  questions: SearchResult[]
  users: SearchResult[]
  tags: SearchResult[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))
  const [results, setResults] = useState<SearchResults>({
    questions: [],
    users: [],
    tags: [],
    pagination: { page: 1, limit: 10, total: 0, pages: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    const t = searchParams.get('type') || 'all'
    const s = searchParams.get('sort') || 'relevance'
    const p = parseInt(searchParams.get('page') || '1')
    
    if (q) {
      setQuery(q)
      setType(t)
      setSort(s)
      setCurrentPage(p)
      performSearch(q, t, s, p)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string, searchType: string = 'all', sortBy: string = 'relevance', page: number = 1) => {
    if (!searchQuery.trim() || searchQuery.length < 2) return

    try {
      setLoading(true)
      setHasSearched(true)
      
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&type=${searchType}&sort=${sortBy}&page=${page}&limit=10`
      )
      const data = await response.json()

      if (response.ok) {
        setResults(data)
      } else {
        console.error('Search error:', data.error)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim().length < 2) return

    const params = new URLSearchParams()
    params.set('q', query)
    params.set('type', type)
    
    router.push(`/search?${params.toString()}`)
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    setCurrentPage(1)
    if (query.trim()) {
      const params = new URLSearchParams()
      params.set('q', query)
      params.set('type', newType)
      if (newType === 'questions') {
        params.set('sort', sort)
      }
      router.push(`/search?${params.toString()}`)
    }
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    setCurrentPage(1)
    if (query.trim()) {
      const params = new URLSearchParams()
      params.set('q', query)
      params.set('type', type)
      params.set('sort', newSort)
      router.push(`/search?${params.toString()}`)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    if (query.trim()) {
      const params = new URLSearchParams()
      params.set('q', query)
      params.set('type', type)
      params.set('page', newPage.toString())
      if (type === 'questions') {
        params.set('sort', sort)
      }
      router.push(`/search?${params.toString()}`)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Search</h1>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, users, or tags..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
          </div>
          <button
            type="submit"
            disabled={query.trim().length < 2}
            className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>

        {/* Search Filters */}
        {hasSearched && (
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
              <button
                onClick={() => handleTypeChange('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  type === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Results
              </button>
              <button
                onClick={() => handleTypeChange('questions')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  type === 'questions'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Questions ({results.pagination.total || results.questions.length})
              </button>
              <button
                onClick={() => handleTypeChange('users')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  type === 'users'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Users ({results.pagination.total || results.users.length})
              </button>
              <button
                onClick={() => handleTypeChange('tags')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  type === 'tags'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tags ({results.pagination.total || results.tags.length})
              </button>
            </div>

            {/* Sort Controls for Questions */}
            {type === 'questions' && results.questions.length > 0 && (
              <div className="flex gap-2 pb-4">
                <span className="text-sm text-gray-600 py-2">Sort by:</span>
                <button
                  onClick={() => handleSortChange('relevance')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    sort === 'relevance'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Relevance
                </button>
                <button
                  onClick={() => handleSortChange('newest')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    sort === 'newest'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Newest
                </button>
                <button
                  onClick={() => handleSortChange('most-voted')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    sort === 'most-voted'
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Most Voted
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search Results */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div className="space-y-6">
          {/* Questions Results */}
          {(type === 'all' || type === 'questions') && results.questions.length > 0 && (
            <div className="space-y-4">
              {type === 'all' && <h2 className="text-xl font-semibold text-gray-900">Questions</h2>}
              {results.questions.map((question) => (
                <div key={question._id} className="card hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    {/* Stats */}
                    <div className="flex flex-col items-center space-y-1 min-w-[80px] text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="w-4 h-4" />
                        <span className="font-medium">{question.voteScore}</span>
                      </div>
                      <div className="text-xs">votes</div>
                      
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-medium">{question.answerCount}</span>
                      </div>
                      <div className="text-xs">answers</div>
                      
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="font-medium">{question.views}</span>
                      </div>
                      <div className="text-xs">views</div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
                        <Link href={`/questions/${question._id}`}>
                          <span dangerouslySetInnerHTML={{ 
                            __html: highlightText(question.title || '', query) 
                          }} />
                        </Link>
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        <span dangerouslySetInnerHTML={{ 
                          __html: highlightText(
                            stripHtml(question.content || '').substring(0, 200) + '...', 
                            query
                          ) 
                        }} />
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.tags?.map((tag) => (
                          <Link
                            key={tag}
                            href={`/questions?tag=${tag}`}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md hover:bg-primary-200"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                      
                      {/* Author and Time */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium text-gray-700">{question.author?.username}</span>
                          <span>({question.author?.reputation} rep)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>asked {formatTimeAgo(question.createdAt || '')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users Results */}
          {(type === 'all' || type === 'users') && results.users.length > 0 && (
            <div className="space-y-4">
              {type === 'all' && <h2 className="text-xl font-semibold text-gray-900">Users</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.users.map((user) => (
                  <div key={user._id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          <Link href={`/users/${user.username}`} className="hover:text-primary-600">
                            <span dangerouslySetInnerHTML={{ 
                              __html: highlightText(user.username || '', query) 
                            }} />
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {user.reputation} reputation
                        </p>
                        {user.bio && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            <span dangerouslySetInnerHTML={{ 
                              __html: highlightText(user.bio, query) 
                            }} />
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags Results */}
          {(type === 'all' || type === 'tags') && results.tags.length > 0 && (
            <div className="space-y-4">
              {type === 'all' && <h2 className="text-xl font-semibold text-gray-900">Tags</h2>}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.tags.map((tag) => (
                  <div key={tag._id} className="card hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <Hash className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-gray-900">
                        <Link href={`/questions?tag=${tag.name}`} className="hover:text-primary-600">
                          <span dangerouslySetInnerHTML={{ 
                            __html: highlightText(tag.name || '', query) 
                          }} />
                        </Link>
                      </h3>
                    </div>
                    {tag.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        <span dangerouslySetInnerHTML={{ 
                          __html: highlightText(tag.description, query) 
                        }} />
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      {tag.questionCount} questions
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pagination */}
          {(type === 'questions' || type === 'users' || type === 'tags') && results.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <div className="flex gap-1">
                {[...Array(Math.min(results.pagination.pages, 5))].map((_, i) => {
                  const pageNum = i + 1
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
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
                onClick={() => handlePageChange(Math.min(currentPage + 1, results.pagination.pages))}
                disabled={currentPage === results.pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}

          {/* No Results */}
          {results.questions.length === 0 && results.users.length === 0 && results.tags.length === 0 && (
            <div className="card text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse by category.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/questions" className="btn-secondary">
                  Browse Questions
                </Link>
                <Link href="/ask" className="btn-primary">
                  Ask Question
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Initial State */
        <div className="card text-center py-12">
          <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Search StackIt</h3>
          <p className="text-gray-600 mb-6">
            Find questions, users, and tags across the platform.
          </p>
          <div className="text-sm text-gray-500">
            <p>Search tips:</p>
            <ul className="mt-2 space-y-1">
              <li>• Use specific keywords for better results</li>
              <li>• Search for users by username</li>
              <li>• Find questions by title, content, or tags</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}