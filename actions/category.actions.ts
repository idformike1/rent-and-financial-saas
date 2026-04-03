'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { runSecureServerAction } from '@/lib/auth-utils'

/**
 * TAXONOMY ACTION: MATERIALIZE ROOT LEDGER
 * Creates a top-level Ledger (e.g., PROPERTY, HOME, COMMERCIAL)
 */
export async function materializeLedger(name: string, ledgerClass: string = "EXPENSE") {
  return runSecureServerAction('MANAGER', async (session) => {
    if (!name || name.trim().length < 2) {
      return { error: "Ledger label too short. Minimum 2 chars required." };
    }

    try {
      const normalizedName = name.trim().toUpperCase();
      
      const existing = await prisma.financialLedger.findFirst({
        where: { name: normalizedName, organizationId: session.organizationId }
      });

      if (existing) {
        return { error: `Governance Protocol Violation: A Ledger named '${normalizedName}' already exists in your registry.` };
      }

      const ledger = await prisma.financialLedger.create({
        data: {
          organizationId: session.organizationId,
          name: normalizedName,
          class: ledgerClass
        }
      });

      revalidatePath('/settings/categories');
      return { success: true, data: ledger };
    } catch (e: any) {
      console.error('[LEDGER_MATERIALIZATION_FATAL]', e);
      return { error: `Registry Error [V.3.1]: ${e.message || "Unique constraint violation or schema mismatch."}` };
    }
  });
}

/**
 * TAXONOMY ACTION: VAPORIZE LEDGER
 * Deletes a top-level Ledger if and only if it is empty.
 */
export async function vaporizeLedger(id: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const children = await prisma.expenseCategory.count({
        where: { ledgerId: id, organizationId: session.organizationId }
      });

      if (children > 0) {
        return { error: "Governance Protocol Violation: Ledger is not empty. Prune root categories first." };
      }

      // Safe scoping for non-composite primary keys
      const deletedCount = await prisma.financialLedger.deleteMany({
        where: { id, organizationId: session.organizationId }
      });

      if (deletedCount.count === 0) {
        return { error: "Ledger not found or unauthorized access." };
      }

      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      return { error: "Ledger vaporization protocol failed." };
    }
  });
}

/**
 * TAXONOMY ACTION: RECALIBRATE LEDGER
 */
export async function recalibrateLedger(id: string, name: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const updated = await prisma.financialLedger.updateMany({
        where: { id, organizationId: session.organizationId },
        data: { name: name.trim().toUpperCase() }
      });

      if (updated.count === 0) {
        return { error: "Ledger recalibration failed (unauthorized or not found)." };
      }

      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      return { error: "Ledger recalibration failure." };
    }
  });
}

/**
 * ACCOUNT NODE ACTIONS
 */

export async function createAccountNode(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    const label = formData.get('name') as string;
    const ledgerId = formData.get('ledgerId') as string;
    const parentId = formData.get('parentId') as string || null;

    if (!label || !ledgerId) {
      return { error: "Missing required taxonomy fields: Label, Ledger." };
    }

    try {
      // CASE-INSENSITIVE DUPLICATE CHECK WITHIN SAME LEDGER/PARENT
      const existing = await prisma.expenseCategory.findFirst({
        where: {
          organizationId: session.organizationId,
          ledgerId: ledgerId,
          parentId: parentId || null,
          name: {
            equals: label.trim(),
            mode: 'insensitive'
          }
        }
      });

      if (existing) {
        return { error: `Financial Integrity Fault: A node with label '${label}' already exists in this ledger branch.` };
      }

      // DEPTH CONSTRAINT CHECK
      if (parentId) {
        const parent = await prisma.expenseCategory.findFirst({
          where: { id: parentId, organizationId: session.organizationId }
        });
        if (parent?.parentId) {
          return { error: "Architecture Limit: Taxonomies are capped at 2 levels beneath the Ledger." };
        }
      }

      const newNode = await prisma.expenseCategory.create({
        data: {
          organizationId: session.organizationId,
          name: label.trim(),
          ledgerId: ledgerId,
          parentId: parentId || undefined
        }
      });

      revalidatePath('/settings/categories');
      return { success: true, data: newNode };
    } catch (e: any) {
      console.error('[NODE_MATERIALIZATION_FATAL]', e);
      return { error: `Node Materialization Error: ${e.message || "Infrastructure failure."}` };
    }
  });
}

export async function updateAccountNode(id: string, label: string) {
    return runSecureServerAction('MANAGER', async (session) => {
      try {
        const updated = await prisma.expenseCategory.updateMany({
          where: { id, organizationId: session.organizationId },
          data: { name: label.trim() }
        });

        if (updated.count === 0) return { error: "Node not found or recalibration denied." };
  
        revalidatePath('/settings/categories');
        return { success: true };
      } catch (e: any) {
        return { error: "Failed to recalibrate node." };
      }
    });
}

export async function deleteAccountNode(id: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const hasChildren = await prisma.expenseCategory.findFirst({
        where: { parentId: id, organizationId: session.organizationId }
      });

      if (hasChildren) {
        return { error: "Node vaporization blocked: Subordinate sub-ledgers present." };
      }

      const deleted = await prisma.expenseCategory.deleteMany({
        where: { id, organizationId: session.organizationId }
      });

      if (deleted.count === 0) return { error: "Node vaporization protocol denied (not found)." };

      revalidatePath('/settings/categories');
      return { success: true };
    } catch (e: any) {
      return { error: "Node vaporization protocol failed." };
    }
  });
}
