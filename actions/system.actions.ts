'use server'

import { revalidatePath } from 'next/cache'
import { runSecureServerAction } from '@/lib/auth-utils'
import {
  createLedgerService,
  deleteLedgerService,
  createAccountNodeService,
  updateLedgerService,
  updateAccountNodeService,
  deleteAccountNodeService,
  executeRevenueSyncService
} from '@/src/services/mutations/system.services'
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
