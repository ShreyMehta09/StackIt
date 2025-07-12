import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Define auth routes (redirect if already logged in)
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // Check if user is trying to access auth pages while logged in
  const isAuthRoute = authRoutes.includes(pathname)

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
    '/api/questions/:path*',
    '/api/answers/:path*',
    '/api/votes/:path*',
    '/api/user/:path*',
    '/login',
    '/register',
    '/ask',
    '/profile/:path*'
  ]
}