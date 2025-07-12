import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'

// GET /api/questions/[id] - Get a single question by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const question = await Question.findById(params.id)
      .populate('author', 'username avatar reputation')
      .lean()
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }
    
    // Increment view count
    await Question.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    
    // Add computed fields
    const questionWithStats = {
      ...question,
      voteScore: question.upvotes.length - question.downvotes.length,
      answerCount: question.answers.length
    }
    
    return NextResponse.json({ question: questionWithStats })
    
  } catch (error) {
    console.error('Get question error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}