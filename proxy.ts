import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

// In Next.js 16+, migration to proxy.ts is recommended over middleware.ts.
export const proxy = auth((req) => {
  const isAuth = !!req.auth;
  const isLoginPage = req.nextUrl.pathname.startsWith('/login');
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth');

  // Allow API auth routes
  if (isApiAuthRoute) return;

  // Enterprise Enforcement: Check if user is active
  if (isAuth && !req.auth?.user?.isActive) {
    if (isLoginPage) return; // Allow staying on login to see error
    const errorUrl = new URL('/login', req.nextUrl.origin);
    errorUrl.searchParams.set('error', 'deactivated');
    return Response.redirect(errorUrl);
  }

  // Protect all other routes
  if (!isAuth && !isLoginPage) {
    const loginUrl = new URL('/login', req.nextUrl.origin);
    return Response.redirect(loginUrl);
  }

  // Redirect to dashboard if logged in and trying to access /login
  if (isAuth && isLoginPage) {
    const dashboardUrl = new URL('/treasury', req.nextUrl.origin);
    return Response.redirect(dashboardUrl);
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
