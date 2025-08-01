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
      // Fetch platform statistics
      const statsResponse = await fetch('/api/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      } else {
        console.error('Failed to fetch stats:', statsResponse.status)
      }

      // Fetch recent questions
      const questionsResponse = await fetch('/api/questions?limit=5&sort=newest')
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json()
        setRecentQuestions(questionsData.questions || [])
      } else {
        console.error('Failed to fetch questions:', questionsResponse.status)
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
    <div className="space-y-8 bg-black">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl text-green-400 font-bold mb-4">
          Welcome to StackIt
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          A community-driven Q&A platform where developers help each other solve problems and share knowledge.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/questions" className="bg-green-400 text-black px-6 py-2.5 rounded-lg hover:bg-green-500 transition-colors font-semibold">
            Browse Questions
          </Link>
          <Link href="/ask" className="border-2 border-green-400 text-green-400 px-6 py-2.5 rounded-lg hover:bg-green-400 hover:text-black transition-colors font-semibold">
            Ask Question
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-lg text-center backdrop-blur-sm border border-gray-800">
          <MessageSquare className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {loading ? '...' : stats.totalQuestions.toLocaleString()}
          </h3>
          <p className="text-gray-400">Questions Asked</p>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-lg text-center backdrop-blur-sm border border-gray-800">
          <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {loading ? '...' : stats.totalUsers.toLocaleString()}
          </h3>
          <p className="text-gray-400">Registered Users</p>
        </div>
        <div className="bg-gray-900/50 p-6 rounded-lg text-center backdrop-blur-sm border border-gray-800">
          <Award className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {loading ? '...' : stats.totalAnswers.toLocaleString()}
          </h3>
          <p className="text-gray-400">Answers Given</p>
        </div>
      </div>

      {/* Recent Questions Preview */}
      <div className="bg-gray-900/50 p-6 rounded-lg backdrop-blur-sm border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Recent Questions</h2>
          {recentQuestions.length > 0 && (
            <Link href="/questions" className="text-green-400 hover:text-green-300 font-medium">
              View all →
            </Link>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border-b border-gray-800 pb-4 last:border-b-0">
                <div className="h-5 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                <div className="flex gap-2">
                  <div className="h-5 bg-gray-800 rounded w-16"></div>
                  <div className="h-5 bg-gray-800 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentQuestions.length > 0 ? (
          <div className="space-y-4">
            {recentQuestions.map((question) => (
              <div key={question._id} className="border-b border-gray-800 pb-4 last:border-b-0">
                <h3 className="font-semibold text-white mb-2 hover:text-green-400">
                  <Link href={`/questions/${question._id}`}>
                    {question.title}
                  </Link>
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
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
                        className="px-2 py-1 bg-green-400/10 text-green-400 text-xs rounded-md border border-green-400/20"
                      >
                        {tag}
                      </span>
                    ))}
                    {question.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{question.tags.length - 3} more</span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="w-3 h-3" />
                    <span>{question.author.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No questions yet. Be the first to ask!</p>
            <Link href="/ask" className="bg-green-400 text-black px-4 py-2 rounded-lg hover:bg-green-500 mt-4 inline-block font-semibold">
              Ask the First Question
            </Link>
          </div>
        )}
      </div>

      {/* Community Info Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 p-6 rounded-lg backdrop-blur-sm border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">Join Our Community</h3>
          <p className="text-gray-400 mb-4">
            Connect with {stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : 'thousands of'} developers, 
            share knowledge, and get help with your coding challenges.
          </p>
          <div className="flex gap-3">
            <Link href="/register" className="bg-green-400 text-black px-4 py-2 rounded-lg hover:bg-green-500 transition-colors font-semibold">
              Sign Up
            </Link>
            <Link href="/users" className="border-2 border-green-400 text-green-400 px-4 py-2 rounded-lg hover:bg-green-400 hover:text-black transition-colors font-semibold">
              Browse Users
            </Link>
          </div>
        </div>

        <div className="bg-gray-900/50 p-6 rounded-lg backdrop-blur-sm border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-gray-400">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-400 text-black rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <p>Ask questions about programming challenges you're facing</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-400 text-black rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <p>Get answers from experienced developers in the community</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-400 text-black rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <p>Vote on the best answers and build your reputation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}