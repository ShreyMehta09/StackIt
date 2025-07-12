import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Define protected routes
const protectedRoutes = [
  '/api/questions',
  '/api/answers',
  '/api/votes',
  '/api/user/profile'
]

// Define auth routes (redirect if already logged in)
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Check if route is protected and requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route) && request.method !== 'GET'
  )

  // Check if user is trying to access auth pages while logged in
  const isAuthRoute = authRoutes.includes(pathname)

  if (isProtectedRoute) {
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

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (isAuthRoute && token) {
    const payload = verifyToken(token)
    if (payload) {
      // Redirect to home if already logged in
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/:path*',
    '/login',
    '/register',
    '/ask',
    '/profile/:path*'
  ]
}