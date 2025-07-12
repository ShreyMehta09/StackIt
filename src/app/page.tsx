'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { MessageSquare, Users, Award, Clock, User } from 'lucide-react'

interface Question {
  _id: string
  title: string
  author: {
    username: string
    reputation: number
  }
  tags: string[]
  voteScore: number
  answerCount: number
  createdAt: string
}

interface Stats {
  totalQuestions: number
  totalUsers: number
  totalAnswers: number
}

export default function HomePage() {
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState<Stats>({ totalQuestions: 0, totalUsers: 0, totalAnswers: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch recent questions
      const questionsResponse = await fetch('/api/questions?limit=5&sort=newest')
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setRecentQuestions(questionsData.questions)
        setStats(prev => ({ ...prev, totalQuestions: questionsData.pagination.total || questionsData.questions.length }))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to StackIt
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          A community-driven Q&A platform where developers help each other solve problems and share knowledge.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/questions" className="btn-primary">
            Browse Questions
          </Link>
          <Link href="/ask" className="btn-secondary">
            Ask Question
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card text-center">
          <MessageSquare className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {loading ? '...' : stats.totalQuestions}
          </h3>
          <p className="text-gray-600">Questions Asked</p>
        </div>
        <div className="card text-center">
          <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {loading ? '...' : stats.totalUsers}
          </h3>
          <p className="text-gray-600">Active Users</p>
        </div>
        <div className="card text-center">
          <Award className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {loading ? '...' : stats.totalAnswers}
          </h3>
          <p className="text-gray-600">Answers Given</p>
        </div>
      </div>

      {/* Recent Questions Preview */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Questions</h2>
          {recentQuestions.length > 0 && (
            <Link href="/questions" className="text-primary-600 hover:text-primary-700 font-medium">
              View all →
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border-b border-gray-200 pb-4 last:border-b-0">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentQuestions.length > 0 ? (
          <div className="space-y-4">
            {recentQuestions.map((question) => (
              <div key={question._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600">
                  <Link href={`/questions/${question._id}`}>
                    {question.title}
                  </Link>
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-4">
                    <span>{question.voteScore} votes</span>
                    <span>{question.answerCount} answers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTimeAgo(question.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {question.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{question.tags.length - 3} more</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{question.author.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No questions yet. Be the first to ask!</p>
            <Link href="/ask" className="btn-primary mt-4 inline-block">
              Ask the First Question
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}