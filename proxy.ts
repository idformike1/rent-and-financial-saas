import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

// In Next.js 16+, migration to proxy.ts is recommended over middleware.ts.
export const proxy = auth((req) => {
  const isAuth = !!req.auth;
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname.startsWith('/login');
  const isApiAuthRoute = pathname.startsWith('/api/auth');

  // 1. Explicitly bypass static assets & auth API to prevent infinite redirect loops
  if (isApiAuthRoute || pathname.startsWith('/_next') || pathname === '/favicon.ico') {
    return;
  }

  // 2. Define the Sovereign Perimeter: The entire /(app) route group
  const isAppRoute = pathname.startsWith('/home') || 
                     pathname.startsWith('/transactions') || 
                     pathname.startsWith('/insights') || 
                     pathname.startsWith('/tenants') ||
                     pathname.startsWith('/treasury') ||
                     pathname.startsWith('/properties');

  // 3. Shield the Perimeter: Unauthorized access is immediately redirected
  if (!isAuth && isAppRoute) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }

  // 4. Intelligent Routing: Send logged-in users away from the login gate
  if (isAuth && isLoginPage) {
    const dashboardUrl = new URL('/home', req.nextUrl.origin);
    return Response.redirect(dashboardUrl);
  }
});

// Configure standard regex matching
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
