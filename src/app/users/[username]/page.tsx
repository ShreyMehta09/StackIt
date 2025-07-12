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
      <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-3xl mx-auto flex flex-col space-y-10">
          <div className="animate-pulse bg-black border border-[#00ff7f33] rounded-2xl p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-[#222] rounded-full" />
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-[#222] rounded w-48" />
                <div className="h-4 bg-[#222] rounded w-32" />
                <div className="h-4 bg-[#222] rounded w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-3xl mx-auto flex flex-col space-y-10">
          <div className="bg-black border border-[#00ff7f55] rounded-2xl p-12 text-center flex flex-col items-center shadow-[0_0_16px_2px_#00ff7f22]">
            <User className="w-16 h-16 mb-4 text-[#00ff7f] drop-shadow-[0_0_8px_#00ff7f]" />
            <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link href="/users" className="bg-[#00ff7f] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f]">
              Browse Users
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl mx-auto flex flex-col space-y-10">
        {/* Profile Card */}
        <div className="bg-black border border-[#00ff7f55] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-[0_0_16px_2px_#00ff7f22]">
          {/* Avatar */}
          <div className="w-24 h-24 bg-[#00ff7f] rounded-full flex items-center justify-center shadow-[0_0_16px_2px_#00ff7f88]">
            <User className="w-12 h-12 text-black" />
          </div>
          {/* Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user.username}</h1>
                <div className="flex items-center gap-4 text-lg text-[#00ff7f] mb-2">
                  <div className="flex items-center gap-1">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold text-white">{user.reputation}</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80">
                    <Calendar className="w-5 h-5 text-[#00ff7f]" />
                    <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {user.bio && (
                  <p className="text-gray-400 max-w-2xl">{user.bio}</p>
                )}
              </div>
              {/* Stats */}
              <div className="flex flex-row md:flex-col gap-6 md:gap-2 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#00ff7f]">{user.stats.questionsAsked}</div>
                  <div className="text-xs text-gray-400">Questions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{user.stats.answersGiven}</div>
                  <div className="text-xs text-gray-400">Answers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">{user.stats.acceptedAnswers}</div>
                  <div className="text-xs text-gray-400">Accepted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{user.stats.upvotesReceived}</div>
                  <div className="text-xs text-gray-400">Upvotes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-black border border-[#00ff7f33] rounded-2xl shadow-[0_0_8px_#00ff7f22]">
          <nav className="flex gap-8 px-8 pt-6 border-b border-[#222]">
            {['overview', 'questions', 'answers'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 px-1 border-b-2 font-semibold text-lg transition-all
                  ${activeTab === tab
                    ? 'border-[#00ff7f] text-[#00ff7f]'
                    : 'border-transparent text-white hover:text-[#00ff7f88] hover:border-[#00ff7f44]'}
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab !== 'overview' && (
                  <span className="ml-1 text-white/60 text-base">
                    ({tab === 'questions' ? user.stats.questionsAsked : user.stats.answersGiven})
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Recent Questions */}
                {activity.recentQuestions && activity.recentQuestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Questions</h3>
                    <div className="space-y-4">
                      {activity.recentQuestions.map((question) => (
                        <div key={question._id} className="bg-[#111] border border-[#00ff7f33] rounded-xl p-4">
                          <h4 className="font-medium text-white hover:text-[#00ff7f]">
                            <Link href={`/questions/${question._id}`}>{question.title}</Link>
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
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
                          className="text-[#00ff7f] hover:text-white font-medium"
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
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Answers</h3>
                    <div className="space-y-4">
                      {activity.recentAnswers.map((answer) => (
                        <div key={answer._id} className="bg-[#111] border border-green-400/30 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            {answer.isAccepted && (
                              <Check className="w-4 h-4 text-green-400" />
                            )}
                            <h4 className="font-medium text-white hover:text-[#00ff7f]">
                              <Link href={`/questions/${answer.question._id}`}>{answer.question.title}</Link>
                            </h4>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>{answer.voteScore} votes</span>
                            {answer.isAccepted && <span className="text-green-400">Accepted</span>}
                            <span>{formatTimeAgo(answer.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {user.stats.answersGiven > 5 && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleTabChange('answers')}
                          className="text-[#00ff7f] hover:text-white font-medium"
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
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#00ff7f] opacity-70" />
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
                      <div key={question._id} className="bg-[#111] border border-[#00ff7f33] rounded-xl p-4 flex gap-4">
                        {/* Stats */}
                        <div className="flex flex-col items-center space-y-1 min-w-[80px] text-sm text-[#00ff7f]">
                          <div className="flex items-center gap-1">
                            <ArrowUp className="w-4 h-4" />
                            <span className="font-medium">{question.voteScore}</span>
                          </div>
                          <div className="text-xs text-gray-400">votes</div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4 text-green-400" />
                            <span className="font-medium">{question.answerCount}</span>
                          </div>
                          <div className="text-xs text-gray-400">answers</div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className="font-medium">{question.views}</span>
                          </div>
                          <div className="text-xs text-gray-400">views</div>
                        </div>
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 hover:text-[#00ff7f]">
                            <Link href={`/questions/${question._id}`}>{question.title}</Link>
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
                                className="px-2 py-1 bg-[#00ff7f22] text-[#00ff7f] text-xs rounded-md hover:bg-[#00ff7f44]"
                              >
                                {tag}
                              </Link>
                            ))}
                          </div>
                          {/* Time */}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4 text-white/60" />
                            <span className="text-gray-400">asked {formatTimeAgo(question.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Pagination */}
                    {activity.pagination?.pages && activity.pagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        <button
                          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Previous
                        </button>
                        <div className="flex gap-1">
                          {[...Array(Math.min(activity.pagination?.pages ?? 0, 5))].map((_, i) => {
                            const pageNum = i + 1
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
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
                          onClick={() => handlePageChange(Math.min(currentPage + 1, activity.pagination?.pages ?? 1))}
                          disabled={currentPage === activity.pagination?.pages}
                          className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-[#00ff7f] opacity-70" />
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
                      <div key={answer._id} className="bg-[#111] border border-green-400/30 rounded-xl p-4 flex gap-4">
                        {/* Stats */}
                        <div className="flex flex-col items-center space-y-1 min-w-[60px] text-sm text-green-400">
                          <div className="flex items-center gap-1">
                            <ArrowUp className="w-4 h-4" />
                            <span className="font-medium">{answer.voteScore}</span>
                          </div>
                          <div className="text-xs text-gray-400">votes</div>
                          {answer.isAccepted && (
                            <>
                              <Check className="w-5 h-5 text-green-400" />
                              <div className="text-xs text-green-400">Accepted</div>
                            </>
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2 hover:text-[#00ff7f]">
                            <Link href={`/questions/${answer.question._id}`}>{answer.question.title}</Link>
                          </h3>
                          <p className="text-gray-400 mb-3 line-clamp-3">
                            {stripHtml(answer.content).substring(0, 300)}...
                          </p>
                          {/* Time */}
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="w-4 h-4 text-white/60" />
                            <span className="text-gray-400">answered {formatTimeAgo(answer.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Pagination */}
                    {activity.pagination?.pages && activity.pagination.pages > 1 && (
                      <div className="flex justify-center gap-2 mt-8">
                        <button
                          onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Previous
                        </button>
                        <div className="flex gap-1">
                          {[...Array(Math.min(activity.pagination?.pages ?? 0, 5))].map((_, i) => {
                            const pageNum = i + 1
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
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
                          onClick={() => handlePageChange(Math.min(currentPage + 1, activity.pagination?.pages ?? 1))}
                          disabled={currentPage === activity.pagination?.pages}
                          className="px-4 py-2 rounded-lg border border-[#00ff7f55] text-white bg-black hover:bg-[#00ff7f22] disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#00ff7f] opacity-70" />
                    <p>No answers given yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}