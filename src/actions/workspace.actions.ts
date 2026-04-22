'use server'

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * WORKSPACE ABSTRACTION ACTIONS (PHASE 4)
 * 
 * Manages the active tenant context via client-side cookies for non-destructive 
 * switching between organizational domain spaces.
 */

/**
 * SECURE SWITCHER: Validates membership before updating the active workspace.
 */
export async function switchActiveOrganization(organizationId: string) {
  const { auth } = await import("@/auth")
  const { prisma } = await import("@/lib/prisma")

  const session = await auth()
  if (!session?.user?.id) throw new Error("UNAUTHORIZED: Session invalid.")

  // 1. Validation Check: Guarantee user is a member of the target silo
  const isMember = await prisma.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organizationId: organizationId
    }
  })

  if (!isMember) {
    console.error(`[SECURITY_ALERT] Unauthorized workspace switch attempt by ${session.user.id} to ${organizationId}`)
    throw new Error("FORBIDDEN: You do not have clearance for this organizational silo.")
  }

  try {
    const cookieStore = await cookies()

    // 2. Set the cookie for 30 days
    cookieStore.set('active_workspace_id', organizationId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    // 3. Revalidate layout to propagate context shift
    revalidatePath('/', 'layout')
  } catch (error) {
    console.error('[WORKSPACE_SWITCH_FATAL]', error)
    return { success: false, error: 'Failed to synchronize workspace context.' }
  }

  redirect('/home')
}

export async function getActiveWorkspaceId() {
  const cookieStore = await cookies()
  return cookieStore.get('active_workspace_id')?.value || null
}

/**
 * SILO-AWARE FETCHER: Dynamically filters organizations based on junction membership.
 */
export async function getUserOrganizations() {
  const { auth } = await import("@/auth")
  const { prisma } = await import("@/lib/prisma")

  const session = await auth()
  if (!session?.user?.id) return []

  // Efficiently query organizations through the junction table filter
  const organizations = await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id
        }
      }
    },
    orderBy: { name: 'asc' }
  })

  return organizations.map(org => ({
    id: org.id,
    name: org.name
  }))
}
