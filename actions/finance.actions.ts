'use server'

import { runSecureServerAction, runIdempotentAction } from '@/lib/auth-utils'
import { revalidatePath, revalidateTag } from 'next/cache'
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
      revalidateTag(`org-${session.organizationId}-analytics`, 'max');
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
      revalidateTag(`org-${session.organizationId}-analytics`, 'max');
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
      const { assetService } = await import('@/src/services/asset.service');
      
      const propertyId = formData.get('propertyId') as string;
      const unitId = formData.get('unitId') as string;

      if (propertyId) {
        const property = await assetService.getPropertySovereignView(propertyId, session.organizationId);
        if (property?.status === 'DECOMMISSIONED') {
          throw new Error("GOVERNANCE_HALT: Financial ledger is locked for decommissioned properties.");
        }
      }

      if (unitId) {
        const { prisma } = await import('@/src/lib/prisma');
        const unit = await prisma.unit.findUnique({ where: { id: unitId, organizationId: session.organizationId } });
        if (unit?.maintenanceStatus === 'DECOMMISSIONED') {
          throw new Error("GOVERNANCE_HALT: Financial ledger is locked for decommissioned units.");
        }
      }

      const result = await logExpenseService(
        {
          amount: parseFloat(formData.get('amount') as string),
          payee: formData.get('payee') as string,
          description: formData.get('description') as string,
          ledgerId: formData.get('scope') as string,
          type: (formData.get('type') as string || 'EXPENSE') as any,
          propertyId: formData.get('propertyId') as string || undefined,
          unitId: formData.get('unitId') as string || undefined,
          expenseCategoryId: formData.get('subCategoryId') as string || formData.get('parentCategoryId') as string,
          paymentMode: formData.get('paymentMode') as any
        },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/treasury/payables');
      revalidatePath('/reports/master-ledger');
      revalidateTag(`org-${session.organizationId}-analytics`, 'max');
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
      revalidateTag(`org-${session.organizationId}-analytics`, 'max');
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
      const { prisma } = await import('@/src/lib/prisma');

      // Governance Check: Verify Unit/Property status
      if (payload.unitId) {
        const unit = await prisma.unit.findUnique({ 
          where: { id: payload.unitId, organizationId: session.organizationId },
          include: { property: { select: { status: true } } }
        });
        if (unit?.maintenanceStatus === 'DECOMMISSIONED' || unit?.property?.status === 'DECOMMISSIONED') {
          throw new Error("GOVERNANCE_HALT: Financial transactions are suspended for decommissioned assets.");
        }
      } else if (payload.tenantId) {
        const tenant = await prisma.tenant.findUnique({
          where: { id: payload.tenantId, organizationId: session.organizationId },
          include: { leases: { where: { isActive: true }, include: { unit: { include: { property: { select: { status: true } } } } } } }
        });
        const activeUnit = tenant?.leases[0]?.unit;
        if (activeUnit?.maintenanceStatus === 'DECOMMISSIONED' || activeUnit?.property?.status === 'DECOMMISSIONED') {
          throw new Error("GOVERNANCE_HALT: Financial transactions are suspended for decommissioned assets.");
        }
      }

      const result = await processPaymentService(
        { ...payload, unitId: payload.unitId, idempotencyKey },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/tenants');
      revalidatePath(`/tenants/${payload.tenantId}`);
      revalidatePath('/treasury/feed');
      revalidateTag(`org-${session.organizationId}-analytics`, 'max');
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
  // BYPASS POISONED CACHE: Adding a salt to the key to ensure the new validation logic is executed
  const idempotencyKey = `UTILITY_V2_${payload.unitId}_${payload.utilityType}_${payload.currentReading}_${Date.now()}`;
  return runIdempotentAction(idempotencyKey, 'MANAGER', async (session) => {
    try {
      const { assetService } = await import('@/src/services/asset.service');
      // Governance Check: Verify the property is operational
      if (payload.unitId) {
        const unit = await prisma.unit.findUnique({ where: { id: payload.unitId }, select: { property: { select: { status: true } } } });
        if (unit?.property?.status === 'DECOMMISSIONED') {
          throw new Error("GOVERNANCE_HALT: Utility reconciliation is suspended for decommissioned assets.");
        }
      }

      const result = await treasuryService.logUtilityConsumption(
        payload,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath(`/tenants/${payload.tenantId}`);
      revalidatePath('/reports/master-ledger');
      return { success: true, message: result.message || "Utility Recorded.", data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_ENGINE_FAILURE" };
    }
  });
}

export async function applyLedgerAdjustment(payload: { tenantId: string, amount: number, type: 'FEE' | 'WAIVER', reason: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await treasuryService.applyLedgerAdjustment(payload, {
        operatorId: session.userId,
        organizationId: session.organizationId
      });
      
      revalidatePath(`/tenants/${payload.tenantId}`);
      revalidatePath('/reports/master-ledger');
      revalidatePath('/treasury/feed');
      return { success: true, message: "Adjustment applied successfully." };

    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_FAILURE" };
    }
  });
}

export async function reverseLedgerTransaction(payload: { entryId: string, tenantId?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await treasuryService.reverseLedgerTransaction(payload.entryId, {
        operatorId: session.userId,
        organizationId: session.organizationId
      });

      if (payload.tenantId) revalidatePath(`/tenants/${payload.tenantId}`);
      revalidatePath('/reports/master-ledger');
      revalidatePath('/treasury/feed');
      return { success: true, message: "Transaction reversed and audit trail updated." };

    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_FAILURE" };
    }
  });
}
