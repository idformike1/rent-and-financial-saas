import { getSovereignClient } from "@/src/lib/db";
import { recordAuditLog } from "@/lib/audit-logger";
import { resolveTerminationSafety } from "@/src/core/algorithms/governance";
import bcrypt from "bcryptjs";

/**
 * TEAM SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates RBAC, user materialization, and termination protocols 
 * with strict gravity guards.
 * 
 * Mandate:
 * 1. Governance Enforcement (Termination Guard).
 * 2. Non-repudiation (Surveillance Audit).
 * 3. Atomic Multi-Step Transactions.
 */

/**
 * Materializes a new team member with a non-repudiable invitation trace.
 */
export async function inviteTeamMemberService(
  payload: { email: string, name: string, role?: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  const existing = await db.user.findUnique({
    where: { email: payload.email }
  });

  if (existing) throw new Error("ERR_IDENTITY_CONFLICT: Email already registered in the system.");

  const defaultPassword = "password123"; 
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  return await db.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        passwordHash,
        role: payload.role || 'MANAGER',
        organizationId: context.organizationId,
        isActive: true,
        canEdit: true,
      }
    });

    await recordAuditLog({
      action: 'INVITE',
      entityType: 'USER',
      entityId: user.id,
      metadata: { email: payload.email },
      tx: tx as any
    });

    return user;
  });
}

/**
 * Updates a user's role with Sovereign gravity enforcement.
 */
export async function updateUserRoleService(
  userId: string,
  newRole: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  if (userId === context.operatorId && newRole !== 'OWNER') {
    throw new Error("ERR_GRAVITY_VIOLATION: Self-demotion protocol blocked.");
  }

  return await db.$transaction(async (tx: any) => {
    await tx.user.update({
      where: { id: userId, organizationId: context.organizationId },
      data: { role: newRole }
    });

    await recordAuditLog({
      action: 'ROLE_CHANGE',
      entityType: 'USER',
      entityId: userId,
      metadata: { newRole },
      tx: tx as any
    });
  });
}

/**
 * Executes a definitive account termination if safe.
 */
export async function deleteUserService(
  userId: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const target = await tx.user.findUnique({ 
      where: { id: userId, organizationId: context.organizationId } 
    });
    
    if (!target) throw new Error("ERR_IDENTITY_ABSENT");

    const auditCount = await tx.auditLog.count({ where: { userId: userId } });
    const ownersCount = await tx.user.count({ 
      where: { organizationId: context.organizationId, role: 'OWNER' } 
    });

    // Algorithm Delegation: Termination Safety Guard
    const safety = resolveTerminationSafety(
      userId,
      context.operatorId,
      auditCount,
      target.role,
      ownersCount <= 1
    );

    if (!safety.safe) throw new Error(`ERR_TERMINATION_PROTOCOL_BLOCKED: ${safety.reason}`);

    await tx.user.delete({
      where: { id: userId }
    });

    await recordAuditLog({
      action: 'DELETE',
      entityType: 'USER',
      entityId: userId,
      tx: tx as any
    });
  });
}

/**
 * Toggles a user's account activation status with audit trail.
 */
export async function toggleUserActivationService(
  userId: string,
  isActive: boolean,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    await tx.user.update({
      where: { id: userId, organizationId: context.organizationId },
      data: { isActive }
    });

    await recordAuditLog({
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entityType: 'USER',
      entityId: userId,
      tx: tx as any
    });
  });
}

/**
 * Toggles a user's destructive editing permissions.
 */
export async function toggleUserEditPermissionService(
  userId: string,
  canEdit: boolean,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    await tx.user.update({
      where: { id: userId, organizationId: context.organizationId },
      data: { canEdit }
    });

    await recordAuditLog({
      action: canEdit ? 'GRANT_EDIT' : 'REVOKE_EDIT',
      entityType: 'USER',
      entityId: userId,
      tx: tx as any
    });
  });
}
