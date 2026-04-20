import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import NextAuth from "next-auth"
import { authConfig } from "../auth.config"

// ── RATE LIMITER STORAGE ─────────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>()
const LIMIT = 60
const WINDOW_MS = 60 * 1000

const { auth: nextAuthWrapper } = NextAuth(authConfig)

/**
 * IP EXTRACTOR
 */
function getClientIp(req: NextRequest) {
  const xForwardedFor = req.headers.get("x-forwarded-for")
  if (xForwardedFor) return xForwardedFor.split(",")[0].trim()
  return (req as any).ip || "127.0.0.1"
}

/**
 * RBAC FIREWALL (The core application logic)
 */
const rbacMiddleware = nextAuthWrapper((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const publicRoutes = ["/login", "/onboarding", "/tenant-register", "/api/auth", "/api/seed-master"];
  const isPublicRoute = publicRoutes.some(path =>
    nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
  );

  if (isPublicRoute) return;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  const role = req.auth?.user?.role as string

  // Rule 0: Global Viewer Blocking (Strict Read-Only for sensitive control panels)
  if (role === "VIEWER") {
    const adminRoutes = ["/settings", "/governance", "/treasury/payables"];
    if (adminRoutes.some(path => nextUrl.pathname.startsWith(path))) {
      console.warn(`[SECURITY_BLOCKED] VIEWER role attempted unauthorized access to ${nextUrl.pathname}`);
      return NextResponse.redirect(new URL("/restricted", nextUrl))
    }
  }

  // Rule 1: Settings & Governance (OWNER/ADMIN only)
  if (nextUrl.pathname.startsWith("/settings") || nextUrl.pathname.startsWith("/governance")) {
    if (role !== "OWNER" && role !== "ADMIN") {
      console.warn(`[SECURITY_BLOCKED] Role ${role} attempted access to ${nextUrl.pathname}`);
      return NextResponse.redirect(new URL("/restricted", nextUrl))
    }
  }

  // Rule 2: Treasury Payables (OWNER/MANAGER only)
  if (nextUrl.pathname.startsWith("/treasury/payables")) {
    if (role !== "OWNER" && role !== "MANAGER") {
      console.warn(`[SECURITY_BLOCKED] Role ${role} attempted access to ${nextUrl.pathname}`);
      return NextResponse.redirect(new URL("/restricted", nextUrl))
    }
  }

  return;
})

/**
 * EDGE FIREWALL (RATE LIMITER + CHALKING)
 */
export default async function proxy(req: NextRequest, event: any) {
  const { nextUrl } = req

  // Exemptions for static assets and internal auth APIs
  const isExempt = nextUrl.pathname.startsWith("/_next") ||
    nextUrl.pathname.includes("/favicon.ico") ||
    nextUrl.pathname.startsWith("/api/auth");

  if (!isExempt) {
    const ip = getClientIp(req)
    const now = Date.now()

    const timestamps = rateLimitMap.get(ip) || []
    const recentTimestamps = timestamps.filter(t => now - t < WINDOW_MS)

    if (recentTimestamps.length >= LIMIT) {
      console.warn(`[DOS_THROTTLED] IP: ${ip} exceeded threshold.`);
      return NextResponse.json(
        {
          error: "Too Many Requests",
          message: "Terminal access temporarily throttled. Protocol limit: 60req/min."
        },
        { status: 429 }
      )
    }

    recentTimestamps.push(now)
    rateLimitMap.set(ip, recentTimestamps)
  }

  // Proceed to RBAC/Auth logic
  return (rbacMiddleware as any)(req, event)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
