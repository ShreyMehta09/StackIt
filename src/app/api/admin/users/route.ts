import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// GET /api/admin/users - Get users for admin moderation
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build query
    let query: any = {}
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (status !== 'all') {
      switch (status) {
        case 'active':
          query.isActive = true
          query.isBanned = false
          break
        case 'banned':
          query.isBanned = true
          break
        case 'admin':
          query.role = 'admin'
          break
        case 'moderator':
          query.role = 'moderator'
          break
      }
    }

    // Get users with pagination
    const skip = (page - 1) * limit
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await User.countDocuments(query)
    const pages = Math.ceil(total / limit)

    // Format users for admin interface
    const formattedUsers = users.map(user => ({
      _id: user._id,
      type: 'user',
      username: user.username,
      email: user.email,
      role: user.role,
      reputation: user.reputation,
      isActive: user.isActive,
      isBanned: user.isBanned,
      banReason: user.banReason,
      joinedAt: user.joinedAt || user.createdAt,
      stats: user.stats
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        pages,
        total,
        limit
      }
    })
    
  } catch (error) {
    console.error('Get admin users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}