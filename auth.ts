import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    async jwt({ token, user, trigger, session }) {
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
      if (token?.id) {
        // ── LIVE CLEARANCE CHECK: NEUTRALIZING GHOST SESSIONS ───────
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isActive: true, role: true }
          });

          if (!dbUser || !dbUser.isActive) {
            console.warn(`[SECURITY_REVOCATION] Active session found for suspended user: ${token.id}`);
            return { ...session, user: { ...session.user, role: 'SUSPENDED', isActive: false } as any };
          }

          // Sync role in case of real-time promotion/demotion
          session.user.role = dbUser.role;
          session.user.isActive = dbUser.isActive;
        } catch (error) {
          console.error('[AUTH_DB_ERROR] Failed to verify session status. Failing closed.', error);
          session.user.isActive = false;
        }

        session.user.id = token.id as string
        session.user.organizationId = token.organizationId as string
        session.user.organizationName = token.organizationName as string
        session.user.canEdit = token.canEdit as boolean
      }
      return session
    }
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { organization: true }
        })

        if (!user || !user.passwordHash) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: user.organization.name,
          isActive: user.isActive,
          canEdit: user.canEdit,
        }
      }
    })
  ],
})
