import { getSovereignClient } from "@/src/lib/db";
import { recordAuditLog } from "@/lib/audit-logger";
import { resolveTerminationSafety } from "@/src/core/algorithms/governance";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

  // Check for existing user
  const existingUser = await db.user.findUnique({
    where: { email: payload.email }
  });
  if (existingUser) throw new Error("ERR_IDENTITY_CONFLICT: User already exists.");

  const rawToken = crypto.randomBytes(32).toString('hex');
  // SECURE: Use SHA-256 (deterministic) for indexing while keeping rawToken for the user.
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  return await db.$transaction(async (tx: any) => {
    const invitation = await tx.invitation.create({
      data: {
        email: payload.email,
        token: hashedToken,
        role: payload.role || 'MANAGER',
        organizationId: context.organizationId,
        status: 'PENDING'
      }
    });

    await recordAuditLog({
      action: 'INVITE',
      entityType: 'INVITATION',
      entityId: invitation.id,
      metadata: { email: payload.email, role: payload.role },
      tx: tx as any
    });

    return { 
      id: invitation.id, 
      email: invitation.email, 
      rawToken 
    };
  });
}

/**
 * Consumes an invitation token and materializes the user account.
 */
export async function consumeInvitationService(
  payload: { token: string; passwordPlain: string }
) {
  const db = getSovereignClient("OP_SYSTEM_ONBOARDING");

  // 1. Identify invitation by hashed token
  const hashedToken = crypto.createHash('sha256').update(payload.token).digest('hex');
  const invitation = await db.invitation.findUnique({
    where: { token: hashedToken },
    include: { organization: true }
  });

  if (!invitation) {
    throw new Error("ERR_INVITATION_NOT_FOUND: The provided token is invalid.");
  }

  // 2. Validate state and expiry (24 hours)
  if (invitation.status !== 'PENDING') {
    throw new Error("ERR_INVITATION_EXPIRED: Token has already been consumed.");
  }

  const expiryLimit = 24 * 60 * 60 * 1000; // 24 Hours
  const isExpired = Date.now() - invitation.createdAt.getTime() > expiryLimit;
  if (isExpired) {
    throw new Error("ERR_INVITATION_EXPIRED: The invitation has expired.");
  }

  // 3. Materialize User and update Invitation status
  const passwordHash = await bcrypt.hash(payload.passwordPlain, 12);

  return await db.$transaction(async (tx: any) => {
    const user = await tx.user.create({
      data: {
        email: invitation.email,
        passwordHash: passwordHash,
        role: invitation.role,
        organizationId: invitation.organizationId,
        isActive: true,
        canEdit: true
      }
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' }
    });

    await recordAuditLog({
      action: 'CREATE',
      entityType: 'USER',
      entityId: user.id,
      metadata: { email: user.email, organizationId: user.organizationId },
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
    await tx.user.updateMany({
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
    const target = await tx.user.findFirst({ 
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

    const result = await tx.user.deleteMany({
      where: { id: userId, organizationId: context.organizationId }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: User not found or access denied.");

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
    await tx.user.updateMany({
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
    await tx.user.updateMany({
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

/**
 * Updates a user's safe profile attributes.
 * Prevents Mass Assignment by explicitly mapping safe fields only.
 */
export async function updateProfileService(
  userId: string,
  data: { firstName?: string; lastName?: string; name?: string; phone?: string | null },
  context: { operatorId: string; organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    // SECURITY: Explicit mapping. Do NOT use spread operators here.
    const result = await tx.user.updateMany({
      where: { id: userId, organizationId: context.organizationId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: data.name,
        phone: data.phone,
      }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: User not found or access denied.");

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'USER',
      entityId: userId,
      metadata: { attributes: Object.keys(data) },
      tx: tx as any
    });

    return { id: userId, ...data };
  });
}
