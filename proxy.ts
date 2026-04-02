import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  
  // MOCK: Checking for an auth token. In production, this verifies a JWT or NextAuth session cookie.
  const hasToken = request.cookies.has('auth-session')

  if (!hasToken && !isLoginPage) {
    // Redirect unauthenticated traffic to /login
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (hasToken && isLoginPage) {
    // If logged in, don't stay on the login page
    return NextResponse.redirect(new URL('/treasury', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Protect all routes except static assets, internal files, and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
