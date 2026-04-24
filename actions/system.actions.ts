'use server'

import { revalidatePath } from 'next/cache'
import { runSecureServerAction } from '@/lib/auth-utils'
import { auth, update } from '@/auth'
import bcrypt from 'bcryptjs'
import {
  createLedgerService,
  deleteLedgerService,
  createAccountNodeService,
  updateLedgerService,
  updateAccountNodeService,
  deleteAccountNodeService,
  executeRevenueSyncService,
  bootstrapOrganizationService
} from '@/src/services/mutations/system.services'
import { prisma } from '@/lib/prisma'
import { deepScanSystemService } from '@/src/services/queries/system.services'
import { getDetailedOntologyService } from '@/src/services/queries/analytics'

/**
 * SYSTEM DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 *
 * Centralized gatekeeper for all System operations:
 * Taxonomy Governance, Global Search, and Structural Ontology.
 */

/* ── 1. TAXONOMY GOVERNANCE ─────────────────────────────────────────────── */

/**
 * LEDGER MATERIALIZATION GATEKEEPER
 */
export async function materializeLedger(name: string, ledgerClass: string = "EXPENSE") {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const ledger = await createLedgerService(
        { name, class: ledgerClass },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/settings/categories');
      return { success: true, data: ledger };
    } catch (e: any) {
      console.error('[SYSTEM_LEDGER_CREATE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * LEDGER VAPORIZATION GATEKEEPER
 */
export async function vaporizeLedger(id: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await deleteLedgerService(
        id,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      console.error('[SYSTEM_LEDGER_DELETE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * ACCOUNT NODE MATERIALIZATION GATEKEEPER
 */
export async function createAccountNode(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const label = formData.get('name') as string;
      const ledgerId = formData.get('ledgerId') as string;
      const parentId = formData.get('parentId') as string || null;

      if (!label || !ledgerId) {
        return { error: "Missing required taxonomy fields: Label, Ledger." };
      }

      const node = await createAccountNodeService(
        { name: label, ledgerId, parentId },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );

      revalidatePath('/settings/categories');
      return { success: true, data: node };
    } catch (e: any) {
      console.error('[SYSTEM_NODE_CREATE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * LEDGER RECALIBRATION GATEKEEPER
 */
export async function recalibrateLedger(id: string, name: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await updateLedgerService(
        id, name,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      console.error('[SYSTEM_LEDGER_UPDATE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * ACCOUNT NODE RECALIBRATION GATEKEEPER
 */
export async function updateAccountNode(id: string, label: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await updateAccountNodeService(
        id, label,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      console.error('[SYSTEM_NODE_UPDATE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * ACCOUNT NODE VAPORIZATION GATEKEEPER
 */
export async function deleteAccountNode(id: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await deleteAccountNodeService(
        id,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      console.error('[SYSTEM_NODE_DELETE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/* ── 2. GLOBAL SEARCH ───────────────────────────────────────────────────── */

/**
 * DEEP SCAN GATEKEEPER
 */
export async function deepScanSystem(query: string) {
  if (!query || query.length < 2) return { success: true, data: [] };

  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const results = await deepScanSystemService(
        query,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      return { success: true, data: results };
    } catch (error: any) {
      console.error('[SYSTEM_SEARCH_FATAL]', error);
      return { success: false, error: 'Quantum Search Failure' };
    }
  });
}

/* ── 3. STRUCTURAL ONTOLOGY ─────────────────────────────────────────────── */

/**
 * DETAILED ONTOLOGY MATERIALIZATION GATEKEEPER
 */
export async function fetchDetailedOntology() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const root = await getDetailedOntologyService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return { root };
    } catch (e: any) {
      console.error('[SYSTEM_ONTOLOGY_FATAL]', e);
      throw e;
    }
  });
}

/* ── 4. INFRASTRUCTURE REPAIR ───────────────────────────────────────────── */

/**
 * REVENUE SYNC GATEKEEPER (ADMIN ONLY)
 */
export async function executeRevenueSync() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await executeRevenueSyncService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return { success: true, data: result };
    } catch (e: any) {
      console.error('[SYSTEM_REVENUE_SYNC_FATAL]', e);
      return { success: false, message: e.message || "ERR_SYNC_FAILURE" };
    }
  });
}

/* ── 5. PROVISIONING (ADMIN ONLY) ────────────────────────────────────────── */

/**
 * ORGANIZATIONAL BOOTSTRAP GATEKEEPER
 */
export async function bootstrapOrganization(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    // Strict Gate: Only System Admins can bootstrap new organizations
    if (!(session as any).isSystemAdmin) {
      throw new Error("ERR_AUTHORITY_ABSENT: Provisioning requires ROOT_ADMIN clearance.");
    }

    try {
      const orgName = formData.get('orgName') as string;
      const ownerName = formData.get('ownerName') as string;
      const ownerEmail = formData.get('ownerEmail') as string;

      if (!orgName || !ownerName || !ownerEmail) {
        return { error: "Missing required provisioning fields: Org Name, Owner Name, Owner Email." };
      }

      const result = await bootstrapOrganizationService(
        { orgName, ownerName, ownerEmail },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN" }
      );

      revalidatePath('/admin');
      return { 
        success: true, 
        orgName: result.organization.name,
        ownerEmail: result.owner.email,
        tempPassword: result.tempPassword 
      };
    } catch (e: any) {
      console.error('[SYSTEM_BOOTSTRAP_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * SYSTEM AUDIT DATA FETCHER
 */
export async function getSystemAuditSummary() {
  const session = await auth();
  if (!(session?.user as any)?.isSystemAdmin) {
    throw new Error("UNAUTHORIZED: Access Denied. System telemetry requires ROOT_ADMIN clearance.");
  }

  // Directly query for dashboard metrics
  const totalUsers = await prisma.user.count({ where: { deletedAt: null } });
  const activeOrgs = await prisma.organization.count({ where: { deletedAt: null } });
  const pendingIntake = await prisma.user.count({ where: { organizationId: null, accountStatus: 'ACTIVE', deletedAt: null } });

  return {
    totalUsers,
    activeOrgs,
    pendingIntake
  };
}

/* ── 6. IMPERSONATION (SUPPORT PROTOCOL) ─────────────────────────────────── */

/**
 * Executes a session swap to impersonate a target user.
 */
export async function impersonateUser(userId: string) {
  const session = await auth();
  if (!session?.user?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Impersonation requires ROOT_ADMIN clearance.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) throw new Error("ERR_IDENTITY_ABSENT: Target user does not exist.");

  // Security Guard: Prevent recursive impersonation or self-impersonation
  if (targetUser.id === session.user.id) throw new Error("ERR_IDENTITY_COLLISION: Cannot impersonate self.");

  await update({
    impersonate: {
      id: targetUser.id,
      organizationId: targetUser.organizationId,
      role: targetUser.role
    }
  });

  revalidatePath('/');
  return { success: true };
}

/**
 * Reverts the session to the original administrator identity.
 */
export async function revertImpersonation() {
  const session = await auth();
  if (!(session?.user as any)?.isImpersonating) {
    throw new Error("ERR_STATE_VIOLATION: No active impersonation detected.");
  }

  await update({ revert: true });

  revalidatePath('/');
  return { success: true };
}

/**
 * Admin Override: Force password reset for a user.
 */
export async function adminResetUserPassword(userId: string) {
  const session = await auth();
  if (!(session?.user as any)?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Password reset requires ROOT_ADMIN clearance.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) throw new Error("ERR_IDENTITY_ABSENT: Target user does not exist.");

  // Generate 8-character temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let tempPassword = '';
  for (let i = 0; i < 8; i++) {
    tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
      requiresPasswordChange: true
    }
  });

  return { success: true, tempPassword };
}

/**
 * ORGANIZATIONAL SOFT-DELETE CASCADE
 * Executes a cascading soft-delete for an organization and all its associated identities.
 */
export async function deleteOrganization(orgId: string) {
  const session = await auth();
  if (!(session?.user as any)?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Organizational deletion requires ROOT_ADMIN clearance.");
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Cascade Soft-Delete to all Users within the Organization
      await tx.user.updateMany({
        where: { organizationId: orgId },
        data: { 
          deletedAt: new Date(),
          accountStatus: "ARCHIVED" 
        }
      });

      // 2. Materialize Soft-Delete for the Organization entity
      await tx.organization.update({
        where: { id: orgId },
        data: { deletedAt: new Date() }
      });
    });

    revalidatePath('/admin');
    revalidatePath('/admin/tenants');
    return { success: true };
  } catch (error: any) {
    console.error('[SYSTEM_ORG_DELETE_FATAL]', error);
    return { success: false, error: error.message || "ERR_CASCADE_FAILURE" };
  }
}

/**
 * TARGETED USER PROVISIONING
 * Injects a new administrative identity into an existing organizational silo.
 */
export async function provisionTargetedUser(orgId: string, email: string, role: string) {
  const session = await auth();
  if (!(session?.user as any)?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Targeted provisioning requires ROOT_ADMIN clearance.");
  }

  try {
    // 1. Verify target organization exists and is active
    const org = await prisma.organization.findUnique({
      where: { id: orgId, deletedAt: null }
    });

    if (!org) {
      return { success: false, error: "ERR_TARGET_LOST: Organization not found or archived." };
    }

    // 2. Generate secure temporary credentials
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
    const tempPasswordHash = await bcrypt.hash(tempPassword, 12);

    // 3. Create the Identity
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: tempPasswordHash,
        role,
        organizationId: orgId,
        accountStatus: "ACTIVE",
        requiresPasswordChange: true
      }
    });

    revalidatePath('/admin');
    revalidatePath('/admin/tenants');
    return { success: true, email: user.email, tempPassword, role: user.role };
  } catch (error: any) {
    console.error('[SYSTEM_TARGETED_PROVISION_FATAL]', error);
    if (error.code === 'P2002') return { success: false, error: "ERR_IDENTITY_CONFLICT: Email already exists." };
    return { success: false, error: error.message || "ERR_PROVISION_FAILURE" };
  }
}
