import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Question from '@/models/Question'
import Answer from '@/models/Answer'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/stats - Get platform statistics
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

    // Get platform statistics
    const [
      totalUsers,
      totalQuestions,
      totalAnswers,
      bannedUsers,
      lockedQuestions
    ] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      Answer.countDocuments(),
      User.countDocuments({ isBanned: true }),
      Question.countDocuments({ isLocked: true })
    ])

    // Calculate additional stats
    const pendingReports = 0 // TODO: Implement reports system
    const deletedContent = await Question.countDocuments({ isDeleted: true }) + 
                          await Answer.countDocuments({ isDeleted: true })
    const totalComments = 0 // TODO: Implement comments system

    const stats = {
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalComments,
      pendingReports,
      bannedUsers,
      lockedQuestions,
      deletedContent
    }

    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Get admin stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}