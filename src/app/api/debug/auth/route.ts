import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    
    const debugInfo = {
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 10)}...` : null,
      cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value.substring(0, 10) + '...'])),
      headers: {
        authorization: request.headers.get('authorization'),
        cookie: request.headers.get('cookie')?.substring(0, 50) + '...'
      }
    }
    
    if (token) {
      const payload = verifyToken(token)
      debugInfo.tokenValid = !!payload
      debugInfo.payload = payload ? { userId: payload.userId, username: payload.username } : null
    }
    
    return NextResponse.json(debugInfo)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}