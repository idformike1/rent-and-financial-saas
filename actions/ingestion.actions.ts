'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { recordAuditLog } from '@/lib/audit-logger'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { PaymentMode, AccountCategory } from '@prisma/client'

/**
 * ZOD SCHEMA: AXIOM BULK EXPENSE IMPORT
 */
const BulkExpenseSchema = z.object({
  date: z.union([z.string(), z.date()]).transform(v => new Date(v)),
  amount: z.union([z.string(), z.number()]).transform(v => {
    if (typeof v === 'string') {
      const parsed = parseFloat(v.replace(/[^\d.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return v;
  }),
  payee: z.string().optional().transform(v => v || "UNSPECIFIED"),
  description: z.string().optional().transform(v => v || "UNSPECIFIED"),
  paymentMode: z.nativeEnum(PaymentMode).default(PaymentMode.BANK)
});

const IngestionPayload = z.array(BulkExpenseSchema);

export async function ingestBulkExpenses(data: any[]) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // 1. Normalization & Validation Gateway
      const normalizedData = data.map(row => {
         const getVal = (key: string) => {
            const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
            return foundKey ? row[foundKey] : undefined;
         }
         return {
            date: getVal('date'),
            amount: getVal('amount'),
            payee: getVal('payee') || "UNSPECIFIED",
            description: getVal('description') || "UNSPECIFIED",
         }
      });

      const validated = IngestionPayload.safeParse(normalizedData);
      if (!validated.success) {
        return { 
           success: false, 
           error: "DATA_VALIDATION_FAILURE", 
           details: validated.error.issues.map((e: any) => `[${e.path.join('.')}] ${e.message}`)
        };
      }

      const records = validated.data;
      const totalRecords = records.length;

      // 2. Atomic Materialization Pipeline
      const result = await prisma.$transaction(async (tx: any) => {
        // Find default Asset Account once for the whole batch signature
        const account = await tx.account.findFirst({
           where: { category: AccountCategory.ASSET, organizationId: session.organizationId }
        });

        if (!account) throw new Error("No primary asset account found for registry synchronization.");

        const entriesCreated = [];

        for (const item of records) {
          const transactionId = randomUUID();
          
          // SIGN CONVENTION: Expenses are negative outflows
          const netAmount = -Math.abs(item.amount);

          const entry = await tx.ledgerEntry.create({
            data: {
              organizationId: session.organizationId,
              transactionId,
              accountId: account.id,
              amount: netAmount,
              date: item.date,
              transactionDate: item.date,
              description: item.description || `Bulk Ingestion Import: ${item.payee}`,
              payee: item.payee,
              paymentMode: item.paymentMode
            }
          });

          entriesCreated.push(entry.id);
        }

        // 3. Global Audit Surveillance
        await recordAuditLog({
          action: 'CREATE',
          entityType: 'LEDGER_ENTRY',
          entityId: "BULK_INGESTION_" + Date.now(),
          metadata: { 
            count: totalRecords, 
            ingressType: 'CSV_UPLOAD',
            recordRange: entriesCreated
          },
          tx
        });

        return { count: totalRecords };
      });

      revalidatePath('/reports/master-ledger');
      revalidatePath('/expenses');
      revalidatePath('/dashboard');
      
      return { 
        success: true, 
        message: `Mass Ingestion Complete: ${result.count} records committed to the immutable ledger.` 
      };

    } catch (e: any) {
      console.error('[INGESTION_FATAL]', e);
      return { 
        success: false, 
        error: "INGESTION_PROTOCOL_BREACH", 
        message: e.message || "Internal database synchronization failure." 
      };
    }
  });
}
