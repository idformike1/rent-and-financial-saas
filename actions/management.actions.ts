'use server'

import { revalidatePath } from 'next/cache';
import { runSecureServerAction } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * MANAGEMENT DOMAIN ACTIONS (LIFECYCLE OPERATIONS)
 * 
 * Centralized control for user deactivation and organizational vaporization.
 * These actions require ROOT_ADMIN clearance.
 */

/**
 * USER STATUS TOGGLE PROTOCOL
 * Dynamically transitions a user identity between ACTIVE and SUSPENDED states.
 */
export async function toggleUserStatus(userId: string, currentStatus: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    // Strict Gate: Only System Admins can modify user status globally
    if (!session.isSystemAdmin) {
      throw new Error("ERR_AUTHORITY_ABSENT: Status mutation requires ROOT_ADMIN clearance.");
    }

    try {
      const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      
      await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: nextStatus }
      });

      revalidatePath('/admin');
      revalidatePath('/admin/tenants');
      return { success: true, message: `IDENTITY_${nextStatus}` };
    } catch (e: any) {
      console.error('[MANAGEMENT_STATUS_TOGGLE_FATAL]', e);
      return { success: false, error: e.message || "ERR_MANAGEMENT_FAILURE" };
    }
  });
}

/**
 * USER PURGE PROTOCOL (SOFT-DELETE)
 * Transitions a specific user identity into a deleted/archived state.
 */
export async function deleteUser(userId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    // Strict Gate: Only System Admins can purge users
    if (!session.isSystemAdmin) {
      throw new Error("ERR_AUTHORITY_ABSENT: User purge requires ROOT_ADMIN clearance.");
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          deletedAt: new Date(),
          accountStatus: "ARCHIVED"
        }
      });

      revalidatePath('/admin');
      revalidatePath('/admin/tenants');
      return { success: true, message: "USER_PURGED" };
    } catch (e: any) {
      console.error('[MANAGEMENT_USER_PURGE_FATAL]', e);
      return { success: false, error: e.message || "ERR_MANAGEMENT_FAILURE" };
    }
  });
}

/**
 * USER ROLE MUTATION PROTOCOL
 * Updates a user's RBAC role with a "Last Owner" safety gate.
 */
export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: No session found.");
  }

  // Fetch the live caller directly from the database to guarantee accurate permissions
  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isSystemAdmin: true }
  });

  // Authenticate against the actual database values (Schema: isSystemAdmin: Boolean, role: String)
  const isAuthorized = caller?.isSystemAdmin === true || caller?.role === 'ADMIN' || caller?.role === 'ROOT_ADMIN' || caller?.role === 'SUPERADMIN';

  if (!isAuthorized) {
    throw new Error(`ERR_AUTHORITY_ABSENT: Access denied. Your DB record shows role: '${caller?.role}', isSystemAdmin: '${caller?.isSystemAdmin}'. Clearance requires isSystemAdmin=true or ADMIN role.`);
  }

  try {
      // 2. Fetch Target Context
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true, role: true }
      });

      if (!targetUser || !targetUser.organizationId) {
        throw new Error("ERR_TARGET_LOST: Identity or Organization context missing.");
      }

      // 3. Last Owner Safety Gate
      // If we are demoting an OWNER to something else, check if they are the last one.
      if (targetUser.role === 'OWNER' && newRole !== 'OWNER') {
        // Count how many OTHER active owners exist in this organization
        const otherOwnersCount = await prisma.user.count({
          where: {
            organizationId: targetUser.organizationId,
            role: 'OWNER',
            deletedAt: null, // Ensure they aren't soft-deleted
            id: { not: userId } // EXCLUDE the user currently being demoted
          }
        });

        if (otherOwnersCount === 0) {
          return { 
            success: false, 
            error: "ERR_CONTINUITY_VIOLATION: Cannot demote the final Owner of an organization. Sovereignty must be maintained." 
          };
        }
      }

      // 4. Execution
      await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
      });

      revalidatePath('/admin/tenants');
      return { success: true };
    } catch (e: any) {
      console.error('[MANAGEMENT_ROLE_UPDATE_FATAL]', e);
      return { success: false, error: e.message || "ERR_MANAGEMENT_FAILURE" };
    }
  }

