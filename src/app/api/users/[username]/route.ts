import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Question from '@/models/Question'
import Answer from '@/models/Answer'

// GET /api/users/[username] - Get user profile with activity
export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const tab = searchParams.get('tab') || 'overview'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const skip = (page - 1) * limit
    
    // Find user by username
    const user = await User.findOne({ username: params.username })
      .select('-password -email') // Exclude sensitive information
      .lean()
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    let activityData: any = {}
    
    // Get user's activity based on tab
    switch (tab) {
      case 'questions':
        const questions = await Question.find({ author: user._id })
          .populate('author', 'username avatar reputation')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
        
        const questionsWithStats = questions.map(question => ({
          ...question,
          voteScore: question.upvotes.length - question.downvotes.length,
          answerCount: question.answers.length
        }))
        
        const totalQuestions = await Question.countDocuments({ author: user._id })
        
        activityData = {
          questions: questionsWithStats,
          pagination: {
            page,
            limit,
            total: totalQuestions,
            pages: Math.ceil(totalQuestions / limit)
          }
        }
        break
        
      case 'answers':
        const answers = await Answer.find({ author: user._id })
          .populate('author', 'username avatar reputation')
          .populate('question', 'title slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
        
        const answersWithStats = answers.map(answer => ({
          ...answer,
          voteScore: answer.upvotes.length - answer.downvotes.length
        }))
        
        const totalAnswers = await Answer.countDocuments({ author: user._id })
        
        activityData = {
          answers: answersWithStats,
          pagination: {
            page,
            limit,
            total: totalAnswers,
            pages: Math.ceil(totalAnswers / limit)
          }
        }
        break
        
      case 'overview':
      default:
        // Get recent questions and answers for overview
        const recentQuestions = await Question.find({ author: user._id })
          .populate('author', 'username avatar reputation')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
        
        const recentAnswers = await Answer.find({ author: user._id })
          .populate('author', 'username avatar reputation')
          .populate('question', 'title slug')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
        
        activityData = {
          recentQuestions: recentQuestions.map(question => ({
            ...question,
            voteScore: question.upvotes.length - question.downvotes.length,
            answerCount: question.answers.length
          })),
          recentAnswers: recentAnswers.map(answer => ({
            ...answer,
            voteScore: answer.upvotes.length - answer.downvotes.length
          }))
        }
        break
    }
    
    return NextResponse.json({
      user,
      activity: activityData
    })
    
  } catch (error) {
    console.error('Get user profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}