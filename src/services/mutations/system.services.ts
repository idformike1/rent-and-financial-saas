import { getSovereignClient } from "@/src/lib/db";
import { recordAuditLog } from "@/lib/audit-logger";
import { AccountCategory } from "@prisma/client";

/**
 * SYSTEM SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates infrastructure repairs and registry synchronization protocols.
 */

/**
 * Executes a Revenue Synchronization protocol to repair misclassified ledgers.
 */
export async function executeRevenueSyncService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    // 1. Locate Misclassified Ledgers
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
      await tx.financialLedger.update({
        where: { id: ledger.id },
        data: { class: 'REVENUE' }
      });
      updatedCount++;

      // 2. Pair with System Account
      const account = await tx.account.findFirst({
        where: { name: ledger.name, organizationId: context.organizationId }
      });

      if (!account) {
        await tx.account.create({
          data: {
            name: ledger.name,
            category: AccountCategory.INCOME,
            organizationId: context.organizationId
          }
        });
      } else if (account.category !== AccountCategory.INCOME) {
        await tx.account.update({
          where: { id: account.id },
          data: { category: AccountCategory.INCOME }
        });
      }
    }

    // 3. Fallback: Absolute Revenue Reachability
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
