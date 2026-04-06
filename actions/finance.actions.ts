'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PaymentMode } from '@/src/schema/enums'
import { 
  runMonthlyBillingCycleService,
  ingestLedgerService,
  processPaymentService,
  reconcileUtilitiesService,
  logExpenseService,
  waiveChargeService
} from '@/src/services/mutations/finance.services'
import { PaymentSubmissionPayload, SystemResponse } from '@/types'

/**
 * FINANCE DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 * 
 * Centralized gatekeeper for all fiscal mutations: Billing, Credits, 
 * Expenses, Ingestion, and Ledger Reconciliation.
 */

/* ── 1. BILLING & AUTOMATION ─────────────────────────────────────────────── */

export async function runMonthlyBillingCycle(targetDate: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await runMonthlyBillingCycleService(
        targetDate,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath('/reports/master-ledger');
      revalidatePath('/tenants');
      
      return { 
        success: true, 
        message: `Billing Cycle Complete: ${result.generated} charges generated, ${result.bypassed} decommissioned units bypassed.`,
        data: result
      };
    } catch (e: any) {
      console.error('[FINANCE_BILLING_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/* ── 2. CREDIT & WAIVERS ─────────────────────────────────────────────────── */

export async function waiveCharge(chargeId: string, reasonText: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      if (!reasonText || reasonText.length < 10) {
        return { success: false, message: "ERR_PROTOCOL_VIOLATION: Waive-off justification must be at least 10 chars." };
      }

      const result = await waiveChargeService(
        chargeId,
        reasonText,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath(`/tenants`);

      return { 
        success: true, 
        message: `Charge waived successfully. Fiscal impact: $${result.waived.toFixed(2)}`,
        data: result 
      };
    } catch (e: any) {
      console.error('[FINANCE_CREDIT_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/* ── 3. EXPENSE LOGGING ─────────────────────────────────────────────────── */

export async function logExpense(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const rawAmount = parseFloat(formData.get('amount') as string);
      const payee = formData.get('payee') as string;
      const description = formData.get('description') as string;
      const ledgerId = formData.get('scope') as string;
      const type = (formData.get('type') as string || 'EXPENSE') as 'INCOME' | 'EXPENSE';
      const propertyId = formData.get('propertyId') as string || undefined;
      const expenseCategoryId = formData.get('subCategoryId') as string || formData.get('parentCategoryId') as string;
      const paymentMode = formData.get('paymentMode') as PaymentMode || PaymentMode.BANK;

      if (!rawAmount || !payee || !expenseCategoryId || !ledgerId) {
        return { error: "ERR_PROTOCOL_VIOLATION: Missing critical financial headers." };
      }

      const result = await logExpenseService(
        {
          amount: rawAmount,
          payee,
          description,
          ledgerId,
          type,
          propertyId,
          expenseCategoryId,
          paymentMode
        },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath('/expenses');
      revalidatePath('/reports/master-ledger');
      
      return { success: true, data: result };
    } catch (e: any) {
      console.error('[FINANCE_EXPENSE_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/* ── 4. MASS INGESTION ──────────────────────────────────────────────────── */

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

      const validated = IngestionPayload.safeParse(normalizedData);
      if (!validated.success) {
        return { 
           success: false, 
           error: "DATA_VALIDATION_FAILURE", 
           details: validated.error.issues.map((e: any) => `[${e.path.join('.')}] ${e.message}`)
        };
      }

      const result = await ingestLedgerService(validated.data, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });

      revalidatePath('/reports/master-ledger');
      revalidatePath('/expenses');
      revalidatePath('/dashboard');
      
      return { 
        success: true, 
        message: `Mass Ingestion Complete: ${result.count} records [Vol: ${result.totalVolume.toLocaleString()}] committed to ledger.`,
        data: result
      };
    } catch (e: any) {
      console.error('[FINANCE_INGESTION_FATAL]', e);
      return { 
        success: false, 
        error: "SERVICE_LAYER_PROTOCOL_FAILURE", 
        message: e.message || "Internal database synchronization failure." 
      };
    }
  });
}

/* ── 5. LEDGER & PAYMENTS ───────────────────────────────────────────────── */

export async function processPayment(payload: PaymentSubmissionPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await processPaymentService(
        {
          tenantId: payload.tenantId,
          amountPaid: payload.amountPaid,
          transactionDate: new Date(payload.transactionDate),
          paymentMode: payload.paymentMode,
          referenceText: payload.referenceText
        },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      return { 
        success: true, 
        message: "Waterfall processing complete. Ledger entry immutable.", 
        data: result 
      };
    } catch (e: any) {
      console.error('[FINANCE_PAYMENT_FATAL]', e);
      return { 
        success: false, 
        message: e.message || "Unknown error", 
        errorCode: "STATE_CONFLICT" 
      };
    }
  });
}

export async function reconcileUtilities(propertyId: string, startDate: Date, endDate: Date) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await reconcileUtilitiesService(
        propertyId,
        { start: startDate, end: endDate },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      return {
        success: true,
        message: "Reconciliation analysis successful.",
        data: result
      };
    } catch (e: any) {
      console.error('[FINANCE_RECONCILE_FATAL]', e);
      return { success: false, message: "ERR_RECONCILE_SERVICE_FAILURE" };
    }
  });
}
