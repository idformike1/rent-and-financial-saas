import { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string
    role: string
    organizationId: string
    organizationName: string
    isActive: boolean
    canEdit: boolean
  }

  interface Session {
    user: User & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    organizationId: string
    organizationName: string
    isActive: boolean
    canEdit: boolean
  }
}
