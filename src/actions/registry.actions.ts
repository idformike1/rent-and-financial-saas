'use server'

import { runSecureServerAction } from "@/lib/auth-utils"
import { getSovereignClient } from "@/src/lib/db"
import { getActiveWorkspaceId } from "./workspace.actions"
import { revalidatePath } from "next/cache"

/**
 * REGISTRY ACTIONS (PHASE 9.1)
 * Secure CRUD operations for Sovereign Financial OS Registry components.
 * 
 * ABSOLUTE SECURITY RULE: Every database query in this file MUST use 
 * `where: { organizationId: currentOrgId }` to ensure zero-leak tenant isolation.
 */

/* ── 1. FETCHERS ────────────────────────────────────────────────────────── */

/**
 * Retrieves all wealth accounts for the active workspace.
 */
export async function getWealthAccounts() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = getSovereignClient(currentOrgId);
    
    return await db.wealthAccount.findMany({
      where: { 
        organizationId: currentOrgId,
        isArchived: false
      },
      orderBy: { name: 'asc' }
    });
  }, false);
}

/**
 * Retrieves all expense categories for the active workspace.
 */
export async function getExpenseCategories() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = getSovereignClient(currentOrgId);
    
    return await db.expenseCategory.findMany({
      where: { 
        organizationId: currentOrgId,
        isArchived: false
      },
      orderBy: { name: 'asc' }
    });
  }, false);
}

/**
 * Retrieves all income sources for the active workspace.
 */
export async function getIncomeSources() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = getSovereignClient(currentOrgId);
    
    return await db.incomeSource.findMany({
      where: { 
        organizationId: currentOrgId,
        isArchived: false
      },
      orderBy: { name: 'asc' }
    });
  }, false);
}

export async function getFinancialLedgers() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = getSovereignClient(currentOrgId);
    
    return await db.financialLedger.findMany({
      where: { organizationId: currentOrgId },
      orderBy: { name: 'asc' }
    });
  }, false);
}


/* ── 2. MUTATORS ────────────────────────────────────────────────────────── */

/**
 * Creates a new wealth account.
 */
export async function createWealthAccount(data: { name: string, category: string }) {
  return runSecureServerAction('MANAGER', async () => {
    const currentOrgId = await getActiveWorkspaceId();
    if (!currentOrgId) throw new Error("UNAUTHORIZED: Active workspace context required.");
    const db = getSovereignClient(currentOrgId);
    
    const account = await db.wealthAccount.create({
      data: {
        ...data,
        organizationId: currentOrgId,
        category: data.category as any
      }
    });
    
    revalidatePath('/wealth/accounts');
    revalidatePath('/settings/registry');
    return { success: true, data: account };
  });
}

/**
 * Creates a new expense category.
 */
export async function createExpenseCategory(data: { name: string, ledgerId: string, parentId?: string }) {
  return runSecureServerAction('MANAGER', async () => {
    const currentOrgId = await getActiveWorkspaceId();
    if (!currentOrgId) throw new Error("UNAUTHORIZED: Active workspace context required.");
    const db = getSovereignClient(currentOrgId);
    
    const category = await db.expenseCategory.create({
      data: {
        ...data,
        organizationId: currentOrgId
      }
    });
    
    revalidatePath('/wealth/cash-flow');
    revalidatePath('/settings/registry');
    return { success: true, data: category };
  });
}

/**
 * Creates a new income source.
 */
export async function createIncomeSource(data: { name: string }) {
  return runSecureServerAction('MANAGER', async () => {
    const currentOrgId = await getActiveWorkspaceId();
    if (!currentOrgId) throw new Error("UNAUTHORIZED: Active workspace context required.");
    const db = getSovereignClient(currentOrgId);
    
    const source = await db.incomeSource.create({
      data: {
        ...data,
        organizationId: currentOrgId
      }
    });
    
    revalidatePath('/wealth/cash-flow');
    revalidatePath('/settings/registry');
    return { success: true, data: source };
  });
}

/* ── 3. STATE TOGGLES ───────────────────────────────────────────────────── */

/**
 * Toggles the archival status of a registry item to preserve historical data.
 */
export async function toggleArchiveStatus(type: 'wealthAccount' | 'expenseCategory' | 'incomeSource', id: string, isArchived: boolean) {
  return runSecureServerAction('MANAGER', async () => {
    const currentOrgId = await getActiveWorkspaceId();
    if (!currentOrgId) throw new Error("UNAUTHORIZED: Active workspace context required.");
    const db = getSovereignClient(currentOrgId);
    
    const result = await (db as any)[type].update({
      where: { 
        id,
        organizationId: currentOrgId 
      },
      data: { isArchived }
    });
    
    revalidatePath('/wealth');
    revalidatePath('/settings/registry');
    return { success: true, id: result.id };
  });
}

/**
 * FORENSIC DRILL-DOWN: Fetches detailed transactions for a specific category and date range.
 */
export async function getTransactionsByCategory(categoryId: string, dateRange: { from?: Date, to?: Date }) {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = getSovereignClient(currentOrgId);
    
    return await db.ledgerEntry.findMany({
      where: { 
        organizationId: currentOrgId,
        expenseCategoryId: categoryId,
        transactionDate: {
            gte: dateRange.from,
            lte: dateRange.to
        }
      },
      include: {
        account: true,
        expenseCategory: true
      },
      orderBy: { transactionDate: 'desc' }
    });
  }, false);
}

