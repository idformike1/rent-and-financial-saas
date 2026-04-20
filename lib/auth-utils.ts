import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type UserRole = 'OWNER' | 'MANAGER' | 'ADMIN' | 'VIEWER';

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
 * MANDATORY: Retrieves the active tenant session.
 * Used to enforce Tenant Boundaries at the edge of the data layer.
 */
export async function getTenantSession(): Promise<SessionContext> {
  const session = await getCurrentSession();
  
  if (!session || !session.organizationId) {
    throw new Error('UNAUTHORIZED_PROTOCOL: Secure tenant context required.');
  }

  return session;
}

/**
 * Verify if the active user role meets the required role hierarchy.
 */
export async function verifyRole(requiredRole: UserRole, currentRole: UserRole): Promise<boolean> {
  const roleHierarchy: Record<UserRole, number> = {
    'OWNER': 1,
    'MANAGER': 2,
    'ADMIN': 3,
    'VIEWER': 4
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
  action: (session: SessionContext) => Promise<T>,
  isMutation: boolean = true
): Promise<T> {
  const session = await getCurrentSession();
  
  if (!session) {
    throw new Error('UNAUTHORIZED: No active session found.');
  }

  // ── MUTATION LOCK: READ-ONLY PROTOCOL ─────────────────────────
  if (isMutation && session.role === 'VIEWER') {
    console.error(`[SECURITY_BLOCKED] VIEWER role attempted mutation in runSecureServerAction.`);
    throw new Error('UNAUTHORIZED: Read-Only Access. Mutation protocols are restricted for this role.');
  }

  // ── LIVE STATUS CHECK: DATABASE GATEKEEPER ─────────────────
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isActive: true, role: true }
    });

    if (!dbUser || !dbUser.isActive) {
      console.error(`[SECURITY_CRITICAL] Session Revoked for User: ${session.userId}. Operation Aborted.`);
      throw new Error('ERR_SESSION_REVOKED: Your clearance has been withdrawn. Access terminated.');
    }

    // Real-time role synchronization
    if (dbUser.role !== session.role) {
      console.warn(`[SECURITY_SYNC] Role shift detected for ${session.userId}: ${session.role} -> ${dbUser.role}`);
      session.role = dbUser.role as UserRole;
    }
  } catch (dbError: any) {
    if (dbError.message.startsWith('ERR_SESSION_REVOKED')) throw dbError;
    console.error('[SECURITY_FATAL] Database layer unreachable during session validation. Failing closed.', dbError);
    throw new Error('SECURITY_ERROR: Integrity check failed. Operational shutdown initiated.');
  }

  const isAuthorized = await verifyRole(requiredRole, session.role);
  if (!isAuthorized) {
    throw new Error(`FORBIDDEN: Requires ${requiredRole} access level.`);
  }

  /**
   * SOVEREIGN AUTO-HEAL: ORPHANED IDENTITY RECOVERY
   */
  let orgExists = await prisma.organization.count({ where: { id: session.organizationId } });
  const isProduction = process.env.NODE_ENV === 'production';

  if (orgExists === 0) {
    if (isProduction) {
      console.error(`[SECURITY_FATAL] Production Organization Missing: ${session.organizationId}`);
      throw new Error(`SECURITY_ERROR: Access denied. Organization record not found.`);
    }
    
    console.warn(`[SECURITY_HEAL] Reconstructing missing Organization: ${session.organizationId}`);
    await prisma.organization.create({
      data: {
        id: session.organizationId,
        name: session.organizationName || "Recovered Entity",
      }
    });
  }

  return action(session);
}

/**
 * IDEMPOTENT MUTATION WRAPPER
 * 
 * Prevents double-execution of high-value mutations using a client-provided key.
 */
export async function runIdempotentAction<T>(
  key: string,
  requiredRole: UserRole,
  action: (session: SessionContext) => Promise<T>
): Promise<T> {
  return runSecureServerAction(requiredRole, async (session) => {
    if (!key || key.length < 8) {
      throw new Error("ERR_PROTOCOL_VIOLATION: Valid idempotencyKey required.");
    }

    // 1. Check for existing record
    const existing = await prisma.idempotencyRecord.findUnique({
      where: { key, organizationId: session.organizationId }
    });

    if (existing) {
      console.log(`[IDEMPOTENCY_HIT] Key detected: ${key}. Returning cached response.`);
      return existing.result as T;
    }

    // 2. Execute Action
    const result = await action(session);

    // 3. Cache Result (Non-blocking or atomic if possible, here we ensure it's saved)
    await prisma.idempotencyRecord.create({
      data: {
        key,
        organizationId: session.organizationId,
        result: result as any
      }
    });

    return result;
  });
}
