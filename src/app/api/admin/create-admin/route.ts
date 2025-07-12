import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { verifyToken } from '@/lib/auth'

// POST /api/admin/create-admin - Create a new admin user
export async function POST(request: NextRequest) {
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

    const { username, email, password, reason } = await request.json()
    const role = 'admin' // Only allow admin role creation

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username: username.toLowerCase() })
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create admin user
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      isVerified: true, // Admin users are automatically verified
      reputation: 1000, // Give admin users starting reputation
      joinedAt: new Date(),
      lastActive: new Date(),
      roleChangedAt: new Date(),
      roleChangedBy: decoded.userId
    })

    await newUser.save()

    // Return user info without password
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      reputation: newUser.reputation,
      isActive: newUser.isActive,
      isVerified: newUser.isVerified,
      joinedAt: newUser.joinedAt
    }

    return NextResponse.json(
      { 
        message: 'Administrator created successfully',
        user: userResponse
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Create admin user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}