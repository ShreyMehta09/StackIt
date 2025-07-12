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
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl flex flex-col items-center space-y-10">
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Search</h1>
        <form onSubmit={handleSearch} className="flex w-full gap-4 flex-col sm:flex-row items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 w-7 h-7 drop-shadow-[0_0_8px_#00ff7f]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search questions, users, or tags..."
              className="w-full pl-12 pr-4 py-4 bg-black border border-[#00ff7f33] rounded-2xl text-lg text-white placeholder-white/60 shadow-[0_0_16px_2px_#00ff7f22] focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f] transition"
            />
          </div>
          <button
            type="submit"
            disabled={query.trim().length < 2}
            className="mt-4 sm:mt-0 bg-green-500 text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </form>

        {/* Results or Empty State */}
        <div className="w-full flex flex-col items-center">
          {loading ? (
            <div className="w-full rounded-lg bg-black border border-[#00ff7f33] p-10 flex flex-col items-center shadow-[0_0_32px_4px_#00ff7f33] animate-pulse">
              <Search className="w-16 h-16 text-white/30 mb-6 drop-shadow-[0_0_12px_#00ff7f]" />
              <div className="h-6 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-2/3"></div>
            </div>
          ) : hasSearched ? (
            <>
              {/* Results rendering here (keep your existing logic, but update card classes as below) */}
              {(type === 'all' || type === 'questions') && results.questions.length > 0 && (
                <div className="space-y-4 w-full">
                  {results.questions.map((question) => (
                    <div key={question._id} className="rounded-lg bg-black border border-[#00ff7f33] p-6 shadow-[0_0_16px_2px_#00ff7f22] hover:shadow-[0_0_32px_4px_#00ff7f55] transition">
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
                              <Link 
                                href={`/users/${question.author?.username}`}
                                className="font-medium text-gray-700 hover:text-primary-600 transition-colors"
                              >
                                {question.author?.username}
                              </Link>
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
              {/* Users and tags results, similar card styling */}
              {(type === 'all' || type === 'users') && results.users.length > 0 && (
                <div className="space-y-4 w-full">
                  {type === 'all' && <h2 className="text-xl font-semibold text-green-400">Users</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.users.map((user) => (
                      <div key={user._id} className="rounded-lg bg-black border-2 border-green-600 p-6 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-400">
                              <Link href={`/users/${user.username}`} className="hover:text-green-300">
                                {user.username}
                              </Link>
                            </h3>
                            <p className="text-sm text-green-300 mb-2">
                              {user.reputation} reputation
                            </p>
                            {user.bio && (
                              <p className="text-sm text-zinc-400 line-clamp-2">
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
                <div className="space-y-4 w-full">
                  {type === 'all' && <h2 className="text-xl font-semibold text-gray-900">Tags</h2>}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.tags.map((tag) => (
                      <div key={tag._id} className="rounded-lg bg-black border border-[#00ff7f33] p-6 shadow-[0_0_16px_2px_#00ff7f22] hover:shadow-[0_0_32px_4px_#00ff7f55] transition">
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
                <div className="w-full max-w-xl rounded-lg bg-black border border-[#00ff7f33] text-center py-12 shadow-[0_0_32px_4px_#00ff7f33] flex flex-col items-center">
                  <Search className="w-20 h-20 mx-auto mb-6 text-white drop-shadow-[0_0_16px_#00ff7f]" />
                  <h3 className="text-2xl font-bold text-white mb-4">No results found</h3>
                  <p className="text-white/70 mb-8">Try adjusting your search or filter to find what you're looking for</p>
                  <div className="flex gap-4 justify-center mt-4">
                    <Link href="/questions" className="border border-[#00ff7f] text-[#00ff7f] px-6 py-2 rounded-lg font-bold hover:bg-[#00ff7f] hover:text-black transition-colors">
                      Browse Questions
                    </Link>
                    <Link href="/ask" className="bg-[#00ff7f] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#00e673] transition-colors">
                      Ask Question
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full max-w-xl rounded-lg bg-black border border-[#00ff7f33] text-center py-12 shadow-[0_0_32px_4px_#00ff7f33] flex flex-col items-center">
              <Search className="w-20 h-20 mx-auto mb-6 text-white drop-shadow-[0_0_16px_#00ff7f]" />
              <h3 className="text-2xl font-bold text-white mb-4">Search StackIt</h3>
              <p className="text-white/70 mb-8">Find questions, users, and tags across the platform.</p>
              <div className="text-white/60 text-base space-y-1">
                <div>Search tips:</div>
                <ul className="mt-2 space-y-1">
                  <li>• Use specific keywords for better results</li>
                  <li>• Search for users by username</li>
                  <li>• Find questions by title, content, or tags</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}