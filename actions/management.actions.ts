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

/**
 * ORTHOGONAL ENTITLEMENT MUTATION PROTOCOL
 * Updates functional module access flags (RENT/WEALTH) for a specific junction record.
 */
export async function updateUserEntitlements(
  userId: string, 
  organizationId: string, 
  entitlements: { canAccessRent?: boolean, canAccessWealth?: boolean }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized: No session found.");

  // Fetch the live caller for security verification
  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSystemAdmin: true }
  });

  if (!caller?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Entitlement mutation requires ROOT_ADMIN clearance.");
  }

  try {
    await prisma.organizationMember.update({
      where: {
        userId_organizationId: { userId, organizationId }
      },
      data: entitlements
    });

    revalidatePath('/admin/tenants');
    return { success: true };
  } catch (e: any) {
    console.error('[MANAGEMENT_ENTITLEMENT_UPDATE_FATAL]', e);
    return { success: false, error: e.message || "ERR_MANAGEMENT_FAILURE" };
  }
}

/**
 * VAULT LOCKDOWN PROTOCOL
 * Instantly suspends or restores access to an entire organization.
 */
export async function toggleOrganizationLockdown(organizationId: string, suspend: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized: No session found.");

  // Security Gate: Root clearance required
  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSystemAdmin: true }
  });

  if (!caller?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Vault lockdown requires ROOT_ADMIN clearance.");
  }

  try {
    const organization = await prisma.organization.update({
      where: { id: organizationId },
      data: { isSuspended: suspend },
      select: { name: true }
    });

    // Create a permanent audit record of this administrative mutation
    await prisma.auditLog.create({
      data: {
        action: suspend ? 'ORGANIZATION_LOCKDOWN' : 'ORGANIZATION_RELEASE',
        entityType: 'ORGANIZATION',
        entityId: organizationId,
        targetName: organization.name,
        user: { connect: { id: session.user.id } },
        organization: { connect: { id: organizationId } },
      }
    });

    // Purge all layout caches to enforce the firewall instantly
    revalidatePath('/', 'layout');
    return { success: true };
  } catch (e: any) {
    console.error('[MANAGEMENT_LOCKDOWN_FATAL]', e);
    return { success: false, error: e.message || "ERR_LOCKDOWN_FAILURE" };
  }
}

/**
 * VAULT MATERIALIZATION PROTOCOL
 * Executes an atomic multi-table transaction to provision a new organizational vault.
 */
export async function provisionVault(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized: No session found.");

  // Security Gate: Root clearance required
  const caller = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isSystemAdmin: true }
  });

  if (!caller?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Provisioning requires ROOT_ADMIN clearance.");
  }

  try {
    const vaultName = formData.get('vaultName') as string;
    const firstName = formData.get('ownerFirstName') as string;
    const lastName = formData.get('ownerLastName') as string;
    const email = formData.get('ownerEmail') as string;

    if (!vaultName || !firstName || !lastName || !email) {
      return { success: false, error: "ERR_INPUT_INCOMPLETE: All fields are required." };
    }

    // Generate secure temporary credentials
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4);
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Materialize Organization
      const org = await tx.organization.create({
        data: { name: vaultName }
      });

      // 2. Materialize Owner Identity
      const user = await tx.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash: hashedPassword,
          role: "OWNER",
          organizationId: org.id,
          accountStatus: "ACTIVE",
          requiresPasswordChange: true
        }
      });

      // 3. Materialize Entitlements (Junction Table)
      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "OWNER",
          status: "ACTIVE",
          canAccessRent: true,
          canAccessWealth: true
        }
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          action: "VAULT_PROVISIONED",
          entityType: "ORGANIZATION",
          entityId: org.id,
          targetName: org.name,
          user: { connect: { id: session.user.id } },
          organization: { connect: { id: org.id } }
        }
      });

      return { org, user, tempPassword };
    });

    revalidatePath('/', 'layout');
    revalidatePath('/admin/tenants');
    
    return { 
      success: true, 
      vaultName: result.org.name,
      ownerEmail: result.user.email,
      tempPassword: result.tempPassword 
    };
  } catch (error: any) {
    console.error('[MANAGEMENT_PROVISION_FATAL]', error);
    if (error.code === 'P2002') return { success: false, error: "ERR_IDENTITY_CONFLICT: Email already exists." };
    return { success: false, error: error.message || "ERR_PROVISION_FAILURE" };
  }
}

/**
 * CONFIGURATION REGISTRY PROTOCOL
 * Fetches organization-wide settings or returns system defaults if uninitialized.
 */
export async function getSystemSettings() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const settings = await prisma.systemSettings.findUnique({
        where: { organizationId: session.organizationId }
      });

      if (!settings) {
        // Return protocol defaults if the vault hasn't been initialized
        return {
          electricTariff: 0.15,
          waterTariff: 0.05,
          lateFeePercentage: 5.0,
          gracePeriodDays: 5
        };
      }

      return {
        electricTariff: Number(settings.electricTariff),
        waterTariff: Number(settings.waterTariff),
        lateFeePercentage: Number(settings.lateFeePercentage),
        gracePeriodDays: settings.gracePeriodDays
      };
    } catch (error: any) {
      console.error('[SETTINGS_FETCH_FATAL]', error);
      throw new Error("ERR_REGISTRY_FAILURE: Unable to fetch configuration.");
    }
  });
}

/**
 * CONFIGURATION MUTATION PROTOCOL
 * Updates the organizational settings vault via an atomic upsert.
 */
export async function updateSystemSettings(payload: { 
  electricTariff: number, 
  waterTariff: number, 
  lateFeePercentage: number, 
  gracePeriodDays: number 
}) {
  return runSecureServerAction('ADMIN', async (session) => {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Atomic Upsert
        const settings = await tx.systemSettings.upsert({
          where: { organizationId: session.organizationId },
          update: {
            electricTariff: payload.electricTariff,
            waterTariff: payload.waterTariff,
            lateFeePercentage: payload.lateFeePercentage,
            gracePeriodDays: payload.gracePeriodDays
          },
          create: {
            organizationId: session.organizationId,
            electricTariff: payload.electricTariff,
            waterTariff: payload.waterTariff,
            lateFeePercentage: payload.lateFeePercentage,
            gracePeriodDays: payload.gracePeriodDays
          }
        });

        // 2. Forensic Audit Log
        await tx.auditLog.create({
          data: {
            action: 'SETTINGS_UPDATED',
            entityType: 'SYSTEM_SETTINGS',
            entityId: settings.id,
            metadata: payload,
            user: { connect: { id: session.userId || 'SYSTEM' } },
            organization: { connect: { id: session.organizationId } }
          }
        });

        revalidatePath('/admin/settings');
        return { success: true, message: "Configuration Registry Synchronized." };
      });
    } catch (error: any) {
      console.error('[SETTINGS_UPDATE_FATAL]', error);
      return { success: false, error: error.message || "ERR_REGISTRY_UPDATE_FAILURE" };
    }
  });
}




