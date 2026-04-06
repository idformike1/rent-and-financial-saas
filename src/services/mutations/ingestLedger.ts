import { getSovereignClient } from "@/src/lib/db";
import { toNegativeOutflow } from "@/src/core/algorithms/finance";
import { AccountCategory, PaymentMode } from "@/src/schema/enums";
import { randomUUID } from "crypto";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * MASS INGESTION SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates the bulk ingestion of ledger records within a shielded 
 * transaction. Automatically triggers audit logs for the Surveillance Grid.
 */
export async function ingestLedgerService(
  records: any[], 
  context: { operatorId: string; organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);
  const totalVolume = records.reduce((sum, r) => sum + Math.abs(r.amount), 0);

  return await db.$transaction(async (tx: any) => {
    // 1. Locate primary Asset Account for the organization context
    const account = await tx.account.findFirst({
      where: { 
        category: AccountCategory.ASSET, 
        organizationId: context.organizationId 
      }
    });

    if (!account) {
      throw new Error(`CRITICAL_FAILURE: No primary asset account found for organization [${context.organizationId}].`);
    }

    const entriesCreated: string[] = [];

    // 2. Atomic Record Materialization
    for (const record of records) {
      const transactionId = randomUUID();
      const netAmount = toNegativeOutflow(record.amount);

      const entry = await tx.ledgerEntry.create({
        data: {
          organizationId: context.organizationId,
          transactionId,
          accountId: account.id,
          amount: netAmount,
          date: record.date,
          transactionDate: record.date,
          description: record.description || `Bulk Import: ${record.payee}`,
          payee: record.payee,
          paymentMode: record.paymentMode || PaymentMode.BANK
        }
      });
      entriesCreated.push(entry.id);
    }

    // 3. Automated Audit Trace
    await recordAuditLog({
      action: 'CREATE',
      entityType: 'LEDGER_ENTRY',
      entityId: `BULK_INGEST_${Date.now()}`,
      metadata: { 
        count: records.length, 
        totalVolume,
        ingressType: 'CSV_UPLOAD'
      },
      tx: tx as any // Type-casting for compatibility with external audit lib
    });

    return { 
      count: records.length, 
      totalVolume 
    };
  });
}
