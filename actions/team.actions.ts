'use server'

import { revalidatePath } from "next/cache"
import { runSecureServerAction } from "@/lib/auth-utils"
import { 
  inviteTeamMemberService, 
  updateUserRoleService, 
  deleteUserService 
} from "@/src/services/mutations/team.services"
import prisma from "@/lib/prisma"
import { recordAuditLog } from "@/lib/audit-logger"

/**
 * TEAM REGISTRY ACCESS
 */
export async function fetchTeamMembers() {
  return runSecureServerAction('OWNER', async (session) => {
    const members = await prisma.user.findMany({
      where: { organizationId: session.organizationId },
      select: {
        id: true,
        name: true,
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
  });
}

/**
 * ROLE ESCALATION GATEKEEPER
 */
export async function updateUserRole(userId: string, newRole: string) {
  return runSecureServerAction('OWNER', async (session) => {
    try {
      await updateUserRoleService(
        userId,
        newRole,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );
      revalidatePath('/settings/team');
    } catch (e: any) {
      console.error('[TEAM_ROLE_UPDATE_FATAL]', e);
      throw e;
    }
  });
}

/**
 * USER ACTIVATION GATEKEEPER
 */
export async function toggleUserActivation(userId: string, isActive: boolean) {
  return runSecureServerAction('OWNER', async (session) => {
    if (userId === session.userId) {
      throw new Error("ERR_GRAVITY_VIOLATION: Self-deactivation protocol blocked.");
    }

    await prisma.user.update({
      where: { id: userId, organizationId: session.organizationId },
      data: { isActive }
    });

    await recordAuditLog({
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entityType: 'USER',
      entityId: userId
    });
    
    revalidatePath('/settings/team');
  });
}

/**
 * PERMISSION GATEKEEPER
 */
export async function toggleUserEditPermission(userId: string, canEdit: boolean) {
  return runSecureServerAction('OWNER', async (session) => {
    await prisma.user.update({
      where: { id: userId, organizationId: session.organizationId },
      data: { canEdit }
    });
    revalidatePath('/settings/team');
  });
}

/**
 * TERMINATION GATEKEEPER
 */
export async function deleteUserForever(userId: string) {
  return runSecureServerAction('OWNER', async (session) => {
    try {
      await deleteUserService(
        userId,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );
      revalidatePath('/settings/team');
    } catch (e: any) {
      console.error('[TEAM_TERMINATION_FATAL]', e);
      throw e;
    }
  });
}

/**
 * INVITATION GATEKEEPER
 */
export async function inviteMember(email: string, name: string) {
  return runSecureServerAction('OWNER', async (session) => {
    try {
      const newUser = await inviteTeamMemberService(
        { email, name },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath('/settings/team');
      return { success: true, user: newUser };
    } catch (e: any) {
      console.error('[TEAM_INVITATION_FATAL]', e);
      throw e;
    }
  });
}
