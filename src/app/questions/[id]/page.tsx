'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUp, ArrowDown, Eye, Clock, User, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Question {
  _id: string
  title: string
  content: string
  author: {
    _id: string
    username: string
    reputation: number
  }
  tags: string[]
  views: number
  upvotes: string[]
  downvotes: string[]
  voteScore: number
  answerCount: number
  createdAt: string
  lastActivity: string
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchQuestion()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/questions/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setQuestion(data.question)
      } else {
        setError(data.error || 'Question not found')
      }
    } catch (error) {
      setError('Failed to load question')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="card space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/questions" className="btn-primary">
            Back to Questions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/questions" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Questions
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{question.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>Asked {formatTimeAgo(question.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{question.views} views</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            <span>{question.answerCount} answers</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex gap-6">
          {/* Vote buttons */}
          <div className="flex flex-col items-center space-y-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowUp className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-xl font-bold text-gray-900">{question.voteScore}</span>
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ArrowDown className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div 
              className="prose max-w-none mb-6"
              dangerouslySetInnerHTML={{ __html: question.content }}
            />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${tag}`}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm rounded-md hover:bg-primary-200 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Author info */}
            <div className="flex justify-end">
              <div className="bg-blue-50 rounded-lg p-4 max-w-xs">
                <div className="text-xs text-blue-600 mb-1">asked {formatTimeAgo(question.createdAt)}</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">{question.author.username}</div>
                    <div className="text-xs text-blue-600">{question.author.reputation} reputation</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers section placeholder */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {question.answerCount} Answer{question.answerCount !== 1 ? 's' : ''}
        </h2>
        
        {question.answerCount === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No answers yet. Be the first to answer!</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Answer system coming soon...</p>
          </div>
        )}
      </div>

      {/* Answer form placeholder */}
      {user && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <div className="text-center py-8 text-gray-500">
            <p>Answer form coming soon...</p>
          </div>
        </div>
      )}
    </div>
  )
}