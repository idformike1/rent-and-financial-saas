'use server'

import { revalidatePath } from "next/cache"
import { runSecureServerAction } from "@/lib/auth-utils"
import { 
  inviteTeamMemberService, 
  updateUserRoleService, 
  deleteUserService,
  toggleUserActivationService,
  toggleUserEditPermissionService
} from "@/src/services/mutations/team.services"
import { getTeamMembersService } from "@/src/services/queries/team.services"

/**
 * TEAM REGISTRY ACCESS (GATEKEEPER)
 */
export async function fetchTeamMembers() {
  return runSecureServerAction('OWNER', async (session) => {
    return await getTeamMembersService({
      operatorId: session.userId,
      organizationId: session.organizationId
    });
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

    await toggleUserActivationService(
      userId,
      isActive,
      {
        operatorId: session.userId,
        organizationId: session.organizationId
      }
    );
    
    revalidatePath('/settings/team');
  });
}

/**
 * PERMISSION GATEKEEPER
 */
export async function toggleUserEditPermission(userId: string, canEdit: boolean) {
  return runSecureServerAction('OWNER', async (session) => {
    await toggleUserEditPermissionService(
      userId,
      canEdit,
      {
        operatorId: session.userId,
        organizationId: session.organizationId
      }
    );
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
