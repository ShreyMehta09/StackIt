import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

// GET /api/users - Get all users with pagination and sorting
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sort = searchParams.get('sort') || 'reputation'
    const search = searchParams.get('search')
    
    const skip = (page - 1) * limit
    
    // Build query
    let query: any = {}
    
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } }
        ]
      }
    }
    
    // Build sort
    let sortQuery: any = {}
    switch (sort) {
      case 'reputation':
        sortQuery = { reputation: -1 }
        break
      case 'newest':
        sortQuery = { joinedAt: -1 }
        break
      case 'oldest':
        sortQuery = { joinedAt: 1 }
        break
      case 'name':
        sortQuery = { username: 1 }
        break
      default:
        sortQuery = { reputation: -1 }
    }
    
    const users = await User.find(query)
      .select('-password -email') // Exclude sensitive information
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()
    
    const total = await User.countDocuments(query)
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}