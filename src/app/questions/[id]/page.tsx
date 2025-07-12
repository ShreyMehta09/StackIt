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
      <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-3xl mx-auto flex flex-col space-y-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-[#222] rounded w-3/4" />
            <div className="h-4 bg-[#222] rounded w-1/2" />
            <div className="bg-black border border-[#00ff7f33] rounded-2xl p-6 space-y-4 shadow-[0_0_16px_2px_#00ff7f22]">
              <div className="h-6 bg-[#222] rounded" />
              <div className="h-4 bg-[#222] rounded" />
              <div className="h-4 bg-[#222] rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !question) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-10">
          <div className="bg-black border border-[#00ff7f55] rounded-2xl p-12 text-center flex flex-col items-center shadow-[0_0_16px_2px_#00ff7f22]">
            <h1 className="text-2xl font-bold text-white mb-4">Question Not Found</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <Link href="/questions" className="bg-[#00ff7f] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f]">
              Back to Questions
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-3xl mx-auto flex flex-col space-y-10">
        {/* Header */}
        <div className="w-full">
          <Link href="/questions" className="inline-flex items-center text-[#00ff7f] hover:text-white mb-4 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Questions
          </Link>
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-3xl font-bold border-2 border-[#00ff7f] bg-black text-white rounded-lg px-4 py-2 focus:outline-none focus:border-[#00ff7f]"
                placeholder="Question title..."
              />
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#00ff7f]" />
                  <span>Asked {formatTimeAgo(question.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-[#00ff7f]" />
                  <span>{question.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-[#00ff7f]" />
                  <span>{question.answerCount} answers</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-white flex-1">{question.title}</h1>
                {user && question.author._id === user.id && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="ml-4 flex items-center gap-2 px-3 py-2 text-sm text-[#00ff7f] hover:text-white hover:bg-[#00ff7f22] rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[#00ff7f]" />
                  <span>Asked {formatTimeAgo(question.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-[#00ff7f]" />
                  <span>{question.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4 text-[#00ff7f]" />
                  <span>{question.answerCount} answers</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Question Card */}
        <div className="bg-black border border-[#00ff7f55] rounded-2xl p-8 shadow-[0_0_16px_2px_#00ff7f22]">
          <div className="flex gap-6">
            {/* Vote buttons */}
            <div className="flex flex-col items-center space-y-2">
              <button 
                onClick={() => handleVote('up', 'question', question._id)}
                disabled={!user || isEditing}
                className="p-2 rounded-lg hover:bg-[#00ff7f22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-6 h-6 text-[#00ff7f]" />
              </button>
              <span className="text-xl font-bold text-white">{question.voteScore}</span>
              <button 
                onClick={() => handleVote('down', 'question', question._id)}
                disabled={!user || isEditing}
                className="p-2 rounded-lg hover:bg-[#00ff7f22] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDown className="w-6 h-6 text-[#00ff7f]" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#00ff7f] mb-2">
                      Content
                    </label>
                    <RichTextEditor
                      value={editContent}
                      onChange={setEditContent}
                      placeholder="Describe your question in detail..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#00ff7f] mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full px-3 py-2 border border-[#00ff7f55] bg-black text-white rounded-lg focus:ring-2 focus:ring-[#00ff7f] focus:border-[#00ff7f]"
                      placeholder="javascript, react, nextjs"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Add up to 5 tags to describe what your question is about
                    </p>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleEditQuestion}
                      disabled={editSubmitting}
                      className="flex items-center gap-2 px-4 py-2 bg-[#00ff7f] text-black rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" />
                      {editSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={editSubmitting}
                      className="flex items-center gap-2 px-4 py-2 border border-[#00ff7f55] text-white rounded-lg hover:bg-[#00ff7f22] disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div 
                    className="prose max-w-none mb-6 text-white"
                    dangerouslySetInnerHTML={{ __html: question.content }}
                  />
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/questions?tag=${tag}`}
                        className="px-3 py-1 bg-[#00ff7f22] text-[#00ff7f] text-sm rounded-md hover:bg-[#00ff7f44] transition-colors"
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>
                  {/* Author info */}
                  <div className="flex justify-end">
                    <div className="bg-[#111] border border-[#00ff7f33] rounded-lg p-4 max-w-xs flex flex-col items-start">
                      <div className="text-xs text-[#00ff7f] mb-1">asked {formatTimeAgo(question.createdAt)}</div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#00ff7f] rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <Link 
                            href={`/users/${question.author.username}`}
                            className="font-medium text-white hover:text-[#00ff7f] transition-colors"
                          >
                            {question.author.username}
                          </Link>
                          <div className="text-xs text-[#00ff7f]">{question.author.reputation} reputation</div>
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
        <div className="bg-black border border-[#00ff7f55] rounded-2xl p-8 shadow-[0_0_16px_2px_#00ff7f22]">
          <h2 className="text-xl font-bold text-white mb-4">
            {question.answerCount} Answer{question.answerCount !== 1 ? 's' : ''}
          </h2>
          {answersLoading ? (
            <div className="space-y-6">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-[#222] pb-6 last:border-b-0">
                  <div className="flex gap-6">
                    <div className="flex flex-col items-center space-y-2 min-w-[60px]">
                      <div className="w-8 h-8 bg-[#222] rounded" />
                      <div className="w-6 h-4 bg-[#222] rounded" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-[#222] rounded w-full" />
                      <div className="h-4 bg-[#222] rounded w-3/4" />
                      <div className="h-4 bg-[#222] rounded w-1/2" />
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
                  className={`border-b border-[#222] pb-6 last:border-b-0 ${
                    answer.isAccepted ? 'bg-[#00ff7f11] border-l-4 border-l-[#00ff7f] rounded-xl' : ''
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
                            ? 'bg-[#00ff7f22] text-[#00ff7f]' 
                            : 'hover:bg-[#00ff7f22] text-[#00ff7f]' // always neon for consistency
                        }`}
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                      <span className="text-lg font-bold text-white">{answer.voteScore}</span>
                      <button 
                        onClick={() => handleVote('down', 'answer', answer._id)}
                        disabled={!user}
                        className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          userVotes[answer._id] === 'down' 
                            ? 'bg-[#00ff7f22] text-[#00ff7f]' 
                            : 'hover:bg-[#00ff7f22] text-[#00ff7f]'
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
                              ? 'bg-[#00ff7f] text-white'
                              : 'hover:bg-[#00ff7f22] text-[#00ff7f]'
                          }`}
                          title={answer.isAccepted ? 'Accepted answer' : 'Accept this answer'}
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      {/* Show accepted indicator for non-authors */}
                      {answer.isAccepted && (!user || question.author._id !== user.id) && (
                        <div className="p-2 bg-[#00ff7f] text-white rounded-lg">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    {/* Answer content */}
                    <div className="flex-1">
                      {answer.isAccepted && (
                        <div className="mb-4 flex items-center gap-2 text-[#00ff7f] font-medium">
                          <Check className="w-5 h-5" />
                          Accepted Answer
                        </div>
                      )}
                      <div className="prose max-w-none text-white mb-4" dangerouslySetInnerHTML={{ __html: answer.content }} />
                      {/* Author info */}
                      <div className="flex justify-end">
                        <div className="bg-[#111] border border-[#00ff7f33] rounded-lg p-4 max-w-xs flex flex-col items-start">
                          <div className="text-xs text-[#00ff7f] mb-1">answered {formatTimeAgo(answer.createdAt)}</div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#00ff7f] rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <Link 
                                href={`/users/${answer.author.username}`}
                                className="font-medium text-white hover:text-[#00ff7f] transition-colors"
                              >
                                {answer.author.username}
                              </Link>
                              <div className="text-xs text-[#00ff7f]">{answer.author.reputation} reputation</div>
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
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-[#00ff7f] opacity-70" />
              <p>No answers yet. Be the first to answer!</p>
            </div>
          )}
        </div>

        {/* Your Answer Form */}
        <div className="bg-black border border-[#00ff7f55] rounded-2xl p-8 shadow-[0_0_16px_2px_#00ff7f22]">
          <h3 className="text-xl font-bold text-white mb-4">Your Answer</h3>
          <div className="mb-4">
            <RichTextEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here..."
            />
          </div>
          <button
            onClick={handleSubmitAnswer}
            disabled={submitting || !user || answerContent.trim().length < 20}
            className="bg-[#00ff7f] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#00ff7fcc] transition drop-shadow-[0_0_8px_#00ff7f] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post Your Answer'}
          </button>
          <p className="text-xs text-gray-400 mt-2">Minimum 20 characters required</p>
        </div>
      </div>
    </div>
  )
}