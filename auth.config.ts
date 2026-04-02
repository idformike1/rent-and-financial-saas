import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.organizationId = user.organizationId
        token.organizationName = user.organizationName
        token.isActive = user.isActive
        token.canEdit = user.canEdit
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.organizationId = token.organizationId
        session.user.organizationName = token.organizationName
        session.user.isActive = token.isActive
        session.user.canEdit = token.canEdit
      }
      return session
    }
  },
  providers: [], // Providers are added in auth.ts to avoid Edge Runtime issues
} satisfies NextAuthConfig
