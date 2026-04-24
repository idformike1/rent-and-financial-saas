import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  console.log("[FLOW MAP 4: MIDDLEWARE] Intercepting URL:", req.nextUrl.pathname);
  console.log("[FLOW MAP 5: MIDDLEWARE] Token State:", req.auth);
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user as any;
  const requiresReset = user?.requiresPasswordChange;

  // Path logic
  const isAuthSetupPage = nextUrl.pathname === '/auth/setup-password';
  const isStaticAsset = nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/favicon.ico');
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  // Logic: If logged in and requires reset, force them to the setup page
  if (isLoggedIn && requiresReset && !isAuthSetupPage && !isStaticAsset && !isApiRoute) {
    console.log(`[SECURITY_GATE] Forcing password reset for user: ${user.email}`);
    return NextResponse.redirect(new URL('/auth/setup-password', nextUrl));
  }

  // If already at setup page but doesn't need reset, move to home
  if (isLoggedIn && !requiresReset && isAuthSetupPage) {
    return NextResponse.redirect(new URL('/home', nextUrl));
  }

  // If logged in and hitting login page, redirect to their dashboard
  if (isLoggedIn && nextUrl.pathname === '/login') {
    const dashboard = user.isSystemAdmin ? '/admin' : '/home';
    return NextResponse.redirect(new URL(dashboard, nextUrl));
  }

  // Deny by Default: If accessing protected routes without session, kick to login
  const isProtectedRoute = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/home');
  if (!isLoggedIn && isProtectedRoute) {
    console.log(`[SECURITY_GATE] Unauthorized access attempt to ${nextUrl.pathname}. Redirecting to /login.`);
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
