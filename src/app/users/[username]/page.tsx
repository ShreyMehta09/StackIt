'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  User, 
  Calendar, 
  Award, 
  MessageSquare, 
  HelpCircle, 
  Clock,
  ArrowUp,
  Eye,
  Check
} from 'lucide-react'

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

interface Question {
  _id: string
  title: string
  content: string
  tags: string[]
  voteScore: number
  answerCount: number
  views: number
  createdAt: string
}

interface Answer {
  _id: string
  content: string
  voteScore: number
  isAccepted: boolean
  createdAt: string
  question: {
    _id: string
    title: string
    slug: string
  }
}

interface ActivityData {
  questions?: Question[]
  answers?: Answer[]
  recentQuestions?: Question[]
  recentAnswers?: Answer[]
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activity, setActivity] = useState<ActivityData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview')
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'))

  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview'
    const page = parseInt(searchParams.get('page') || '1')
    setActiveTab(tab)
    setCurrentPage(page)
    fetchUserProfile(tab, page)
  }, [searchParams, params.username])

  const fetchUserProfile = async (tab: string = 'overview', page: number = 1) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.username}?tab=${tab}&page=${page}&limit=10`)
      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setActivity(data.activity)
      } else {
        setError(data.error || 'User not found')
      }
    } catch (error) {
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    url.searchParams.delete('page')
    window.history.pushState({}, '', url.toString())
    setActiveTab(tab)
    setCurrentPage(1)
    fetchUserProfile(tab, 1)
  }

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', page.toString())
    window.history.pushState({}, '', url.toString())
    setCurrentPage(page)
    fetchUserProfile(activeTab, page)
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="card">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/users" className="btn-primary">
            Browse Users
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Profile Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{user.reputation} reputation</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
            </div>
            {user.bio && (
              <p className="text-gray-700 max-w-2xl">{user.bio}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-600">{user.stats.questionsAsked}</div>
              <div className="text-xs text-gray-600">Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{user.stats.answersGiven}</div>
              <div className="text-xs text-gray-600">Answers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{user.stats.acceptedAnswers}</div>
              <div className="text-xs text-gray-600">Accepted</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{user.stats.upvotesReceived}</div>
              <div className="text-xs text-gray-600">Upvotes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => handleTabChange('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabChange('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'questions'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Questions ({user.stats.questionsAsked})
            </button>
            <button
              onClick={() => handleTabChange('answers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'answers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Answers ({user.stats.answersGiven})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Recent Questions */}
              {activity.recentQuestions && activity.recentQuestions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Questions</h3>
                  <div className="space-y-4">
                    {activity.recentQuestions.map((question) => (
                      <div key={question._id} className="border-l-4 border-primary-200 pl-4">
                        <h4 className="font-medium text-gray-900 hover:text-primary-600">
                          <Link href={`/questions/${question._id}`}>
                            {question.title}
                          </Link>
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{question.voteScore} votes</span>
                          <span>{question.answerCount} answers</span>
                          <span>{question.views} views</span>
                          <span>{formatTimeAgo(question.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {user.stats.questionsAsked > 5 && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleTabChange('questions')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all questions →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Answers */}
              {activity.recentAnswers && activity.recentAnswers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Answers</h3>
                  <div className="space-y-4">
                    {activity.recentAnswers.map((answer) => (
                      <div key={answer._id} className="border-l-4 border-green-200 pl-4">
                        <div className="flex items-center gap-2 mb-1">
                          {answer.isAccepted && (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                          <h4 className="font-medium text-gray-900 hover:text-primary-600">
                            <Link href={`/questions/${answer.question._id}`}>
                              {answer.question.title}
                            </Link>
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{answer.voteScore} votes</span>
                          {answer.isAccepted && <span className="text-green-600">Accepted</span>}
                          <span>{formatTimeAgo(answer.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {user.stats.answersGiven > 5 && (
                    <div className="mt-4">
                      <button
                        onClick={() => handleTabChange('answers')}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        View all answers →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Empty State */}
              {(!activity.recentQuestions || activity.recentQuestions.length === 0) &&
               (!activity.recentAnswers || activity.recentAnswers.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No activity yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-4">
              {activity.questions && activity.questions.length > 0 ? (
                <>
                  {activity.questions.map((question) => (
                    <div key={question._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                                className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-md hover:bg-primary-200"
                              >
                                {tag}
                              </Link>
                            ))}
                          </div>
                          
                          {/* Time */}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>asked {formatTimeAgo(question.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {activity.pagination && activity.pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      <div className="flex gap-1">
                        {[...Array(Math.min(activity.pagination.pages, 5))].map((_, i) => {
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
                        onClick={() => handlePageChange(Math.min(currentPage + 1, activity.pagination.pages))}
                        disabled={currentPage === activity.pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No questions asked yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'answers' && (
            <div className="space-y-4">
              {activity.answers && activity.answers.length > 0 ? (
                <>
                  {activity.answers.map((answer) => (
                    <div key={answer._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex gap-4">
                        {/* Stats */}
                        <div className="flex flex-col items-center space-y-1 min-w-[60px] text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <ArrowUp className="w-4 h-4" />
                            <span className="font-medium">{answer.voteScore}</span>
                          </div>
                          <div className="text-xs">votes</div>
                          
                          {answer.isAccepted && (
                            <>
                              <Check className="w-5 h-5 text-green-600" />
                              <div className="text-xs text-green-600">Accepted</div>
                            </>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600">
                            <Link href={`/questions/${answer.question._id}`}>
                              {answer.question.title}
                            </Link>
                          </h3>
                          
                          <p className="text-gray-600 mb-3 line-clamp-3">
                            {stripHtml(answer.content).substring(0, 300)}...
                          </p>
                          
                          {/* Time */}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>answered {formatTimeAgo(answer.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {activity.pagination && activity.pagination.pages > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      
                      <div className="flex gap-1">
                        {[...Array(Math.min(activity.pagination.pages, 5))].map((_, i) => {
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
                        onClick={() => handlePageChange(Math.min(currentPage + 1, activity.pagination.pages))}
                        disabled={currentPage === activity.pagination.pages}
                        className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No answers given yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}