import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Question from '@/models/Question'
import Answer from '@/models/Answer'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/content - Get questions/answers for admin moderation
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Verify the requesting user is an admin
    const requestingUser = await User.findById(decoded.userId)
    if (!requestingUser || requestingUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'question'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    let content = []
    let total = 0

    if (type === 'question') {
      // Build query for questions
      let query: any = {}
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      }

      if (status !== 'all') {
        switch (status) {
          case 'active':
            query.isDeleted = { $ne: true }
            query.isLocked = { $ne: true }
            break
          case 'locked':
            query.isLocked = true
            break
          case 'reported':
            query.reportCount = { $gt: 0 }
            break
          case 'deleted':
            query.isDeleted = true
            break
        }
      }

      // Get questions with pagination
      const skip = (page - 1) * limit
      const questions = await Question.find(query)
        .populate('author', 'username reputation')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      total = await Question.countDocuments(query)

      // Format questions for admin interface
      content = questions.map(question => ({
        _id: question._id,
        type: 'question',
        title: question.title,
        content: question.content?.substring(0, 200) + '...',
        author: question.author,
        voteScore: question.voteScore || 0,
        isLocked: question.isLocked || false,
        isPinned: question.isPinned || false,
        isHidden: question.isHidden || false,
        isDeleted: question.isDeleted || false,
        reportCount: question.reportCount || 0,
        createdAt: question.createdAt
      }))

    } else if (type === 'answer') {
      // Build query for answers
      let query: any = {}
      
      if (search) {
        query.content = { $regex: search, $options: 'i' }
      }

      if (status !== 'all') {
        switch (status) {
          case 'active':
            query.isDeleted = { $ne: true }
            query.isLocked = { $ne: true }
            break
          case 'locked':
            query.isLocked = true
            break
          case 'reported':
            query.reportCount = { $gt: 0 }
            break
          case 'deleted':
            query.isDeleted = true
            break
        }
      }

      // Get answers with pagination
      const skip = (page - 1) * limit
      const answers = await Answer.find(query)
        .populate('author', 'username reputation')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()

      total = await Answer.countDocuments(query)

      // Format answers for admin interface
      content = answers.map(answer => ({
        _id: answer._id,
        type: 'answer',
        title: `Answer to: ${answer.question?.title || 'Unknown Question'}`,
        content: answer.content?.substring(0, 200) + '...',
        author: answer.author,
        voteScore: answer.voteScore || 0,
        isLocked: answer.isLocked || false,
        isHidden: answer.isHidden || false,
        isDeleted: answer.isDeleted || false,
        reportCount: answer.reportCount || 0,
        createdAt: answer.createdAt
      }))
    }

    const pages = Math.ceil(total / limit)

    return NextResponse.json({
      content,
      pagination: {
        page,
        pages,
        total,
        limit
      }
    })
    
  } catch (error) {
    console.error('Get admin content error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}