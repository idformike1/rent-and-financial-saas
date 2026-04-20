'use server'

import { revalidatePath } from "next/cache"
import { runSecureServerAction } from "@/lib/auth-utils"
import { 
  inviteTeamMemberService, 
  updateUserRoleService, 
  deleteUserService,
  toggleUserActivationService,
  toggleUserEditPermissionService,
  consumeInvitationService,
  updateProfileService
} from "@/src/services/mutations/team.services"
import { getTeamMembersService } from "@/src/services/queries/team.services"
import { UpdateProfileSchema } from "@/src/lib/validations/user.schema"

/**
 * TEAM REGISTRY ACCESS (GATEKEEPER)
 */
export async function fetchTeamMembers() {
  return runSecureServerAction('VIEWER', async (session) => {
    return await getTeamMembersService({
      operatorId: session.userId,
      organizationId: session.organizationId
    });
  }, false);
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
export async function inviteMember(email: string, name: string, role: string = 'MANAGER') {
  return runSecureServerAction('OWNER', async (session) => {
    try {
      const nameString = name || "";
      const nameParts = nameString.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      const result = await inviteTeamMemberService(
        { email, name, role, firstName, lastName },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath('/settings/team');
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const inviteUrl = `${baseUrl}/onboarding?token=${result.rawToken}`;

      return { success: true, inviteUrl, email: result.email };
    } catch (e: any) {
      console.error('[TEAM_INVITATION_FATAL]', e);
      throw e;
    }
  });
}

/**
 * PUBLIC: Consume invitation and create account
 */
export async function consumeInvitation(token: string, passwordPlain: string) {
  try {
    await consumeInvitationService({ token, passwordPlain });
    return { success: true };
  } catch (e: any) {
    console.error('[ONBOARDING_CONSUMPTION_FATAL]', e);
    return { success: false, error: e.message || "Failed to consume invitation." };
  }
}

/**
 * PROFILE HARDENING: Update current user profile
 */
export async function updateProfile(data: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // 1. Validate incoming data against strict Zod schema (Anti-Mass Assignment)
      const parsedData = UpdateProfileSchema.parse(data);

      // 2. Execute update via service layer
      await updateProfileService(
        session.userId,
        parsedData,
        {
          operatorId: session.userId,
          organizationId: session.organizationId
        }
      );

      revalidatePath('/home');
      return { success: true };
    } catch (e: any) {
      console.error('[PROFILE_UPDATE_FATAL]', e);
      return { success: false, error: e.message || "Failed to update profile." };
    }
  });
}
