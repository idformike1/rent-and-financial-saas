'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { PaymentMode } from '@prisma/client'
import { ingestLedgerService } from '@/src/services/mutations/ingestLedger'

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

/**
 * MASS INGESTION SERVER ACTION (GATEKEEPER)
 * 
 * Performs authorization checks and data validation before 
 * offloading the atomic database transaction to the Sovereign Service Layer.
 */
export async function ingestBulkExpenses(data: any[]) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // 1. Data Normalization & Header Re-mapping
      const normalizedData = data.map(row => {
         const getVal = (key: string) => {
            const foundKey = Object.keys(row).find(k => k.toLowerCase() === key.toLowerCase());
            return foundKey ? row[foundKey] : undefined;
         }
         return {
            date: getVal('date'),
            amount: getVal('amount'),
            payee: getVal('payee'),
            description: getVal('description'),
         }
      });

      // 2. Strict Schema Validation Gateway
      const validated = IngestionPayload.safeParse(normalizedData);
      if (!validated.success) {
        return { 
           success: false, 
           error: "DATA_VALIDATION_FAILURE", 
           details: validated.error.issues.map((e: any) => `[${e.path.join('.')}] ${e.message}`)
        };
      }

      // 3. Delegation to Sovereign Service Layer
      // We pass the Session context to the service to trigger the Surveillance Grid
      const result = await ingestLedgerService(validated.data, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });

      // 4. Global Path Synchronization
      revalidatePath('/reports/master-ledger');
      revalidatePath('/expenses');
      revalidatePath('/dashboard');
      
      return { 
        success: true, 
        message: `Mass Ingestion Complete: ${result.count} records [Vol: ${result.totalVolume.toLocaleString()}] committed to ledger.`,
        data: result
      };

    } catch (e: any) {
      console.error('[INGESTION_FATAL_BREACH]', e);
      return { 
        success: false, 
        error: "SERVICE_LAYER_PROTOCOL_FAILURE", 
        message: e.message || "Internal database synchronization failure." 
      };
    }
  });
}
