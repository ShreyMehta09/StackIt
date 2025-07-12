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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedTag ? `Questions tagged "${selectedTag}"` : 'All Questions'}
          </h1>
          <p className="text-gray-600 mt-2">
            {loading ? 'Loading...' : `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/ask" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ask Question
        </Link>
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
      <div className="flex gap-2 border-b border-gray-200 pb-4 overflow-x-auto">
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
          onClick={() => handleSortChange('active')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            currentSort === 'active' 
              ? 'bg-primary-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Active
        </button>
        <button 
          onClick={() => handleSortChange('unanswered')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            currentSort === 'unanswered' 
              ? 'bg-primary-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Unanswered
        </button>
        <button 
          onClick={() => handleSortChange('most-voted')}
          className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
            currentSort === 'most-voted' 
              ? 'bg-primary-600 text-white' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Most Voted
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card animate-pulse">
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
              <div key={question._id} className="card hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Vote and Stats */}
                  <div className="flex flex-col items-center space-y-2 min-w-[80px] text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-4 h-4" />
                      <span className="font-medium">{question.voteScore}</span>
                    </div>
                    <div className="text-xs text-center">votes</div>
                    
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-medium">{question.answerCount}</span>
                    </div>
                    <div className="text-xs text-center">answers</div>
                    
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">{question.views}</span>
                    </div>
                    <div className="text-xs text-center">views</div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
                      <Link href={`/questions/${question._id}`}>
                        {question.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {stripHtml(question.content).substring(0, 200)}...
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/questions?tag=${tag}`}
                          className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md hover:bg-primary-200 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Author and Time */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium text-gray-700">{question.author.username}</span>
                        <span>({question.author.reputation} rep)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>asked {formatTimeAgo(question.createdAt)}</span>
                      </div>
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
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
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
          </>
        ) : (
          // Empty State
          <div className="card text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600 mb-6">Be the first to ask a question and help build our community!</p>
            <Link href="/ask" className="btn-primary">
              Ask the First Question
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}