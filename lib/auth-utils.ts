import { auth } from "@/auth";
import prisma from "@/lib/prisma";

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
   * CRITICAL SECURITY CHECK: ORPHANED IDENTITY PREVENTION
   * Verify that the organizationId from the session actually exists in the persistence layer.
   * Prevents Foreign Key violations (P2003) on stale or hijacked UUIDs.
   */
  const orgExists = await prisma.organization.count({
    where: { id: session.organizationId }
  });

  if (orgExists === 0) {
    // RETURN structured error instead of throwing to prevent Next.js 500 crash
    return { 
      success: false, 
      errorCode: 'ORPHANED_SESSION', 
      message: 'SECURITY ALERT: Organization identity void. Please trigger re-authentication.' 
    } as any;
  }

  return action(session);
}
