'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Plus, MessageSquare, ArrowUp, ArrowDown, Eye, Clock, User, X } from 'lucide-react'

interface Question {
  _id: string
  title: string
  content: string
  author: {
    username: string
    reputation: number
  }
  tags: string[]
  views: number
  voteScore: number
  answerCount: number
  createdAt: string
  lastActivity: string
}

export default function QuestionsPage() {
  const searchParams = useSearchParams()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSort, setCurrentSort] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  const fetchQuestions = async (sort = 'newest', page = 1, tag?: string) => {
    try {
      setLoading(true)
      let url = `/api/questions?sort=${sort}&page=${page}&limit=10`
      if (tag) {
        url += `&tag=${encodeURIComponent(tag)}`
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setQuestions(data.questions)
        setTotalPages(data.pagination.pages)
      } else {
        console.error('Failed to fetch questions:', data.error)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const tag = searchParams.get('tag')
    setSelectedTag(tag)
    fetchQuestions(currentSort, currentPage, tag || undefined)
  }, [currentSort, currentPage, searchParams])

  const handleSortChange = (sort: string) => {
    setCurrentSort(sort)
    setCurrentPage(1)
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

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10 space-y-8">
      {/* Header */}
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-1">
              {selectedTag ? `Questions tagged "${selectedTag}"` : 'All Questions'}
            </h1>
            <p className="text-white/70 text-lg">
              {loading ? 'Loading...' : `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/ask" className="bg-[#00ff7f] text-black font-bold px-6 py-3 rounded-lg shadow-[0_0_16px_2px_#00ff7f] hover:bg-[#00e673] transition flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Ask Question
          </Link>
        </div>
      </div>

      {/* Tag Filter Display */}
      {selectedTag && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Filtered by tag:</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-md">
            <span className="font-medium">{selectedTag}</span>
            <Link href="/questions" className="hover:text-primary-900">
              <X className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 border-b border-[#00ff7f33] pb-4 overflow-x-auto">
        <button 
          onClick={() => handleSortChange('newest')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'newest' 
              ? 'bg-[#00ff7f] text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-[#00ff7f33] text-white hover:bg-[#00ff7f22]'
          }`}
        >
          Newest
        </button>
        <button 
          onClick={() => handleSortChange('active')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'active' 
              ? 'bg-[#00ff7f] text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-[#00ff7f33] text-white hover:bg-[#00ff7f22]'
          }`}
        >
          Active
        </button>
        <button 
          onClick={() => handleSortChange('unanswered')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'unanswered' 
              ? 'bg-[#00ff7f] text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-[#00ff7f33] text-white hover:bg-[#00ff7f22]'
          }`}
        >
          Unanswered
        </button>
        <button 
          onClick={() => handleSortChange('most-voted')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'most-voted' 
              ? 'bg-[#00ff7f] text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-[#00ff7f33] text-white hover:bg-[#00ff7f22]'
          }`}
        >
          Most Voted
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-6 mt-6">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-lg bg-black border border-[#00ff7f33] p-6 animate-pulse shadow-[0_0_16px_2px_#00ff7f22]">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center space-y-2 min-w-[80px]">
                    <div className="w-8 h-4 bg-gray-200 rounded"></div>
                    <div className="w-12 h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : questions.length > 0 ? (
          <>
            {questions.map((question) => (
              <div key={question._id} className="rounded-lg bg-black border border-[#00ff7f33] p-6 hover:shadow-[0_0_32px_4px_#00ff7f55] transition shadow-[0_0_16px_2px_#00ff7f22]">
                <div className="flex gap-4">
                  {/* Vote and Stats */}
                  <div className="flex flex-col items-center space-y-2 min-w-[80px] text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-4 h-4 text-[#00ff7f]" />
                      <span className="font-bold">{question.voteScore}</span>
                    </div>
                    <div className="text-xs text-center">votes</div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-[#00ff7f]" />
                      <span className="font-bold">{question.answerCount}</span>
                    </div>
                    <div className="text-xs text-center">answers</div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-[#00ff7f]" />
                      <span className="font-bold">{question.views}</span>
                    </div>
                    <div className="text-xs text-center">views</div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-2 hover:text-[#00ff7f]">
                      <Link href={`/questions/${question._id}`}>
                        {question.title}
                      </Link>
                    </h3>
                    
                    <p className="text-white/70 mb-3 line-clamp-2">
                      {stripHtml(question.content).substring(0, 200)}...
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/questions?tag=${tag}`}
                          className="px-2 py-1 bg-[#00ff7f22] text-[#00ff7f] text-xs rounded-md hover:bg-[#00ff7f] hover:text-black transition-colors font-bold"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Author and Time */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#00ff7f]" />
                      <Link 
                        href={`/users/${question.author.username}`}
                        className="font-bold text-white hover:text-[#00ff7f] transition-colors"
                      >
                        {question.author.username}
                      </Link>
                      <span className="text-white/60">({question.author.reputation} rep)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-[#00ff7f]" />
                      <span className="text-white/60">asked {formatTimeAgo(question.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-[#00ff7f] text-[#00ff7f] rounded-lg font-bold hover:bg-[#00ff7f] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-lg font-bold transition-colors ${
                        currentPage === i + 1
                          ? 'bg-[#00ff7f] text-black shadow-[0_0_8px_#00ff7f]'
                          : 'border border-[#00ff7f] text-[#00ff7f] hover:bg-[#00ff7f] hover:text-black'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-[#00ff7f] text-[#00ff7f] rounded-lg font-bold hover:bg-[#00ff7f] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="rounded-lg bg-black border border-[#00ff7f33] text-center py-16 px-6 shadow-[0_0_32px_4px_#00ff7f33] flex flex-col items-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-[#00ff7f] drop-shadow-[0_0_16px_#00ff7f]" />
            <h3 className="text-2xl font-bold text-white mb-4">No questions yet</h3>
            <p className="text-white/70 mb-6">Be the first to ask a question and help build our community!</p>
            <Link href="/ask" className="bg-[#00ff7f] text-black font-bold px-6 py-3 rounded-lg shadow-[0_0_16px_2px_#00ff7f] hover:bg-[#00e673] transition">
              Ask the First Question
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}