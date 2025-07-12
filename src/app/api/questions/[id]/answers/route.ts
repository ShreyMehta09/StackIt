import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import Answer from '@/models/Answer'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// GET /api/questions/[id]/answers - Get all answers for a question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'votes'
    
    const skip = (page - 1) * limit
    
    // Build sort query
    let sortQuery: any = {}
    switch (sort) {
      case 'votes':
        sortQuery = { 'upvotes.length': -1, createdAt: -1 }
        break
      case 'newest':
        sortQuery = { createdAt: -1 }
        break
      case 'oldest':
        sortQuery = { createdAt: 1 }
        break
      default:
        sortQuery = { 'upvotes.length': -1, createdAt: -1 }
    }
    
    const answers = await Answer.find({ question: params.id })
      .populate('author', 'username avatar reputation')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Answer.countDocuments({ question: params.id })
    
    // Add computed fields
    const answersWithStats = answers.map(answer => ({
      ...answer,
      voteScore: answer.upvotes.length - answer.downvotes.length
    }))
    
    return NextResponse.json({
      answers: answersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Get answers error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/questions/[id]/answers - Create a new answer
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    // Get token from cookie or Authorization header
    let token = request.cookies.get('token')?.value
    
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    // Verify user exists
    const user = await User.findById(payload.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      )
    }
    
    // Verify question exists
    const question = await Question.findById(params.id)
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }
    
    const { content } = await request.json()
    
    // Validation
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }
    
    if (content.length < 20) {
      return NextResponse.json(
        { error: 'Answer must be at least 20 characters' },
        { status: 400 }
      )
    }
    
    // Create answer
    const answer = new Answer({
      content,
      author: payload.userId,
      question: params.id
    })
    
    await answer.save()
    
    // Update question with new answer
    await Question.findByIdAndUpdate(params.id, {
      $push: { answers: answer._id },
      lastActivity: new Date()
    })
    
    // Update user stats
    await User.findByIdAndUpdate(payload.userId, {
      $inc: { 'stats.answersGiven': 1 }
    })
    
    // Populate author info
    await answer.populate('author', 'username avatar reputation')
    
    return NextResponse.json(
      { 
        message: 'Answer created successfully',
        answer: {
          ...answer.toObject(),
          voteScore: 0
        }
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Create answer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}