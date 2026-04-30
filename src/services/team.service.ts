import { getSovereignClient } from "@/src/lib/db";
import { recordAuditLog } from "@/lib/audit-logger";
import { resolveTerminationSafety } from "@/src/core/algorithms/governance";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * SOVEREIGN OS DATA ENGINE: TEAM SERVICE
 * 
 * Centralized data access layer for all team, membership, and invitation operations.
 */
export const teamService = {
  /**
   * Retrieves all members associated with the organization.
   */
  async getTeamMembers(organizationId: string) {
    const db = getSovereignClient(organizationId);

    const members = await db.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        canEdit: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    const stats = {
      total: members.length,
      active: members.filter((m: any) => m.isActive).length,
      viewOnly: members.filter((m: any) => !m.canEdit).length
    };

    return { members, stats };
  },

  /**
   * Materializes a new team member invitation.
   */
  async inviteMember(
    payload: { email: string, name: string, role?: string, firstName?: string, lastName?: string },
    organizationId: string
  ) {
    const db = getSovereignClient(organizationId);

    const existingUser = await db.user.findUnique({ where: { email: payload.email } });
    if (existingUser) throw new Error("ERR_IDENTITY_CONFLICT: User already exists.");

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    return await db.$transaction(async (tx: any) => {
      const invitation = await tx.invitation.create({
        data: {
          email: payload.email,
          token: hashedToken,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role || 'MANAGER',
          organizationId: organizationId,
          status: 'PENDING'
        }
      });

      await recordAuditLog({
        action: 'INVITE', entityType: 'INVITATION', entityId: invitation.id,
        metadata: { email: payload.email, role: payload.role }, tx: tx as any
      });

      return { id: invitation.id, email: invitation.email, rawToken };
    });
  },

  /**
   * Consumes an invitation token and materializes the user account.
   */
  async consumeInvitation(payload: { token: string; passwordPlain: string }) {
    const db = getSovereignClient("OP_SYSTEM_ONBOARDING");

    const hashedToken = crypto.createHash('sha256').update(payload.token).digest('hex');
    const invitation = await db.invitation.findUnique({
      where: { token: hashedToken },
      include: { organization: true }
    });

    if (!invitation) throw new Error("ERR_INVITATION_NOT_FOUND");
    if (invitation.status !== 'PENDING') throw new Error("ERR_INVITATION_EXPIRED");

    const expiryLimit = 24 * 60 * 60 * 1000;
    if (Date.now() - invitation.createdAt.getTime() > expiryLimit) throw new Error("ERR_INVITATION_EXPIRED");

    const passwordHash = await bcrypt.hash(payload.passwordPlain, 12);

    return await db.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          passwordHash: passwordHash,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
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
        action: 'CREATE', entityType: 'USER', entityId: user.id,
        metadata: { email: user.email, organizationId: user.organizationId }, tx: tx as any
      });

      return user;
    });
  },

  /**
   * Updates a user's role.
   */
  async updateUserRole(userId: string, newRole: string, organizationId: string, operatorId: string) {
    const db = getSovereignClient(organizationId);

    if (userId === operatorId && newRole !== 'OWNER') {
      throw new Error("ERR_GRAVITY_VIOLATION: Self-demotion protocol blocked.");
    }

    return await db.$transaction(async (tx: any) => {
      await tx.user.updateMany({
        where: { id: userId, organizationId },
        data: { role: newRole }
      });

      await recordAuditLog({
        action: 'ROLE_CHANGE', entityType: 'USER', entityId: userId,
        metadata: { newRole }, tx: tx as any
      });
    });
  },

  /**
   * Executes a definitive account termination.
   */
  async deleteUser(userId: string, organizationId: string, operatorId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      const target = await tx.user.findFirst({ where: { id: userId, organizationId } });
      if (!target) throw new Error("ERR_IDENTITY_ABSENT");

      const auditCount = await tx.auditLog.count({ where: { userId: userId } });
      const ownersCount = await tx.user.count({ where: { organizationId, role: 'OWNER' } });

      const safety = resolveTerminationSafety(userId, operatorId, auditCount, target.role, ownersCount <= 1);
      if (!safety.safe) throw new Error(`ERR_TERMINATION_PROTOCOL_BLOCKED: ${safety.reason}`);

      const result = await tx.user.deleteMany({ where: { id: userId, organizationId } });
      if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT");

      await recordAuditLog({ action: 'DELETE', entityType: 'USER', entityId: userId, tx: tx as any });
    });
  },

  /**
   * Toggles activation.
   */
  async toggleActivation(userId: string, isActive: boolean, organizationId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      await tx.user.updateMany({ where: { id: userId, organizationId }, data: { isActive } });
      await recordAuditLog({ action: isActive ? 'ACTIVATE' : 'DEACTIVATE', entityType: 'USER', entityId: userId, tx: tx as any });
    });
  },

  /**
   * Toggles edit permissions.
   */
  async toggleEditPermission(userId: string, canEdit: boolean, organizationId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      await tx.user.updateMany({ where: { id: userId, organizationId }, data: { canEdit } });
      await recordAuditLog({ action: canEdit ? 'GRANT_EDIT' : 'REVOKE_EDIT', entityType: 'USER', entityId: userId, tx: tx as any });
    });
  },

  /**
   * Updates profile attributes.
   */
  async updateProfile(userId: string, data: { firstName?: string; lastName?: string; name?: string; phone?: string | null }, organizationId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      const result = await tx.user.updateMany({
        where: { id: userId, organizationId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          name: data.name,
          phone: data.phone,
        }
      });

      if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT");

      await recordAuditLog({
        action: 'UPDATE', entityType: 'USER', entityId: userId,
        metadata: { attributes: Object.keys(data) }, tx: tx as any
      });

      return { id: userId, ...data };
    });
  }
};
