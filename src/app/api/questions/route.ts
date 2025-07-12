import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import Tag from '@/models/Tag'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// GET /api/questions - Get all questions with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'newest'
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit
    
    // Build query
    let query: any = {}
    
    if (tag) {
      query.tags = { $in: [tag] }
    }
    
    if (search) {
      query.$text = { $search: search }
    }
    
    // Build sort
    let sortQuery: any = {}
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 }
        break
      case 'oldest':
        sortQuery = { createdAt: 1 }
        break
      case 'active':
        sortQuery = { lastActivity: -1 }
        break
      case 'unanswered':
        query.answers = { $size: 0 }
        sortQuery = { createdAt: -1 }
        break
      case 'most-voted':
        sortQuery = { 'upvotes.length': -1 }
        break
      default:
        sortQuery = { createdAt: -1 }
    }
    
    const questions = await Question.find(query)
      .populate('author', 'username avatar reputation')
      .populate('tags')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await Question.countDocuments(query)
    
    // Add computed fields
    const questionsWithStats = questions.map(question => ({
      ...question,
      voteScore: question.upvotes.length - question.downvotes.length,
      answerCount: question.answers.length
    }))
    
    return NextResponse.json({
      questions: questionsWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Get questions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/questions - Create a new question
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    // Get token from cookie
    const token = request.cookies.get('token')?.value
    
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
    
    const { title, content, tags } = await request.json()
    
    // Validation
    if (!title || !content || !tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Title, content, and tags are required' },
        { status: 400 }
      )
    }
    
    if (title.length < 10 || title.length > 200) {
      return NextResponse.json(
        { error: 'Title must be between 10 and 200 characters' },
        { status: 400 }
      )
    }
    
    if (content.length < 20) {
      return NextResponse.json(
        { error: 'Content must be at least 20 characters' },
        { status: 400 }
      )
    }
    
    if (tags.length === 0 || tags.length > 5) {
      return NextResponse.json(
        { error: 'Must have between 1 and 5 tags' },
        { status: 400 }
      )
    }
    
    // Validate and process tags
    const processedTags = tags.map((tag: string) => tag.toLowerCase().trim())
    
    // Create or update tags
    for (const tagName of processedTags) {
      let tag = await Tag.findOne({ name: tagName })
      if (!tag) {
        tag = new Tag({
          name: tagName,
          createdBy: payload.userId
        })
        await tag.save()
      }
      await tag.incrementQuestionCount()
    }
    
    // Create question
    const question = new Question({
      title,
      content,
      author: payload.userId,
      tags: processedTags
    })
    
    await question.save()
    
    // Update user stats
    await User.findByIdAndUpdate(payload.userId, {
      $inc: { 'stats.questionsAsked': 1 }
    })
    
    // Populate author info
    await question.populate('author', 'username avatar reputation')
    
    return NextResponse.json(
      { 
        message: 'Question created successfully',
        question
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Create question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}