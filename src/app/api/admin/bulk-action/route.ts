import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Question from '@/models/Question'
import Answer from '@/models/Answer'
import { verifyToken } from '@/lib/auth'

// POST /api/admin/bulk-action - Perform bulk actions on users/content
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

    const { action, items, reason, type } = await request.json()

    if (!action || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Action, items array, and reason are required' },
        { status: 400 }
      )
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required for all admin actions' },
        { status: 400 }
      )
    }

    let results = []

    if (type === 'users') {
      // Handle user actions
      for (const userId of items) {
        try {
          let updateData: any = {}
          
          switch (action) {
            case 'ban':
              updateData = {
                isBanned: true,
                banReason: reason,
                bannedAt: new Date(),
                bannedBy: decoded.userId
              }
              break
            case 'unban':
              updateData = {
                isBanned: false,
                banReason: null,
                unbannedAt: new Date(),
                unbannedBy: decoded.userId
              }
              break
            case 'promote':
              updateData = {
                role: 'moderator',
                roleChangedAt: new Date(),
                roleChangedBy: decoded.userId
              }
              break
            case 'demote':
              updateData = {
                role: 'user',
                roleChangedAt: new Date(),
                roleChangedBy: decoded.userId
              }
              break
            default:
              throw new Error(`Unknown user action: ${action}`)
          }

          const result = await User.findByIdAndUpdate(userId, updateData, { new: true })
          results.push({ id: userId, success: true, result })
        } catch (error) {
          results.push({ id: userId, success: false, error: error.message })
        }
      }
    } else {
      // Handle content actions (questions/answers)
      const Model = type === 'questions' ? Question : Answer
      
      for (const itemId of items) {
        try {
          let updateData: any = {}
          
          switch (action) {
            case 'lock':
              updateData = { isLocked: true }
              break
            case 'unlock':
              updateData = { isLocked: false }
              break
            case 'hide':
              updateData = { isHidden: true }
              break
            case 'show':
              updateData = { isHidden: false }
              break
            case 'delete':
              updateData = { isDeleted: true }
              break
            case 'pin':
              if (type === 'questions') {
                updateData = { isPinned: true }
              } else {
                throw new Error('Cannot pin answers')
              }
              break
            case 'unpin':
              if (type === 'questions') {
                updateData = { isPinned: false }
              } else {
                throw new Error('Cannot unpin answers')
              }
              break
            default:
              throw new Error(`Unknown content action: ${action}`)
          }

          const result = await Model.findByIdAndUpdate(itemId, updateData, { new: true })
          results.push({ id: itemId, success: true, result })
        } catch (error) {
          results.push({ id: itemId, success: false, error: error.message })
        }
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      message: `Bulk action completed: ${successCount} successful, ${failureCount} failed`,
      results,
      successCount,
      failureCount
    })
    
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}