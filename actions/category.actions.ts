'use server'

import { revalidatePath } from 'next/cache'
import { runSecureServerAction } from '@/lib/auth-utils'
import { 
  createLedgerService, 
  deleteLedgerService, 
  createAccountNodeService,
  updateLedgerService,
  updateAccountNodeService,
  deleteAccountNodeService
} from '@/src/services/mutations/taxonomy.services'

/**
 * TAXONOMY GATEKEEPER: LEDGER MATERIALIZATION
 */
export async function materializeLedger(name: string, ledgerClass: string = "EXPENSE") {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const ledger = await createLedgerService(
        { name, class: ledgerClass },
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );
      revalidatePath('/settings/categories');
      return { success: true, data: ledger };
    } catch (e: any) {
      console.error('[LEDGER_MATERIALIZE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * TAXONOMY GATEKEEPER: LEDGER VAPORIZATION
 */
export async function vaporizeLedger(id: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await deleteLedgerService(
        id,
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      console.error('[LEDGER_VAPORIZE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * TAXONOMY GATEKEEPER: ACCOUNT NODE MATERIALIZATION
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

      await createAccountNodeService(
        { name: label, ledgerId, parentId },
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );

      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      console.error('[NODE_MATERIALIZE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * TAXONOMY GATEKEEPER: LEDGER RECALIBRATION
 */
export async function recalibrateLedger(id: string, name: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await updateLedgerService(
        id, name, 
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
       console.error('[LEDGER_RECALIBRATE_FATAL]', e);
       return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * TAXONOMY GATEKEEPER: ACCOUNT NODE RECALIBRATION
 */
export async function updateAccountNode(id: string, label: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await updateAccountNodeService(
        id, label, 
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
       console.error('[NODE_RECALIBRATE_FATAL]', e);
       return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * TAXONOMY GATEKEEPER: ACCOUNT NODE VAPORIZATION
 */
export async function deleteAccountNode(id: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await deleteAccountNodeService(
        id, 
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );
      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
       console.error('[NODE_VAPORIZE_FATAL]', e);
       return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
