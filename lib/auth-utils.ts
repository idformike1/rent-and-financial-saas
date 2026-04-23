import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export type UserRole = 'OWNER' | 'MANAGER' | 'ADMIN' | 'VIEWER';

export interface SessionContext {
  userId: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  isSystemAdmin: boolean;
}

/**
 * SECURE: Retrieves the session from NextAuth.
 * UPDATED (PHASE 4): Now respects the 'active_workspace_id' cookie for workspace switching.
 */
export async function getCurrentSession(): Promise<SessionContext | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true, role: true, name: true, isSystemAdmin: true }
  });

  if (!dbUser) return null;

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get('active_workspace_id')?.value;

  let organizationId = dbUser.organizationId;
  let organizationName = ""; // We could fetch this too if needed

  if (organizationId) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true }
    });
    organizationName = org?.name || "";
  }

  // ── WORKSPACE ABSTRACTION OVERRIDE ───────────────────────────
  if (activeWorkspaceId && activeWorkspaceId !== organizationId) {
    try {
      const membership = await prisma.organizationMember.findUnique({
        where: { userId_organizationId: { userId: session.user.id as string, organizationId: activeWorkspaceId } },
        include: { organization: true }
      });

      if (membership) {
        organizationId = activeWorkspaceId;
        organizationName = membership.organization.name;
      }
    } catch (error) {
      console.error('[WORKSPACE_SYNC_ERROR] Failed to verify membership context.', error);
    }
  }

  return {
    userId: session.user.id as string,
    role: (dbUser.role || 'VIEWER') as UserRole,
    organizationId: organizationId || "",
    organizationName,
    isSystemAdmin: dbUser.isSystemAdmin || false,
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
  
  // ── AUTHENTICATION GATEKEEPER ─────────────────────────────
  if (!session) {
    const errorMsg = 'UNAUTHORIZED: No active session found. Operational sequence aborted.';
    if (isMutation) {
      return { success: false, message: errorMsg } as unknown as T;
    }
    throw new Error(errorMsg);
  }

  // ── MUTATION LOCK: READ-ONLY PROTOCOL ─────────────────────────
  if (isMutation && session.role === 'VIEWER') {
    const errorMsg = '[SECURITY_BLOCKED] Read-Only Access. Mutation protocols are restricted for this role.';
    console.error(errorMsg);
    return { success: false, message: errorMsg, error: errorMsg } as unknown as T;
  }

  // ── LIVE STATUS CHECK: DATABASE GATEKEEPER ─────────────────
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { isActive: true, role: true }
    });

    if (!dbUser || !dbUser.isActive) {
      const errorMsg = 'ERR_SESSION_REVOKED: Your clearance has been withdrawn. Access terminated.';
      console.error(`[SECURITY_CRITICAL] Session Revoked for User: ${session.userId}.`);
      if (isMutation) return { success: false, message: errorMsg } as unknown as T;
      throw new Error(errorMsg);
    }

    // Real-time role synchronization
    if (dbUser.role !== session.role) {
      console.warn(`[SECURITY_SYNC] Role shift detected for ${session.userId}: ${session.role} -> ${dbUser.role}`);
      session.role = dbUser.role as UserRole;
    }
  } catch (dbError: any) {
    if (dbError.message.startsWith('ERR_SESSION_REVOKED')) {
      if (isMutation) return { success: false, message: dbError.message } as unknown as T;
      throw dbError;
    }
    console.error('[SECURITY_FATAL] Database layer unreachable during session validation.', dbError);
    const fatalMsg = 'SECURITY_ERROR: Integrity check failed. Operational shutdown initiated.';
    if (isMutation) return { success: false, message: fatalMsg } as unknown as T;
    throw new Error(fatalMsg);
  }

  const isAuthorized = await verifyRole(requiredRole, session.role);
  if (!isAuthorized) {
    const forbiddenMsg = `FORBIDDEN: Requires ${requiredRole} access level. Current: ${session.role}`;
    if (isMutation) return { success: false, message: forbiddenMsg } as unknown as T;
    throw new Error(forbiddenMsg);
  }

  /**
   * SOVEREIGN AUTO-HEAL: ORPHANED IDENTITY RECOVERY
   */
  try {
    let orgExists = await prisma.organization.count({ where: { id: session.organizationId } });
    const isProduction = process.env.NODE_ENV === 'production';

    if (orgExists === 0) {
      // ── SYSTEM ADMIN EXEMPTION ────────────────────────────────
      if (session.isSystemAdmin && !session.organizationId) {
        return await action(session);
      }

      if (isProduction) {
        throw new Error(`SECURITY_ERROR: Access denied. Organization record missing.`);
      }
      
      console.warn(`[SECURITY_HEAL] Reconstructing missing Organization: ${session.organizationId}`);
      await prisma.organization.create({
        data: {
          id: session.organizationId,
          name: session.organizationName || "Recovered Entity",
        }
      });
    }

    // EXECUTE PROTECTED ACTION
    return await action(session);

  } catch (actionError: any) {
    console.error('[SECURE_ACTION_EXECUTION_FATAL]', actionError);
    if (isMutation) {
      return { 
        success: false, 
        message: actionError.message || "ERR_OPERATIONAL_FAILURE",
        error: actionError.message 
      } as unknown as T;
    }
    throw actionError;
  }
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
