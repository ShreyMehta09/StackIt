import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// POST /api/questions/[id]/vote - Vote on a question
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
    
    const { type } = await request.json() // 'up' or 'down'
    
    if (!['up', 'down'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }
    
    const question = await Question.findById(params.id)
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }
    
    // Check if user is trying to vote on their own question
    if (question.author.toString() === payload.userId) {
      return NextResponse.json(
        { error: 'Cannot vote on your own question' },
        { status: 400 }
      )
    }
    
    const userId = payload.userId
    const hasUpvoted = question.upvotes.includes(userId)
    const hasDownvoted = question.downvotes.includes(userId)
    
    let updateQuery: any = {}
    let reputationChange = 0
    
    if (type === 'up') {
      if (hasUpvoted) {
        // Remove upvote
        updateQuery = { $pull: { upvotes: userId } }
        reputationChange = -10
      } else {
        // Add upvote, remove downvote if exists
        updateQuery = { 
          $addToSet: { upvotes: userId },
          $pull: { downvotes: userId }
        }
        reputationChange = hasDownvoted ? 12 : 10 // +10 for upvote, +2 to cancel downvote
      }
    } else {
      if (hasDownvoted) {
        // Remove downvote
        updateQuery = { $pull: { downvotes: userId } }
        reputationChange = 2
      } else {
        // Add downvote, remove upvote if exists
        updateQuery = { 
          $addToSet: { downvotes: userId },
          $pull: { upvotes: userId }
        }
        reputationChange = hasUpvoted ? -12 : -2 // -2 for downvote, -10 to cancel upvote
      }
    }
    
    // Update question
    const updatedQuestion = await Question.findByIdAndUpdate(
      params.id,
      updateQuery,
      { new: true }
    )
    
    // Update question author's reputation
    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: reputationChange }
    })
    
    // Calculate new vote score
    const voteScore = updatedQuestion.upvotes.length - updatedQuestion.downvotes.length
    
    return NextResponse.json({
      message: 'Vote updated successfully',
      voteScore,
      userVote: hasUpvoted && type === 'up' ? null : 
                hasDownvoted && type === 'down' ? null : type
    })
    
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}