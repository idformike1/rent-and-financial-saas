import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log("[FLOW MAP 2: JWT FORGE] Incoming User Object:", user);
      if (user) {
        token.id = user.id;
        token.isSystemAdmin = (user as any).isSystemAdmin;
        token.organizationId = (user as any).organizationId;
        token.role = (user as any).role;
        token.accountStatus = (user as any).accountStatus;
        token.requiresPasswordChange = (user as any).requiresPasswordChange;
      }

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

      console.log("[FLOW MAP 3: JWT FORGE] Outgoing Token:", token);
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
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
