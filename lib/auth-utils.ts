import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type UserRole = 'OWNER' | 'MANAGER' | 'ADMIN';

export interface SessionContext {
  userId: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
}

/**
 * SECURE: Retrieves the session from NextAuth.
 */
export async function getCurrentSession(): Promise<SessionContext | null> {
  const session = await auth();
  
  if (!session?.user) return null;

  return {
    userId: session.user.id as string,
    role: session.user.role as UserRole,
    organizationId: session.user.organizationId as string,
    organizationName: session.user.organizationName as string,
  };
}

/**
 * Verify if the active user role meets the required role hierarchy.
 */
export async function verifyRole(requiredRole: UserRole, currentRole: UserRole): Promise<boolean> {
  const roleHierarchy: Record<UserRole, number> = {
    'OWNER': 1,
    'MANAGER': 2,
    'ADMIN': 3
  };
  
  return roleHierarchy[currentRole] <= roleHierarchy[requiredRole];
}

/**
 * Server Action wrapper protecting database mutations
 * 
 * CRITICAL WARNING: To ensure complete SaaS tenant isolation, 
 * ALL future database queries within these actions MUST append 
 * `where: { organizationId: session.organizationId }`.
 */
export async function runSecureServerAction<T>(
  requiredRole: UserRole, 
  action: (session: SessionContext) => Promise<T>
): Promise<T> {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('UNAUTHORIZED: No active session found.');
  }

  const isAuthorized = await verifyRole(requiredRole, session.role);
  if (!isAuthorized) {
    throw new Error(`FORBIDDEN: Requires ${requiredRole} access level.`);
  }

  /**
   * SOVEREIGN AUTO-HEAL: ORPHANED IDENTITY RECOVERY
   * Verify that the organizationId AND userId from the session actually exist in the persistence layer.
   * If missing (e.g., after a DB re-seed), we automatically RECONSTRUCT them to preserve the session.
   */
  let [orgExists, userExists] = await Promise.all([
    prisma.organization.count({ where: { id: session.organizationId } }),
    prisma.user.count({ where: { id: session.userId } })
  ]);

  if (orgExists === 0) {
    console.warn(`[SECURITY_HEAL] Reconstructing missing Organization: ${session.organizationId}`);
    await prisma.organization.create({
      data: {
        id: session.organizationId,
        name: session.organizationName || "Recovered Entity",
      }
    });
    orgExists = 1;
  }

  if (userExists === 0) {
    console.warn(`[SECURITY_HEAL] Reconstructing missing User: ${session.userId}`);
    await prisma.user.create({
      data: {
        id: session.userId,
        email: session.userId + "@auto-heal.axiom", // Surrogate email
        passwordHash: "PH_VOID", // System-locked
        name: session.userId.slice(0, 8),
        role: session.role,
        organizationId: session.organizationId
      }
    });
    userExists = 1;
  }

  return action(session);
}
