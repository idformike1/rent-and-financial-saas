import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role: string
    isSystemAdmin: boolean
    organizationId: string | null
    requiresPasswordChange: boolean
    originalAdminId?: string | null
    isImpersonating?: boolean
  }

  interface Session {
    user: User & DefaultSession["user"]
    impersonate?: {
      id: string
      organizationId: string | null
      role: string
    }
    revert?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    isSystemAdmin: boolean
    organizationId: string | null
    requiresPasswordChange: boolean
    originalAdminId?: string | null
    isImpersonating?: boolean
  }
}
