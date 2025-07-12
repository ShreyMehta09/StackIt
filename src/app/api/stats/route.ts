import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Question from '@/models/Question'
import Answer from '@/models/Answer'

// GET /api/stats - Get public platform statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    // Get platform statistics
    const [
      totalUsers,
      totalQuestions,
      totalAnswers
    ] = await Promise.all([
      User.countDocuments({ isActive: true }), // Only count active users
      Question.countDocuments({ isDeleted: { $ne: true } }), // Only count non-deleted questions
      Answer.countDocuments({ isDeleted: { $ne: true } }) // Only count non-deleted answers
    ])

    const stats = {
      totalUsers,
      totalQuestions,
      totalAnswers
    }

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}