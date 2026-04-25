'use server'

import { runSecureServerAction, runIdempotentAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PaymentMode } from '@/src/schema/enums'
import { 
  runMonthlyBillingCycleService,
  ingestLedgerService,
  processPaymentService,
  reconcileUtilitiesService,
  logExpenseService,
  waiveChargeService,
  voidLedgerEntryService
} from '@/src/services/finance'
import { PaymentSubmissionPayload, SystemResponse } from '@/types'

/**
 * FINANCE DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 * 
 * Centralized gatekeeper for all fiscal mutations: Billing, Credits, 
 * Expenses, Ingestion, and Ledger Reconciliation.
 */

/* ── 1. BILLING & AUTOMATION ─────────────────────────────────────────────── */

/**
 * PAYROLL BATCH GATEKEEPER
 * 
 * Manually triggers a recurring revenue batch for a specific service period.
 * Enforces strict 'Period Lockdown' to prevent double-billing.
 */
export async function runMonthlyBillingCycle(payload: { servicePeriod: string, postingDate: string }) {
  // Use a generated idempotency key for the request itself
  const idempotencyKey = `BILLING_${payload.servicePeriod}`;

  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      // 1. PROTOCOL VALIDATION
      if (!payload.servicePeriod.match(/^\d{4}-\d{2}$/)) {
        throw new Error("ERR_PROTOCOL_VIOLATION: servicePeriod must follow 'YYYY-MM' format.");
      }

      const result = await runMonthlyBillingCycleService(
        {
          servicePeriod: payload.servicePeriod,
          postingDate: new Date(payload.postingDate)
        },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      // 2. CACHE PURGE
      revalidatePath('/reports/master-ledger');
      revalidatePath('/tenants');
      revalidatePath('/treasury/receivables');
      
      return { 
        success: true, 
        message: `Payroll Batch Complete: Generated ${result.generated} charges for ${result.period}. ${result.bypassed} units bypassed.`,
        data: result
      };
    } catch (e: any) {
      console.error('[FINANCE_BILLING_FATAL]', e);
      return { 
        success: false, 
        message: e.message || "ERR_SERVICE_LAYER_FAILURE",
        errorCode: "BATCH_ABORTED" 
      };
    }
  });
}

/* ── 2. CREDIT & WAIVERS ─────────────────────────────────────────────────── */

export async function waiveCharge(chargeId: string, reasonText: string, idempotencyKey: string) {
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
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
  const idempotencyKey = formData.get('idempotencyKey') as string;
  
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const rawAmount = parseFloat(formData.get('amount') as string);
      const payee = formData.get('payee') as string;
      const description = formData.get('description') as string;
      const type = (formData.get('type') as string || 'EXPENSE') as 'INCOME' | 'EXPENSE';
      const propertyId = formData.get('propertyId') as string || undefined;
      const paymentMode = formData.get('paymentMode') as PaymentMode || PaymentMode.BANK;
      
      let ledgerId = formData.get('scope') as string;
      let expenseCategoryId = formData.get('subCategoryId') as string || formData.get('parentCategoryId') as string;

      // ── AUTO-RESOLUTION PROTOCOL ───────────────────────────────────────
      // If critical headers are missing (common in direct unit injections),
      // we perform a tactical recovery of system accounts to prevent crash.
      const { getSovereignClient } = await import('@/src/lib/db');
      const db = getSovereignClient(session.userId || "OP_SYSTEM_ADMIN");

      if (!ledgerId) {
        const primaryLedger = await db.account.findFirst({
          where: { organizationId: session.organizationId, category: 'ASSET' }
        });
        if (primaryLedger) ledgerId = primaryLedger.id;
      }

      if (!expenseCategoryId) {
        const primaryCategory = await db.expenseCategory.findFirst({
          where: { organizationId: session.organizationId }
        });
        if (primaryCategory) expenseCategoryId = primaryCategory.id;
      }

      if (!rawAmount || !payee || !expenseCategoryId || !ledgerId) {
        return { error: `ERR_PROTOCOL_VIOLATION: Missing critical financial headers. (L: ${!!ledgerId}, C: ${!!expenseCategoryId})` };
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

      revalidatePath('/treasury/payables');
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

export async function ingestBulkExpenses(data: any[], idempotencyKey: string) {
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
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
      revalidatePath('/treasury/payables');
      revalidatePath('/treasury/feed');
      
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

/**
 * WATERFALL PAYMENT GATEKEEPER
 * 
 * Orchestrates the complex liquidation of tenant debt across multiple 
 * priority tiers (Fees > Utilities > Rent).
 */
export async function processPayment(payload: PaymentSubmissionPayload): Promise<SystemResponse> {
  const idempotencyKey = payload.idempotencyKey || `PAYMENT_${payload.tenantId}_${payload.amountPaid}_${payload.transactionDate}`;
  
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const result = await processPaymentService(
        {
          tenantId: payload.tenantId,
          amountPaid: payload.amountPaid,
          transactionDate: new Date(payload.transactionDate),
          paymentMode: payload.paymentMode,
          referenceText: payload.referenceText,
          idempotencyKey: idempotencyKey
        },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      // Invalidate the fiscal state across the platform
      revalidatePath('/tenants');
      revalidatePath(`/tenants/${payload.tenantId}`);
      revalidatePath('/treasury/feed');
      revalidatePath('/reports/master-ledger');

      return { 
        success: true, 
        message: `Waterfall Protocol Successful: ${result.summary}`, 
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

export async function voidTransaction(transactionId: string, idempotencyKey: string) {
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      await voidLedgerEntryService(
        transactionId,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath('/treasury/feed');

      return { success: true, message: "Forensic Decommissioning Successful: Entry status set to VOIDED." };
    } catch (e: any) {
      console.error('[FINANCE_VOID_FATAL]', e);
      return { success: false, message: e.message || "ERR_VOID_SERVICE_FAILURE" };
    }
  });
}
export async function clearTransaction(transactionId: string, currentStatus: boolean) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.ledgerEntry.update({
        where: { id: transactionId, organizationId: session.organizationId },
        data: { 
          isCleared: !currentStatus,
          clearedAt: !currentStatus ? new Date() : null,
        },
      });

      revalidatePath('/treasury');
      revalidatePath('/treasury/feed');
      
      return { success: true, message: "Transaction clearance state synchronized." };
    } catch (e: any) {
      console.error('[FINANCE_CLEAR_FATAL]', e);
      return { success: false, message: "ERR_CLEARANCE_SERVICE_FAILURE" };
    }
  });
}
export async function logUtilityConsumption(payload: { 
  tenantId: string, 
  unitId: string, 
  utilityType: 'ELECTRIC' | 'WATER', 
  currentReading: number, 
  date: string 
}) {
  const idempotencyKey = `UTILITY_${payload.unitId}_${payload.utilityType}_${payload.currentReading}_${payload.date}`;
  
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { prisma } = await import('@/lib/prisma');
      const { createBalancedTransaction } = await import('@/src/services/finance/core');

      // 1. TARIFF RATE RESOLUTION (Configuration Registry)
      const settings = await prisma.systemSettings.findUnique({
        where: { organizationId: session.organizationId }
      });

      const electricRate = settings ? Number(settings.electricTariff) : 0.15;
      const waterRate = settings ? Number(settings.waterTariff) : 0.05;
      const effectiveRate = payload.utilityType === 'ELECTRIC' ? electricRate : waterRate;

      // 2. QUERY PREVIOUS READING
      const previousReading = await prisma.meterReading.findFirst({
        where: { unitId: payload.unitId, type: payload.utilityType },
        orderBy: { date: 'desc' }
      });

      // 3. BASELINE CHECK (Move-in Case)
      if (!previousReading) {
        await prisma.meterReading.create({
          data: {
            unitId: payload.unitId,
            type: payload.utilityType,
            value: payload.currentReading,
            date: new Date(payload.date)
          }
        });
        return { success: true, message: "Baseline reading established. No charge created." };
      }

      // 4. DELTA MATH & VALIDATION
      if (payload.currentReading <= previousReading.value) {
        throw new Error(`ERR_METRIC_VIOLATION: Current reading (${payload.currentReading}) must be greater than previous reading (${previousReading.value}).`);
      }

      const consumption = payload.currentReading - previousReading.value;
      const chargeAmount = consumption * effectiveRate;

      // 5. ATOMIC COMMIT (Meter + Charge + Ledger)
      return await prisma.$transaction(async (tx: any) => {
        // A. Save Reading
        await tx.meterReading.create({
          data: {
            unitId: payload.unitId,
            type: payload.utilityType,
            value: payload.currentReading,
            date: new Date(payload.date)
          }
        });

        const activeLease = await tx.lease.findFirst({ 
          where: { tenantId: payload.tenantId, isActive: true, organizationId: session.organizationId } 
        });

        // B. Create Charge
        const charge = await tx.charge.create({
          data: {
            organizationId: session.organizationId,
            tenantId: payload.tenantId,
            leaseId: activeLease?.id || '',
            type: payload.utilityType === 'ELECTRIC' ? 'ELEC_SUBMETER' : 'WATER_SUBMETER',
            amount: chargeAmount,
            dueDate: new Date(payload.date),
            isFullyPaid: false
          }
        });

        const assetAccount = await tx.account.findFirst({ 
          where: { category: 'ASSET', organizationId: session.organizationId } 
        });
        const incomeAccount = await tx.account.findFirst({ 
          where: { category: 'INCOME', organizationId: session.organizationId } 
        });

        // C. Create Ledger Entry (DEBIT)
        // Forensic Telemetry: Append the rate used to the description for historical audit.
        await createBalancedTransaction({
          organizationId: session.organizationId,
          description: `Utility Consumption: ${payload.utilityType} (${consumption.toFixed(2)} units @ $${effectiveRate.toFixed(3)})`,
          idempotencyKey,
          date: new Date(payload.date),
          entries: [
            {
              accountId: assetAccount?.id || '',
              type: 'DEBIT',
              amount: chargeAmount,
              tenantId: payload.tenantId,
              chargeId: charge.id
            },
            {
              accountId: incomeAccount?.id || '',
              type: 'CREDIT',
              amount: chargeAmount,
              tenantId: payload.tenantId
            }
          ]
        }, tx);

        revalidatePath(`/tenants/${payload.tenantId}`);
        revalidatePath('/reports/master-ledger');
        
        return { 
          success: true, 
          message: `Utility Recorded: ${consumption.toFixed(2)} units. Charge: $${chargeAmount.toFixed(2)} generated.` 
        };
      });

    } catch (e: any) {
      console.error('[UTILITY_ENGINE_FATAL]', e);
      return { success: false, message: e.message || "ERR_ENGINE_FAILURE" };
    }
  });
}
export async function applyLedgerAdjustment(payload: { 
  tenantId: string, 
  amount: number, 
  type: 'FEE' | 'WAIVER', 
  reason: string 
}) {
  const idempotencyKey = `ADJUSTMENT_${payload.tenantId}_${payload.type}_${payload.amount}_${Date.now()}`;
  
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      if (payload.amount <= 0) throw new Error("ERR_PROTOCOL_VIOLATION: Adjustment amount must be greater than 0.");
      if (!payload.reason || payload.reason.length < 5) throw new Error("ERR_PROTOCOL_VIOLATION: Valid reason required (min 5 chars).");

      const { prisma } = await import('@/lib/prisma');
      const { createBalancedTransaction } = await import('@/src/services/finance/core');

      return await prisma.$transaction(async (tx: any) => {
        // 1. RESOLVE ACTIVE LEASE
        const activeLease = await tx.lease.findFirst({
          where: { tenantId: payload.tenantId, isActive: true, organizationId: session.organizationId }
        });

        // 2. CREATE CHARGE RECORD
        // FEE = Standard Charge (Debit)
        // WAIVER = Credit Charge (acts as negative debt)
        const charge = await tx.charge.create({
          data: {
            organizationId: session.organizationId,
            tenantId: payload.tenantId,
            leaseId: activeLease?.id || '',
            type: payload.type === 'FEE' ? 'LATE_FEE' : 'CREDIT',
            amount: payload.amount,
            dueDate: new Date(),
            isFullyPaid: false
          }
        });

        // 3. RESOLVE ACCOUNTS
        const assetAccount = await tx.account.findFirst({ where: { category: 'ASSET', organizationId: session.organizationId } });
        const revenueAccount = await tx.account.findFirst({ where: { category: 'INCOME', organizationId: session.organizationId } });

        // 4. INJECT LEDGER ENTRY
        // FEE: DEBIT Asset (Receivable), CREDIT Revenue
        // WAIVER: CREDIT Asset (Receivable), DEBIT Revenue (Contrar-revenue)
        await createBalancedTransaction({
          organizationId: session.organizationId,
          description: `Manual Adjustment [${payload.type}]: ${payload.reason}`,
          idempotencyKey,
          date: new Date(),
          entries: [
            {
              accountId: assetAccount?.id || '',
              type: payload.type === 'FEE' ? 'DEBIT' : 'CREDIT',
              amount: payload.amount,
              tenantId: payload.tenantId,
              chargeId: charge.id
            },
            {
              accountId: revenueAccount?.id || '',
              type: payload.type === 'FEE' ? 'CREDIT' : 'DEBIT',
              amount: payload.amount,
              tenantId: payload.tenantId
            }
          ]
        }, tx);

        // 5. AUDIT LOG
        await tx.auditLog.create({
          data: {
            organization: { connect: { id: session.organizationId } },
            user: { connect: { id: session.userId || 'SYSTEM' } },
            action: 'LEDGER_ADJUSTMENT',
            entityId: payload.tenantId,
            entityType: 'TENANT',
            metadata: {
              type: payload.type,
              amount: payload.amount,
              reason: payload.reason,
              chargeId: charge.id
            }
          }
        });

        revalidatePath(`/tenants/${payload.tenantId}`);
        revalidatePath('/reports/master-ledger');

        return { success: true, message: `${payload.type} of $${payload.amount.toFixed(2)} applied to ledger.` };
      });

    } catch (e: any) {
      console.error('[FINANCE_ADJUSTMENT_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_FAILURE" };
    }
  });
}
export async function reverseLedgerTransaction(payload: { entryId: string, reason: string }) {
  const idempotencyKey = `REVERSAL_${payload.entryId}_${Date.now()}`;
  
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      if (!payload.reason || payload.reason.length < 5) throw new Error("ERR_PROTOCOL_VIOLATION: Valid reversal reason required (min 5 chars).");

      const { prisma } = await import('@/lib/prisma');
      const { createBalancedTransaction } = await import('@/src/services/finance/core');

      return await prisma.$transaction(async (tx: any) => {
        // 1. FETCH ORIGINAL ENTRY
        const original = await tx.ledgerEntry.findUnique({
          where: { id: payload.entryId, organizationId: session.organizationId },
          include: { account: true }
        });

        if (!original) throw new Error("ERR_TARGET_LOST: Original ledger entry not found.");

        // 2. CALCULATE INVERSION
        const invertedType = original.type === 'DEBIT' ? 'CREDIT' : 'DEBIT';

        // 3. CREATE BALANCED REVERSAL
        // We create a dual entry to keep the ledger balanced.
        // If we are reversing a DEBIT to Asset, we CREDIT Asset and DEBIT the counterparty (Revenue/Cash).
        
        // Find the "sister" entry in the same transaction to know what to reverse on the other side
        const sister = await tx.ledgerEntry.findFirst({
          where: { 
            transactionId: original.transactionId, 
            id: { not: original.id } 
          }
        });

        if (!sister) throw new Error("ERR_TRANSACTION_CORRUPTED: Sister entry not found for balance correction.");

        await createBalancedTransaction({
          organizationId: session.organizationId,
          description: `REVERSAL: [${original.description}] - Reason: ${payload.reason}`,
          idempotencyKey,
          date: new Date(),
          entries: [
            {
              accountId: original.accountId,
              type: invertedType,
              amount: original.amount,
              tenantId: original.tenantId,
              chargeId: original.chargeId
            },
            {
              accountId: sister.accountId,
              type: sister.type === 'DEBIT' ? 'CREDIT' : 'DEBIT',
              amount: sister.amount,
              tenantId: sister.tenantId,
              chargeId: sister.chargeId
            }
          ]
        }, tx);

        // 4. AUDIT LOG
        await tx.auditLog.create({
          data: {
            organization: { connect: { id: session.organizationId } },
            user: { connect: { id: session.userId || 'SYSTEM' } },
            action: 'LEDGER_REVERSAL',
            entityId: payload.entryId,
            entityType: 'LEDGER_ENTRY',
            metadata: {
              originalEntryId: payload.entryId,
              transactionId: original.transactionId,
              reason: payload.reason
            }
          }
        });

        revalidatePath(`/tenants/${original.tenantId}`);
        revalidatePath('/reports/master-ledger');

        return { success: true, message: "Transaction reversal appended to ledger." };
      });

    } catch (e: any) {
      console.error('[LEDGER_REVERSAL_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_FAILURE" };
    }
  });
}
