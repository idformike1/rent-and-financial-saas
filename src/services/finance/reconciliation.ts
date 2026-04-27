import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { AccountCategory } from "@/src/schema/enums";
import { recordAuditLog } from "@/lib/audit-logger";
import { calculateWaterfallDistribution } from "@/src/core/algorithms/finance";
import { createBalancedTransaction } from "./core";

/**
 * FINANCE PAYMENT & RECONCILIATION LOGIC
 * 
 * Orchestrates payment waterfalls and fiscal account reconciliation.
 */

export async function processPaymentService(
  payload: {
    tenantId: string;
    amountPaid: number;
    transactionDate: Date | string;
    paymentMode: string;
    referenceText?: string;
    idempotencyKey?: string;
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  // 1. IDEMPOTENCY LOCK (Backend Enforcement)
  if (payload.idempotencyKey) {
    const existing = await db.transaction.findUnique({
      where: { idempotencyKey: payload.idempotencyKey }
    });
    if (existing) {
      throw new Error(`ERR_IDEMPOTENCY_CONFLICT: Transaction ${payload.idempotencyKey} already exists. Aborting to prevent double-recording.`);
    }
  }

  return await db.$transaction(async (tx: any) => {
    const amountToApply = new Prisma.Decimal(payload.amountPaid);
    if (amountToApply.lte(0)) throw new Error("ERR_FISCAL_BREACH: Payment amount must be absolute positive.");

    // 1. RETRIEVE FISCAL OBLIGATIONS (WATERFALL TARGETS)
    const tenant = await tx.tenant.findFirst({
      where: { id: payload.tenantId, organizationId: context.organizationId },
      include: {
        charges: {
          where: { 
            isFullyPaid: false, 
            amount: { gt: 0 }, 
            organizationId: context.organizationId,
            type: { not: 'CREDIT' } // Credits are not payment targets
          },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!tenant) throw new Error("ERR_TENANT_RECORD_ABSENT");

    // 2. EXECUTE WATERFALL ALGORITHM
    const { distributions, remainingCredit } = calculateWaterfallDistribution(amountToApply, tenant.charges);

    const ledgerEntries: any[] = [];
    const assetAccount = await tx.account.findFirst({
      where: { category: AccountCategory.ASSET, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "GENERAL OPERATING CASH", category: AccountCategory.ASSET, organizationId: context.organizationId }
    });

    const revenueAccount = await tx.account.findFirst({
      where: { category: AccountCategory.INCOME, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "GENERAL OPERATING REVENUE", category: AccountCategory.INCOME, organizationId: context.organizationId }
    });

    // ── DEBIT ENTRY (CASH INFLOW) ───────────────────────────────────────
    ledgerEntries.push({
      accountId: assetAccount.id,
      type: 'DEBIT',
      amount: amountToApply,
      paymentMode: payload.paymentMode as any,
      referenceText: payload.referenceText
    });

    // 3. MATERIALIZE DISTRIBUTIONS (PRIORITY LIQUIDATION)
    for (const distro of distributions) {
      // Update Charge state
      await tx.charge.updateMany({
        where: { id: distro.id, organizationId: context.organizationId },
        data: {
          amountPaid: { increment: distro.amountToApply },
          isFullyPaid: distro.isFullyPaid
        }
      });

      // Create Linked Ledger Credit
      ledgerEntries.push({
        accountId: revenueAccount.id,
        type: 'CREDIT',
        amount: distro.amountToApply,
        tenantId: tenant.id,
        chargeId: distro.id,
        paymentMode: payload.paymentMode as any,
        referenceText: `Waterfall Liquidation: ${distro.id}`
      });
    }

    // 4. HANDLE OVERPAYMENT (UNAPPLIED CREDIT)
    if (remainingCredit.gt(0)) {
      ledgerEntries.push({
        accountId: revenueAccount.id,
        type: 'CREDIT',
        amount: remainingCredit,
        tenantId: tenant.id,
        paymentMode: payload.paymentMode as any,
        referenceText: "Unapplied Credit / Prepaid Rent"
      });
    }

    // 5. ATOMIC LEDGER COMMIT
    const transaction = await createBalancedTransaction({
      organizationId: context.organizationId,
      description: `Waterfall Payment: ${tenant.name} - REF: ${payload.referenceText || 'NONE'}`,
      date: new Date(payload.transactionDate),
      idempotencyKey: payload.idempotencyKey,
      entries: ledgerEntries
    }, tx);

    await recordAuditLog({
      action: 'PAYMENT',
      entityType: 'LEDGER_ENTRY',
      entityId: transaction.id,
      metadata: { 
        amount: amountToApply.toNumber(), 
        tenantId: payload.tenantId, 
        liquidatedCount: distributions.length,
        remainingCredit: remainingCredit.toNumber() 
      },
      tx: tx as any
    });

    return { 
      transactionId: transaction.id, 
      appliedCount: distributions.length, 
      remainingCredit: remainingCredit.toNumber(),
      summary: `Cleared ${distributions.length} charges. Overpayment: $${remainingCredit.toFixed(2)}`
    };
  }, { maxWait: 5000, timeout: 15000 });
}
