'use server'

import { runSecureServerAction } from "@/lib/auth-utils"
import { treasuryService } from "@/src/services/treasury.service"
import { getActiveWorkspaceId } from "./workspace.actions"
import { revalidatePath } from "next/cache"

/**
 * REGISTRY ACTIONS (PHASE 9.1)
 * Secure CRUD operations for Sovereign Financial OS Registry components.
 */

/* ── 1. FETCHERS ────────────────────────────────────────────────────────── */

export async function getWealthAccounts() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    return await treasuryService.getWealthAccounts(currentOrgId);
  }, false);
}

export async function getExpenseCategories() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    return await treasuryService.getExpenseCategories(currentOrgId);
  }, false);
}

export async function getIncomeSources() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    return await treasuryService.getIncomeSources(currentOrgId);
  }, false);
}

export async function getFinancialLedgers() {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const { ledgers } = await treasuryService.getGovernanceMetadata(currentOrgId);
    return ledgers;
  }, false);
}

export async function getTransactionsByCategory(categoryId: string, dateRange: { from?: Date, to?: Date }) {
  return runSecureServerAction('VIEWER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    return await treasuryService.getMasterLedger(currentOrgId, {
      category: categoryId,
      startDate: dateRange.from,
      endDate: dateRange.to
    });
  }, false);
}

/* ── 2. MUTATORS ────────────────────────────────────────────────────────── */

export async function createWealthAccount(data: { name: string, category: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const account = await treasuryService.createWealthAccount(currentOrgId, data);
    
    revalidatePath('/wealth/accounts');
    revalidatePath('/settings/registry');
    return { success: true, data: account };
  });
}

export async function createExpenseCategory(data: { name: string, ledgerId: string, parentId?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = (await import('@/src/lib/db')).getSovereignClient(currentOrgId);
    const category = await db.expenseCategory.create({
      data: { ...data, organizationId: currentOrgId }
    });
    revalidatePath('/settings/registry');
    return { success: true, data: category };
  });
}

export async function createIncomeSource(data: { name: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = (await import('@/src/lib/db')).getSovereignClient(currentOrgId);
    const source = await db.incomeSource.create({
      data: { ...data, organizationId: currentOrgId }
    });
    revalidatePath('/settings/registry');
    return { success: true, data: source };
  });
}

export async function toggleArchiveStatus(type: string, id: string, isArchived: boolean) {
  return runSecureServerAction('MANAGER', async (session) => {
    const currentOrgId = (await getActiveWorkspaceId()) || session.organizationId;
    const db = (await import('@/src/lib/db')).getSovereignClient(currentOrgId);
    const result = await (db as any)[type].update({
      where: { id, organizationId: currentOrgId },
      data: { isArchived }
    });
    revalidatePath('/settings/registry');
    return { success: true, id: result.id };
  });
}
