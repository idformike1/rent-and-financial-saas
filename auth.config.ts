import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Initial Identity Ingestion
      if (user) {
        token.id = user.id;
        token.isSystemAdmin = (user as any).isSystemAdmin;
        token.organizationId = (user as any).organizationId;
        token.role = (user as any).role;
        token.accountStatus = (user as any).accountStatus;
        token.requiresPasswordChange = (user as any).requiresPasswordChange;
      }

      // 2. Multi-Silo Entitlement Injection
      // NOTE: Prisma lookups removed to maintain Edge Compatibility in middleware.
      // Entitlements are now validated at the service layer during data fetch.
      token.canAccessRent = true;
      token.canAccessWealth = true;

      // 3. Dynamic Context Update (Impersonation/Switching)
      if (trigger === "update" && session) {
        if (session.impersonate) {
          token.originalAdminId = token.id;
          token.isImpersonating = true;
          token.id = session.impersonate.id;
          token.organizationId = session.impersonate.organizationId;
          token.role = session.impersonate.role;
        } else if (session.revert) {
          token.id = token.originalAdminId;
          token.isImpersonating = false;
          token.originalAdminId = null;
          token.organizationId = null;
          token.role = "SYSTEM_ADMIN";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).isSystemAdmin = token.isSystemAdmin;
        (session.user as any).organizationId = token.organizationId;
        (session.user as any).role = token.role;
        (session.user as any).accountStatus = token.accountStatus;
        (session.user as any).requiresPasswordChange = token.requiresPasswordChange;
        (session.user as any).originalAdminId = token.originalAdminId;
        (session.user as any).isImpersonating = token.isImpersonating;
        (session.user as any).canAccessRent = token.canAccessRent;
        (session.user as any).canAccessWealth = token.canAccessWealth;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
