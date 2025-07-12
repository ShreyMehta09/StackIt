'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowUp, ArrowDown, Eye, Clock, User, MessageSquare, Check, Edit, Save, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import RichTextEditor from '@/components/RichTextEditor'

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
  acceptedAnswer?: string
  isResolved: boolean
  createdAt: string
  lastActivity: string
}

interface Answer {
  _id: string
  content: string
  author: {
    _id: string
    username: string
    reputation: number
  }
  voteScore: number
  upvotes: string[]
  downvotes: string[]
  isAccepted: boolean
  createdAt: string
}

export default function QuestionDetailPage({ params }: { params: { id: string } }) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [answersLoading, setAnswersLoading] = useState(false)
  const [error, setError] = useState('')
  const [answerContent, setAnswerContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [userVotes, setUserVotes] = useState<{[key: string]: 'up' | 'down' | null}>({})
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  
  const { user } = useAuth()

  useEffect(() => {
    fetchQuestion()
    fetchAnswers()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/questions/${params.id}`)
      const data = await response.json()
      
      if (response.ok) {
        setQuestion(data.question)
        // Initialize edit form with current values
        setEditTitle(data.question.title)
        setEditContent(data.question.content)
        setEditTags(data.question.tags.join(', '))
      } else {
        setError(data.error || 'Question not found')
      }
    } catch (error) {
      setError('Failed to load question')
    } finally {
      setLoading(false)
    }
  }

  const fetchAnswers = async () => {
    try {
      setAnswersLoading(true)
      const response = await fetch(`/api/questions/${params.id}/answers`)
      const data = await response.json()
      
      if (response.ok) {
        setAnswers(data.answers)
        
        // Initialize user votes if logged in
        if (user) {
          const votes: {[key: string]: 'up' | 'down' | null} = {}
          data.answers.forEach((answer: Answer) => {
            if (answer.upvotes.includes(user.id)) {
              votes[answer._id] = 'up'
            } else if (answer.downvotes.includes(user.id)) {
              votes[answer._id] = 'down'
            } else {
              votes[answer._id] = null
            }
          })
          setUserVotes(votes)
        }
      }
    } catch (error) {
      console.error('Failed to load answers:', error)
    } finally {
      setAnswersLoading(false)
    }
  }

  const handleEditQuestion = async () => {
    if (!user || !question || question.author._id !== user.id) return

    // Validation
    if (!editTitle.trim() || editTitle.length < 10) {
      alert('Title must be at least 10 characters long')
      return
    }

    if (!editContent.trim() || editContent.length < 20) {
      alert('Content must be at least 20 characters long')
      return
    }

    if (!editTags.trim()) {
      alert('At least one tag is required')
      return
    }

    try {
      setEditSubmitting(true)
      
      const tags = editTags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0)
      
      const response = await fetch(`/api/questions/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          tags: tags
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setQuestion(data.question)
        setIsEditing(false)
        alert('Question updated successfully!')
      } else {
        alert(data.error || 'Failed to update question')
      }
    } catch (error) {
      console.error('Edit question error:', error)
      alert('Failed to update question')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleCancelEdit = () => {
    if (!question) return
    
    setEditTitle(question.title)
    setEditContent(question.content)
    setEditTags(question.tags.join(', '))
    setIsEditing(false)
  }

  const handleVote = async (type: 'up' | 'down', targetType: 'question' | 'answer', targetId: string) => {
    if (!user) return

    try {
      const endpoint = targetType === 'question' 
        ? `/api/questions/${targetId}/vote`
        : `/api/answers/${targetId}/vote`
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      })

      const data = await response.json()

      if (response.ok) {
        if (targetType === 'question' && question) {
          setQuestion({
            ...question,
            voteScore: data.voteScore
          })
        } else if (targetType === 'answer') {
          setAnswers(prev => prev.map(answer => 
            answer._id === targetId 
              ? { ...answer, voteScore: data.voteScore }
              : answer
          ))
          setUserVotes(prev => ({
            ...prev,
            [targetId]: data.userVote
          }))
        }
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Vote error:', error)
      alert('Failed to vote')
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    if (!user || !question || question.author._id !== user.id) return

    try {
      const response = await fetch(`/api/answers/${answerId}/accept`, {
        method: 'POST',
      })

      if (response.ok) {
        setAnswers(prev => prev.map(answer => ({
          ...answer,
          isAccepted: answer._id === answerId
        })))
        setQuestion(prev => prev ? {
          ...prev,
          acceptedAnswer: answerId,
          isResolved: true
        } : null)
      } else {
        const data = await response.json()
        alert(data.error)
      }
    } catch (error) {
      console.error('Accept answer error:', error)
      alert('Failed to accept answer')
    }
  }

  const handleSubmitAnswer = async () => {
    if (!user || !answerContent.trim()) return

    try {
      setSubmitting(true)
      const response = await fetch(`/api/questions/${params.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: answerContent }),
      })

      const data = await response.json()

      if (response.ok) {
        setAnswers(prev => [...prev, data.answer])
        setAnswerContent('')
        setQuestion(prev => prev ? {
          ...prev,
          answerCount: prev.answerCount + 1
        } : null)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error('Submit answer error:', error)
      alert('Failed to submit answer')
    } finally {
      setSubmitting(false)
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
        
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full text-3xl font-bold border-2 border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              placeholder="Question title..."
            />
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
        ) : (
          <>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-900 flex-1">{question.title}</h1>
              {user && question.author._id === user.id && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-4 flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </div>
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
          </>
        )}
      </div>

      {/* Question */}
      <div className="card">
        <div className="flex gap-6">
          {/* Vote buttons */}
          <div className="flex flex-col items-center space-y-2">
            <button 
              onClick={() => handleVote('up', 'question', question._id)}
              disabled={!user || isEditing}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowUp className="w-6 h-6 text-gray-600" />
            </button>
            <span className="text-xl font-bold text-gray-900">{question.voteScore}</span>
            <button 
              onClick={() => handleVote('down', 'question', question._id)}
              disabled={!user || isEditing}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDown className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <RichTextEditor
                    value={editContent}
                    onChange={setEditContent}
                    placeholder="Describe your question in detail..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="javascript, react, nextjs"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add up to 5 tags to describe what your question is about
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEditQuestion}
                    disabled={editSubmitting}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {editSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={editSubmitting}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                        <Link 
                          href={`/users/${question.author.username}`}
                          className="font-medium text-blue-900 hover:text-blue-700 transition-colors"
                        >
                          {question.author.username}
                        </Link>
                        <div className="text-xs text-blue-600">{question.author.reputation} reputation</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Answers section */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {question.answerCount} Answer{question.answerCount !== 1 ? 's' : ''}
        </h2>
        
        {answersLoading ? (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex gap-6">
                  <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="w-6 h-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : answers.length > 0 ? (
          <div className="space-y-6">
            {answers.map((answer) => (
              <div 
                key={answer._id} 
                className={`border-b border-gray-200 pb-6 last:border-b-0 ${
                  answer.isAccepted ? 'bg-green-50 -mx-6 px-6 py-4 rounded-lg' : ''
                }`}
              >
                <div className="flex gap-6">
                  {/* Vote buttons */}
                  <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                    <button 
                      onClick={() => handleVote('up', 'answer', answer._id)}
                      disabled={!user}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        userVotes[answer._id] === 'up' 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-bold text-gray-900">{answer.voteScore}</span>
                    <button 
                      onClick={() => handleVote('down', 'answer', answer._id)}
                      disabled={!user}
                      className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        userVotes[answer._id] === 'down' 
                          ? 'bg-red-100 text-red-600' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                    
                    {/* Accept button - only show to question author */}
                    {user && question.author._id === user.id && (
                      <button
                        onClick={() => handleAcceptAnswer(answer._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          answer.isAccepted
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                        title={answer.isAccepted ? 'Accepted answer' : 'Accept this answer'}
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                    
                    {/* Show accepted indicator for non-authors */}
                    {answer.isAccepted && (!user || question.author._id !== user.id) && (
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Answer content */}
                  <div className="flex-1">
                    {answer.isAccepted && (
                      <div className="mb-4 flex items-center gap-2 text-green-600 font-medium">
                        <Check className="w-4 h-4" />
                        <span>Accepted Answer</span>
                      </div>
                    )}
                    
                    <div 
                      className="prose max-w-none mb-6"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />

                    {/* Author info */}
                    <div className="flex justify-end">
                      <div className="bg-blue-50 rounded-lg p-4 max-w-xs">
                        <div className="text-xs text-blue-600 mb-1">answered {formatTimeAgo(answer.createdAt)}</div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <Link 
                              href={`/users/${answer.author.username}`}
                              className="font-medium text-blue-900 hover:text-blue-700 transition-colors"
                            >
                              {answer.author.username}
                            </Link>
                            <div className="text-xs text-blue-600">{answer.author.reputation} reputation</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No answers yet. Be the first to answer!</p>
          </div>
        )}
      </div>

      {/* Answer form */}
      {user && !isEditing && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <div className="space-y-4">
            <RichTextEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here..."
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Minimum 20 characters required
              </p>
              <button
                onClick={handleSubmitAnswer}
                disabled={submitting || answerContent.length < 20}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Post Your Answer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!user && (
        <div className="card text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Want to answer?</h3>
          <p className="text-gray-600 mb-4">You need to be logged in to post an answer.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/login" className="btn-primary">
              Log In
            </Link>
            <Link href="/register" className="btn-secondary">
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}