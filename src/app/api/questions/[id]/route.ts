import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// GET /api/questions/[id] - Get a specific question
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const question = await Question.findById(params.id)
      .populate('author', 'username reputation')
      .lean()

    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Increment view count
    await Question.findByIdAndUpdate(params.id, { $inc: { views: 1 } })

    // Calculate vote score
    const voteScore = question.upvotes.length - question.downvotes.length

    const questionData = {
      ...question,
      voteScore,
      answerCount: question.answers.length
    }

    return NextResponse.json({ question: questionData })
    
  } catch (error) {
    console.error('Get question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/questions/[id] - Update a question
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { title, content, tags } = await request.json()

    // Validation
    if (!title || title.trim().length < 10) {
      return NextResponse.json(
        { error: 'Title must be at least 10 characters long' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length < 20) {
      return NextResponse.json(
        { error: 'Content must be at least 20 characters long' },
        { status: 400 }
      )
    }

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'At least one tag is required' },
        { status: 400 }
      )
    }

    if (tags.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 tags allowed' },
        { status: 400 }
      )
    }

    // Validate tags
    for (const tag of tags) {
      if (!tag || typeof tag !== 'string' || tag.trim().length === 0) {
        return NextResponse.json(
          { error: 'All tags must be non-empty strings' },
          { status: 400 }
        )
      }
      if (tag.length > 30) {
        return NextResponse.json(
          { error: 'Tags must be 30 characters or less' },
          { status: 400 }
        )
      }
    }

    // Find the question
    const question = await Question.findById(params.id)
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if user is the author
    if (question.author.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'You can only edit your own questions' },
        { status: 403 }
      )
    }

    // Update the question
    const updatedQuestion = await Question.findByIdAndUpdate(
      params.id,
      {
        title: title.trim(),
        content: content.trim(),
        tags: tags.map(tag => tag.trim().toLowerCase()),
        lastActivity: new Date()
      },
      { new: true }
    ).populate('author', 'username reputation')

    // Calculate vote score
    const voteScore = updatedQuestion.upvotes.length - updatedQuestion.downvotes.length

    const questionData = {
      ...updatedQuestion.toObject(),
      voteScore,
      answerCount: updatedQuestion.answers.length
    }

    return NextResponse.json({ 
      message: 'Question updated successfully',
      question: questionData 
    })
    
  } catch (error) {
    console.error('Update question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/questions/[id] - Delete a question (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const user = await User.findById(decoded.userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the question
    const question = await Question.findById(params.id)
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Check if user is the author or admin
    if (question.author.toString() !== user._id.toString() && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only delete your own questions' },
        { status: 403 }
      )
    }

    // Soft delete the question
    await Question.findByIdAndUpdate(params.id, {
      isDeleted: true,
      lastActivity: new Date()
    })

    return NextResponse.json({ 
      message: 'Question deleted successfully' 
    })
    
  } catch (error) {
    console.error('Delete question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}