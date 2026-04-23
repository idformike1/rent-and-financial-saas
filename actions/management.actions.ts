'use server'

import { revalidatePath } from 'next/cache';
import { runSecureServerAction } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

/**
 * MANAGEMENT DOMAIN ACTIONS (LIFECYCLE OPERATIONS)
 * 
 * Centralized control for user deactivation and organizational vaporization.
 * These actions require ROOT_ADMIN clearance.
 */

/**
 * USER DEACTIVATION PROTOCOL
 * Transitions a user identity into a suspended state.
 */
export async function deactivateUser(userId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    // Strict Gate: Only System Admins can deactivate users globally
    if (!session.isSystemAdmin) {
      throw new Error("ERR_AUTHORITY_ABSENT: Deactivation requires ROOT_ADMIN clearance.");
    }

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { accountStatus: "DEACTIVATED" }
      });

      revalidatePath('/admin');
      return { success: true, message: "IDENTITY_SUSPENDED" };
    } catch (e: any) {
      console.error('[MANAGEMENT_DEACTIVATE_FATAL]', e);
      return { success: false, error: e.message || "ERR_MANAGEMENT_FAILURE" };
    }
  });
}

/**
 * ORGANIZATIONAL VAPORIZATION PROTOCOL
 * Permanently removes an organization and its associated administrative structures.
 * WARNING: This is a destructive operation.
 */
export async function deleteOrganization(orgId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    // Strict Gate: Only System Admins can vaporize organizations
    if (!session.isSystemAdmin) {
      throw new Error("ERR_AUTHORITY_ABSENT: Vaporization requires ROOT_ADMIN clearance.");
    }

    try {
      // We use a transaction to ensure atomic cleanup if cascade is not fully enforced at the DB level
      await prisma.$transaction(async (tx) => {
        // 1. Transition users to ARCHIVED state with soft delete
        await tx.user.updateMany({
          where: { organizationId: orgId },
          data: { 
            accountStatus: "ARCHIVED",
            deletedAt: new Date()
          }
        });

        // 2. Execute organizational soft delete
        await tx.organization.update({
          where: { id: orgId },
          data: { deletedAt: new Date() }
        });
      });

      revalidatePath('/admin');
      return { success: true, message: "ENTITY_VAPORIZED" };
    } catch (e: any) {
      console.error('[MANAGEMENT_VAPORIZE_FATAL]', e);
      return { success: false, error: e.message || "ERR_MANAGEMENT_FAILURE" };
    }
  });
}
