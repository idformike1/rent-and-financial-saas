'use server'

import { revalidatePath } from 'next/cache'
import { runSecureServerAction } from '@/lib/auth-utils'
import { 
  createLedgerService, 
  deleteLedgerService, 
  createAccountNodeService 
} from '@/src/services/mutations/taxonomy.services'
import prisma from '@/lib/prisma'

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

      const newNode = await createAccountNodeService(
        { name: label, ledgerId, parentId },
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );

      revalidatePath('/settings/categories');
      return { success: true, data: newNode };
    } catch (e: any) {
      console.error('[NODE_MATERIALIZE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * REMAINING CRUD (TO BE FULLY STRANGLED IN FINAL PASS)
 */
export async function recalibrateLedger(id: string, name: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    await prisma.financialLedger.updateMany({
      where: { id, organizationId: session.organizationId },
      data: { name: name.trim().toUpperCase() }
    });
    revalidatePath('/settings/categories');
    return { success: true };
  });
}

export async function updateAccountNode(id: string, label: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    await prisma.expenseCategory.updateMany({
      where: { id, organizationId: session.organizationId },
      data: { name: label.trim() }
    });
    revalidatePath('/settings/categories');
    return { success: true };
  });
}

export async function deleteAccountNode(id: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    const deleted = await prisma.expenseCategory.deleteMany({
      where: { id, organizationId: session.organizationId }
    });
    if (deleted.count === 0) return { error: "Node vaporization protocol denied (not found)." };
    revalidatePath('/settings/categories');
    return { success: true };
  });
}
