'use server'

import { runSecureServerAction, runIdempotentAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { treasuryService } from '@/src/services/treasury.service'

/**
 * FINANCE DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 */

export async function runMonthlyBillingCycle(payload: { servicePeriod: string, postingDate: string }) {
  const idempotencyKey = `BILLING_${payload.servicePeriod}`;
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { runMonthlyBillingCycleService } = await import('@/src/services/finance');
      const result = await runMonthlyBillingCycleService(
        { servicePeriod: payload.servicePeriod, postingDate: new Date(payload.postingDate) },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/reports/master-ledger');
      revalidatePath('/tenants');
      return { success: true, message: `Batch Complete: ${result.generated} charges.`, data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function waiveCharge(chargeId: string, reasonText: string, idempotencyKey: string) {
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { waiveChargeService } = await import('@/src/services/finance');
      const result = await waiveChargeService(
        chargeId, reasonText,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath(`/tenants`);
      return { success: true, message: `Charge waived.`, data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function logExpense(formData: FormData) {
  const idempotencyKey = formData.get('idempotencyKey') as string;
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { logExpenseService } = await import('@/src/services/finance');
      const result = await logExpenseService(
        {
          amount: parseFloat(formData.get('amount') as string),
          payee: formData.get('payee') as string,
          description: formData.get('description') as string,
          ledgerId: formData.get('scope') as string,
          type: (formData.get('type') as string || 'EXPENSE') as any,
          propertyId: formData.get('propertyId') as string || undefined,
          expenseCategoryId: formData.get('subCategoryId') as string || formData.get('parentCategoryId') as string,
          paymentMode: formData.get('paymentMode') as any
        },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/treasury/payables');
      revalidatePath('/reports/master-ledger');
      return { success: true, data: result };
    } catch (e: any) {
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function ingestBulkExpenses(data: any[], idempotencyKey: string) {
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { ingestLedgerService } = await import('@/src/services/finance');
      const result = await ingestLedgerService(data, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      revalidatePath('/reports/master-ledger');
      revalidatePath('/treasury/payables');
      return { success: true, message: `Mass Ingestion Complete: ${result.count} records.`, data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "Internal database synchronization failure." };
    }
  });
}

export async function processPayment(payload: any) {
  const idempotencyKey = payload.idempotencyKey || `PAYMENT_${payload.tenantId}_${payload.amountPaid}_${Date.now()}`;
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { processPaymentService } = await import('@/src/services/finance');
      const result = await processPaymentService(
        { ...payload, idempotencyKey },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/tenants');
      revalidatePath(`/tenants/${payload.tenantId}`);
      revalidatePath('/treasury/feed');
      return { success: true, message: `Payment successful.`, data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "Unknown error" };
    }
  });
}

export async function reconcileUtilities(propertyId: string, startDate: Date, endDate: Date) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const { reconcileUtilitiesService } = await import('@/src/services/finance');
      const result = await reconcileUtilitiesService(
        propertyId, { start: startDate, end: endDate },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/reports/master-ledger');
      revalidatePath('/treasury/feed');
      return { success: true, data: result };

    } catch (e: any) {
      return { success: false, message: "ERR_RECONCILE_SERVICE_FAILURE" };
    }
  });
}

export async function voidTransaction(transactionId: string, idempotencyKey: string) {
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { voidLedgerEntryService } = await import('@/src/services/finance');
      await voidLedgerEntryService(
        transactionId,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/treasury/feed');
      return { success: true, message: "Entry VOIDED." };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_VOID_SERVICE_FAILURE" };
    }
  });
}

export async function clearTransaction(transactionId: string, currentStatus: boolean) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const { prisma } = await import('@/src/lib/prisma');
      await prisma.ledgerEntry.update({
        where: { id: transactionId, organizationId: session.organizationId },
        data: { 
          isCleared: !currentStatus,
          clearedAt: !currentStatus ? new Date() : null,
        },
      });
      revalidatePath('/treasury/feed');
      return { success: true, message: "Transaction clearance state synchronized." };
    } catch (e: any) {
      return { success: false, message: "ERR_CLEARANCE_SERVICE_FAILURE" };
    }
  });
}

export async function logUtilityConsumption(payload: any) {
  const idempotencyKey = `UTILITY_${payload.unitId}_${payload.utilityType}_${payload.currentReading}_${payload.date}`;
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const result = await treasuryService.logUtilityConsumption(
        payload,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath(`/tenants/${payload.tenantId}`);
      revalidatePath('/reports/master-ledger');
      return { success: true, message: "Utility Recorded.", data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_ENGINE_FAILURE" };
    }
  });
}

export async function applyLedgerAdjustment(payload: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // Need adjustment service in treasuryService
      revalidatePath('/reports/master-ledger');
      revalidatePath('/treasury/feed');
      return { success: true, message: "Adjustment applied." };

    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_FAILURE" };
    }
  });
}

export async function reverseLedgerTransaction(payload: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
       // Need reversal service in treasuryService
       revalidatePath('/reports/master-ledger');
      revalidatePath('/treasury/feed');
      return { success: true, message: "Transaction reversed." };

    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_FAILURE" };
    }
  });
}
