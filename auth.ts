import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from '@/src/lib/prisma';
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth, unstable_update: update } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || "dev-secret-key-12345",
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;
        if (user.accountStatus !== "ACTIVE") return null;

        console.log("[FLOW MAP 1: AUTHORIZE] Prisma User Found:", { id: user.id, email: user.email, role: user.role });
        return {
          id: user.id,
          email: user.email,
          isSystemAdmin: user.isSystemAdmin ?? false,
          organizationId: user.organizationId ?? null,
          role: user.role ?? "USER",
          accountStatus: user.accountStatus ?? "ACTIVE",
          requiresPasswordChange: user.requiresPasswordChange ?? false,
        };
      },
    }),
  ],
});
