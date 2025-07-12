import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Question from '@/models/Question'
import User from '@/models/User'
import Tag from '@/models/Tag'

// GET /api/search - Search across questions, users, and tags
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // 'questions', 'users', 'tags', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sort = searchParams.get('sort') || 'relevance'
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    const skip = (page - 1) * limit
    const searchQuery = query.trim()
    
    let results: any = {
      questions: [],
      users: [],
      tags: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    }
    
    // Helper function to build search query
    const buildSearchQuery = (searchTerm: string) => {
      // Always use regex search for more reliable results
      return {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { content: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    }
    
    // Search Questions
    if (type === 'all' || type === 'questions') {
      const questionQuery = buildSearchQuery(searchQuery)
      
      let questionSort: any = {}
      switch (sort) {
        case 'newest':
          questionSort = { createdAt: -1 }
          break
        case 'oldest':
          questionSort = { createdAt: 1 }
          break
        case 'most-voted':
          questionSort = { 'upvotes.length': -1 }
          break
        case 'relevance':
        default:
          questionSort = { createdAt: -1 }
          break
      }
      
      // Get total count for pagination
      const questionTotal = await Question.countDocuments(questionQuery)
      
      // Get questions with proper pagination
      const questionSkip = type === 'questions' ? skip : 0
      const questionLimit = type === 'questions' ? limit : (type === 'all' ? 5 : limit)
      
      const questions = await Question.find(questionQuery)
        .populate('author', 'username avatar reputation')
        .sort(questionSort)
        .skip(questionSkip)
        .limit(questionLimit)
        .lean()
      
      // Add computed fields
      const questionsWithStats = questions.map(question => ({
        ...question,
        voteScore: question.upvotes.length - question.downvotes.length,
        answerCount: question.answers.length,
        type: 'question'
      }))
      
      results.questions = questionsWithStats
      
      // Set pagination for questions-only search
      if (type === 'questions') {
        results.pagination.total = questionTotal
        results.pagination.pages = Math.ceil(questionTotal / limit)
      }
    }
    
    // Search Users
    if (type === 'all' || type === 'users') {
      const userQuery = {
        $or: [
          { username: { $regex: searchQuery, $options: 'i' } },
          { bio: { $regex: searchQuery, $options: 'i' } }
        ]
      }
      
      // Get total count for pagination
      const userTotal = await User.countDocuments(userQuery)
      
      // Get users with proper pagination
      const userSkip = type === 'users' ? skip : 0
      const userLimit = type === 'users' ? limit : (type === 'all' ? 3 : limit)
      
      const users = await User.find(userQuery)
        .select('username avatar bio reputation stats joinedAt')
        .sort({ reputation: -1 })
        .skip(userSkip)
        .limit(userLimit)
        .lean()
      
      results.users = users.map(user => ({ ...user, type: 'user' }))
      
      // Set pagination for users-only search
      if (type === 'users') {
        results.pagination.total = userTotal
        results.pagination.pages = Math.ceil(userTotal / limit)
      }
    }
    
    // Search Tags
    if (type === 'all' || type === 'tags') {
      const tagQuery = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } }
        ]
      }
      
      // Get total count for pagination
      const tagTotal = await Tag.countDocuments(tagQuery)
      
      // Get tags with proper pagination
      const tagSkip = type === 'tags' ? skip : 0
      const tagLimit = type === 'tags' ? limit : (type === 'all' ? 5 : limit)
      
      const tags = await Tag.find(tagQuery)
        .populate('createdBy', 'username')
        .sort({ questionCount: -1 })
        .skip(tagSkip)
        .limit(tagLimit)
        .lean()
      
      results.tags = tags.map(tag => ({ ...tag, type: 'tag' }))
      
      // Set pagination for tags-only search
      if (type === 'tags') {
        results.pagination.total = tagTotal
        results.pagination.pages = Math.ceil(tagTotal / limit)
      }
    }
    
    // For 'all' type, set combined total (no pagination for mixed results)
    if (type === 'all') {
      results.pagination.total = results.questions.length + results.users.length + results.tags.length
      results.pagination.pages = 1
    }
    
    return NextResponse.json(results)
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}