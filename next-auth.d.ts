import { DefaultSession } from "next-auth"
import { JWT as NextAuthJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      organizationId: string
      organizationName: string
    } & DefaultSession["user"]
  }

  interface User {
    role: string
    organizationId: string
    organizationName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id: string
    role: string
    organizationId: string
    organizationName: string
  }
}
