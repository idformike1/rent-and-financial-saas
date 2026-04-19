import NextAuth from "next-auth"
import { authConfig } from "../auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const publicRoutes = ["/login", "/onboarding", "/tenant-register", "/api/auth", "/api/seed-master"];
  const isPublicRoute = publicRoutes.some(path => 
    nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
  );
  
  if (isPublicRoute) return;

  if (!isLoggedIn) {
     const redirectUrl = new URL("/login", nextUrl)
     return Response.redirect(redirectUrl)
  }

  const role = req.auth?.user?.role as string
  
  /**
   * RBAC FIREWALL: PATH-BASED RESTRICTIONS
   */

  // 1. Governance & Settings: Restricted to OWNER and ADMIN
  if (nextUrl.pathname.startsWith("/settings") || nextUrl.pathname.startsWith("/governance")) {
    if (role !== "OWNER" && role !== "ADMIN") {
       console.warn(`[SECURITY_BLOCKED] Role ${role} attempted access to ${nextUrl.pathname}`);
       return Response.redirect(new URL("/home?unauthorized=access_denied", nextUrl))
    }
  }

  // 2. Treasury Payables: Restricted to OWNER and MANAGER
  if (nextUrl.pathname.startsWith("/treasury/payables")) {
    if (role !== "OWNER" && role !== "MANAGER") {
       console.warn(`[SECURITY_BLOCKED] Role ${role} attempted access to ${nextUrl.pathname}`);
       return Response.redirect(new URL("/home?unauthorized=access_denied", nextUrl))
    }
  }

  return;
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
