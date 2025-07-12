import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Answer from '@/models/Answer'
import Question from '@/models/Question'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// POST /api/answers/[id]/accept - Accept an answer
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
    
    const answer = await Answer.findById(params.id).populate('question')
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }
    
    const question = answer.question as any
    
    // Check if user is the question author
    if (question.author.toString() !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the question author can accept answers' },
        { status: 403 }
      )
    }
    
    // Check if answer is already accepted
    if (answer.isAccepted) {
      return NextResponse.json(
        { error: 'Answer is already accepted' },
        { status: 400 }
      )
    }
    
    // Unaccept any previously accepted answer for this question
    await Answer.updateMany(
      { question: question._id, isAccepted: true },
      { isAccepted: false }
    )
    
    // Accept this answer
    await Answer.findByIdAndUpdate(params.id, { isAccepted: true })
    
    // Update question with accepted answer and mark as resolved
    await Question.findByIdAndUpdate(question._id, {
      acceptedAnswer: params.id,
      isResolved: true,
      lastActivity: new Date()
    })
    
    // Give reputation bonus to answer author (+15 for accepted answer)
    await User.findByIdAndUpdate(answer.author, {
      $inc: { 
        reputation: 15,
        'stats.acceptedAnswers': 1
      }
    })
    
    return NextResponse.json({
      message: 'Answer accepted successfully'
    })
    
  } catch (error) {
    console.error('Accept answer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/answers/[id]/accept - Unaccept an answer
export async function DELETE(
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
    
    const answer = await Answer.findById(params.id).populate('question')
    if (!answer) {
      return NextResponse.json(
        { error: 'Answer not found' },
        { status: 404 }
      )
    }
    
    const question = answer.question as any
    
    // Check if user is the question author
    if (question.author.toString() !== payload.userId) {
      return NextResponse.json(
        { error: 'Only the question author can unaccept answers' },
        { status: 403 }
      )
    }
    
    // Check if answer is accepted
    if (!answer.isAccepted) {
      return NextResponse.json(
        { error: 'Answer is not accepted' },
        { status: 400 }
      )
    }
    
    // Unaccept the answer
    await Answer.findByIdAndUpdate(params.id, { isAccepted: false })
    
    // Update question to remove accepted answer and mark as unresolved
    await Question.findByIdAndUpdate(question._id, {
      acceptedAnswer: null,
      isResolved: false,
      lastActivity: new Date()
    })
    
    // Remove reputation bonus from answer author (-15 for unaccepted answer)
    await User.findByIdAndUpdate(answer.author, {
      $inc: { 
        reputation: -15,
        'stats.acceptedAnswers': -1
      }
    })
    
    return NextResponse.json({
      message: 'Answer unaccepted successfully'
    })
    
  } catch (error) {
    console.error('Unaccept answer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}