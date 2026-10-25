import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, isSessionId, newSessionId, sessionCookieOptions } from '@/lib/pocket-session'

export function middleware(request: NextRequest): NextResponse {
  const existing = request.cookies.get(SESSION_COOKIE)?.value
  const sessionId = isSessionId(existing) ? existing : newSessionId()
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pocket-session', sessionId)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  if (sessionId !== existing) {
    response.cookies.set(SESSION_COOKIE, sessionId, sessionCookieOptions())
  }
  return response
}

export const config = {
  matcher: ['/login', '/session', '/drive', '/drive/:path*', '/settings', '/developer', '/files/:path*'],
}
