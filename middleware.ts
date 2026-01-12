import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Anonymous Session Middleware
 * Creates a session cookie for every visitor (no sign-in required)
 * This enables pay-per-use without authentication
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Check if user has anonymous session
  let sessionId = request.cookies.get('anon_session')?.value
  
  // Create new session if doesn't exist
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    
    response.cookies.set('anon_session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    })
    
    console.log('Created anonymous session:', sessionId)
  }
  
  return response
}

// Apply to all routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
