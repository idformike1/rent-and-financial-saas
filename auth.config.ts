import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isSystemAdmin = (user as any).isSystemAdmin;
        token.organizationId = (user as any).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isSystemAdmin = token.isSystemAdmin;
        (session.user as any).organizationId = token.organizationId;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
