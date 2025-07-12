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

// Green glowing spinner component
function GreenSpinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin shadow-[0_0_8px_#00ff7f]"></div>
    </div>
  );
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
            <h1 className="text-4xl font-extrabold text-green-400 mb-1">
              {selectedTag ? `Questions tagged "${selectedTag}"` : 'All Questions'}
            </h1>
            <p className="text-white/70 text-lg">
              {loading ? 'Loading...' : `${questions.length} question${questions.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <Link href="/ask" className="bg-green-400 text-black font-bold px-6 py-3 rounded-lg border border-green-400 hover:bg-green-500 transition flex items-center gap-2 shadow-[0_0_8px_#00ff7f]">
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
      <div className="flex gap-2 border-b border-green-400/30 pb-4 overflow-x-auto">
        <button 
          onClick={() => handleSortChange('newest')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'newest' 
              ? 'bg-green-400 text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-green-400/30 text-green-400 hover:bg-green-400/10'
          }`}
        >
          Newest
        </button>
        <button 
          onClick={() => handleSortChange('active')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'active' 
              ? 'bg-green-400 text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-green-400/30 text-green-400 hover:bg-green-400/10'
          }`}
        >
          Active
        </button>
        <button 
          onClick={() => handleSortChange('unanswered')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'unanswered' 
              ? 'bg-green-400 text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-green-400/30 text-green-400 hover:bg-green-400/10'
          }`}
        >
          Unanswered
        </button>
        <button 
          onClick={() => handleSortChange('most-voted')}
          className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition ${
            currentSort === 'most-voted' 
              ? 'bg-green-400 text-black shadow-[0_0_8px_#00ff7f]' 
              : 'bg-black border border-green-400/30 text-green-400 hover:bg-green-400/10'
          }`}
        >
          Most Voted
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-6 mt-6">
        {loading ? (
          <GreenSpinner />
        ) : questions.length > 0 ? (
          <>
            {questions.map((question) => (                <div key={question._id} className="rounded-lg bg-gray-900/30 border border-green-400/30 p-6 transition hover:border-green-400/50 backdrop-blur-sm">
                <div className="flex gap-4">
                  {/* Vote and Stats */}
                  <div className="flex flex-col items-center space-y-2 min-w-[80px] text-sm text-white/70">
                    <div className="flex items-center gap-1">
                      <ArrowUp className="w-4 h-4 text-green-400" />
                      <span className="font-bold text-green-400">{question.voteScore}</span>
                    </div>
                    <div className="text-xs text-center text-gray-400">votes</div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-green-400" />
                      <span className="font-bold text-green-400">{question.answerCount}</span>
                    </div>
                    <div className="text-xs text-center text-gray-400">answers</div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-green-400" />
                      <span className="font-bold text-green-400">{question.views}</span>
                    </div>
                    <div className="text-xs text-center text-gray-400">views</div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-2 hover:text-green-400">
                      <Link href={`/questions/${question._id}`}>
                        {question.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-400 mb-3 line-clamp-2">
                      {stripHtml(question.content).substring(0, 200)}...
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {question.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/questions?tag=${tag}`}
                          className="px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded-md hover:bg-green-400 hover:text-black transition-colors font-bold border border-green-400/20"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                    
                    {/* Author and Time */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-400" />
                      <Link 
                        href={`/users/${question.author.username}`}
                        className="font-bold text-white hover:text-green-400 transition-colors"
                      >
                        {question.author.username}
                      </Link>
                      <span className="text-gray-400">({question.author.reputation} rep)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-gray-400">asked {formatTimeAgo(question.createdAt)}</span>
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
                  className="px-4 py-2 border border-green-400 text-green-400 rounded-lg font-bold hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                          ? 'bg-green-400 text-black shadow-[0_0_8px_#00ff7f]'
                          : 'border border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-green-400 text-green-400 rounded-lg font-bold hover:bg-green-400 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <div className="rounded-lg bg-gray-900/30 border border-green-400/30 text-center py-16 px-6 flex flex-col items-center backdrop-blur-sm">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-green-400 drop-shadow-[0_0_16px_#00ff7f]" />
            <h3 className="text-2xl font-bold text-green-400 mb-4">No questions yet</h3>
            <p className="text-gray-400 mb-6">Be the first to ask a question and help build our community!</p>
            <Link href="/ask" className="bg-green-400 text-black font-bold px-6 py-3 rounded-lg border border-green-400 hover:bg-green-500 transition shadow-[0_0_8px_#00ff7f]">
              Ask the First Question
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}