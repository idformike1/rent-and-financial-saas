import { getSovereignClient } from "@/src/lib/db";
import { recordAuditLog } from "@/lib/audit-logger";
import { validateTaxonomyDepth } from "@/src/core/algorithms/governance";
import { rankSearchResults } from "@/src/core/algorithms/governance";
import { AccountCategory } from "@prisma/client";

/**
 * SYSTEM MUTATION SERVICES (SOVEREIGN AUTHORITY)
 *
 * Consolidates Taxonomy governance and infrastructure repair operations.
 * Each mutation is atomic, audited, and enforces hierarchy constraints.
 */

/* ── 1. REVENUE SYNC (INFRASTRUCTURE REPAIR) ────────────────────────────── */

/**
 * Executes a Revenue Synchronization protocol to repair misclassified ledgers.
 */
export async function executeRevenueSyncService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const misclassified = await tx.financialLedger.findMany({
      where: {
        organizationId: context.organizationId,
        class: 'EXPENSE',
        OR: [
          { name: { contains: 'INCOME', mode: 'insensitive' } },
          { name: { contains: 'REVENUE', mode: 'insensitive' } },
          { name: { contains: 'RENT', mode: 'insensitive' } }
        ]
      }
    });

    let updatedCount = 0;
    for (const ledger of misclassified) {
      await tx.financialLedger.updateMany({ 
        where: { id: ledger.id, organizationId: context.organizationId }, 
        data: { class: 'REVENUE' } 
      });
      updatedCount++;

      const account = await tx.account.findFirst({
        where: { name: ledger.name, organizationId: context.organizationId }
      });

      if (!account) {
        await tx.account.create({
          data: { name: ledger.name, category: AccountCategory.INCOME, organizationId: context.organizationId }
        });
      } else if (account.category !== AccountCategory.INCOME) {
        await tx.account.updateMany({ 
          where: { id: account.id, organizationId: context.organizationId }, 
          data: { category: AccountCategory.INCOME } 
        });
      }
    }

    const hasIncome = await tx.account.findFirst({
      where: { organizationId: context.organizationId, category: AccountCategory.INCOME }
    });

    if (!hasIncome) {
      await tx.account.create({
        data: {
          name: "GLOBAL REVENUE (AXIOM)",
          category: AccountCategory.INCOME,
          organizationId: context.organizationId
        }
      });
      updatedCount++;
    }

    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'ORGANIZATION',
      entityId: context.organizationId,
      metadata: { action: 'REVENUE_SYNC', count: updatedCount },
      tx: tx as any
    });

    return { updatedCount };
  });
}

/* ── 2. TAXONOMY (LEDGER & ACCOUNT NODE GOVERNANCE) ─────────────────────── */

/**
 * Materializes a new root Ledger (e.g., REVENUE, EXPENSE asset).
 */
export async function createLedgerService(
  payload: { name: string, class: string },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);
  const normalized = payload.name.trim().toUpperCase();

  const existing = await db.financialLedger.findFirst({
    where: { name: normalized, organizationId: context.organizationId }
  });

  if (existing) throw new Error(`ERR_PROTOCOL_VIOLATION: Alpha Ledger '${normalized}' already materialized.`);

  return await db.$transaction(async (tx: any) => {
    const ledger = await tx.financialLedger.create({
      data: { organizationId: context.organizationId, name: normalized, class: payload.class }
    });

    await recordAuditLog({
      action: 'CREATE', entityType: 'LEDGER', entityId: ledger.id,
      metadata: { name: normalized }, tx: tx as any
    });

    return ledger;
  });
}

/**
 * Executes a ledger vaporization if and only if no subordinate nodes exist.
 */
export async function deleteLedgerService(
  ledgerId: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const childrenCount = await tx.expenseCategory.count({
      where: { ledgerId, organizationId: context.organizationId }
    });

    if (childrenCount > 0) throw new Error("ERR_ENTITY_LOCKED: Ledger contains active taxonomy branches.");

    const result = await tx.financialLedger.deleteMany({ 
      where: { id: ledgerId, organizationId: context.organizationId } 
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Ledger not found or access denied.");

    await recordAuditLog({
      action: 'DELETE', entityType: 'LEDGER', entityId: ledgerId, tx: tx as any
    });
  });
}

/**
 * Materializes an account node (Category/Sub-Category) within the taxonomy.
 */
export async function createAccountNodeService(
  payload: { name: string, ledgerId: string, parentId?: string | null },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    if (payload.parentId) {
      const parent = await tx.expenseCategory.findFirst({
        where: { id: payload.parentId, organizationId: context.organizationId }
      });
      const validation = validateTaxonomyDepth(payload.parentId, !!parent?.parentId);
      if (!validation.valid) throw new Error(`ERR_PROTOCOL_VIOLATION: ${validation.error}`);
    }

    const existing = await tx.expenseCategory.findFirst({
      where: {
        organizationId: context.organizationId,
        ledgerId: payload.ledgerId,
        parentId: payload.parentId || null,
        name: { equals: payload.name.trim(), mode: 'insensitive' }
      }
    });

    if (existing) throw new Error(`ERR_PROTOCOL_VIOLATION: Node '${payload.name}' already registered in this branch.`);

    const node = await tx.expenseCategory.create({
      data: {
        organizationId: context.organizationId,
        name: payload.name.trim(),
        ledgerId: payload.ledgerId,
        parentId: payload.parentId || undefined
      }
    });

    await recordAuditLog({
      action: 'CREATE', entityType: 'CATEGORY', entityId: node.id,
      metadata: { name: payload.name, ledgerId: payload.ledgerId }, tx: tx as any
    });

    return node;
  });
}

/**
 * Recalibrates a ledger's label with audit trail.
 */
export async function updateLedgerService(
  id: string,
  name: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);
  const normalized = name.trim().toUpperCase();

  return await db.$transaction(async (tx: any) => {
    const result = await tx.financialLedger.updateMany({
      where: { id, organizationId: context.organizationId },
      data: { name: normalized }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Ledger not found or access denied.");

    await recordAuditLog({
      action: 'UPDATE', entityType: 'LEDGER', entityId: id,
      metadata: { newName: normalized }, tx: tx as any
    });

    return { id, name: normalized };
  });
}

/**
 * Recalibrates an account node's label.
 */
export async function updateAccountNodeService(
  id: string,
  label: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);
  const normalized = label.trim();

  return await db.$transaction(async (tx: any) => {
    const result = await tx.expenseCategory.updateMany({
      where: { id, organizationId: context.organizationId },
      data: { name: normalized }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Category not found or access denied.");

    await recordAuditLog({
      action: 'UPDATE', entityType: 'CATEGORY', entityId: id,
      metadata: { newLabel: normalized }, tx: tx as any
    });

    return { id, name: normalized };
  });
}

/**
 * Executes a terminal node vaporization.
 */
export async function deleteAccountNodeService(
  id: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const childrenCount = await tx.expenseCategory.count({
      where: { parentId: id, organizationId: context.organizationId }
    });

    if (childrenCount > 0) throw new Error("ERR_ENTITY_LOCKED: Node contains active sub-categories.");

    const entriesCount = await tx.ledgerEntry.count({
      where: { accountId: id, organizationId: context.organizationId }
    });

    if (entriesCount > 0) throw new Error("ERR_ENTITY_LOCKED: Node associated with active ledger entries.");

    const result = await tx.expenseCategory.deleteMany({
      where: { id, organizationId: context.organizationId }
    });

    if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Category not found or access denied.");

    await recordAuditLog({
      action: 'DELETE', entityType: 'CATEGORY', entityId: id, tx: tx as any
    });

    return result;
  });
}
