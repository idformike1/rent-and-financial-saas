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
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const amountToApply = new Prisma.Decimal(payload.amountPaid);
    if (amountToApply.lte(0)) throw new Error("ERR_FISCAL_BREACH: Payment amount must be absolute positive.");

    const tenant = await tx.tenant.findFirst({
      where: { id: payload.tenantId, organizationId: context.organizationId },
      include: {
        charges: {
          where: { isFullyPaid: false, amount: { gt: 0 }, organizationId: context.organizationId },
          include: { lease: true },
          orderBy: { dueDate: 'asc' }
        }
      }
    });

    if (!tenant) throw new Error("ERR_TENANT_RECORD_ABSENT");

    const { distributions, remainingCredit } = calculateWaterfallDistribution(amountToApply, tenant.charges);

    for (const distro of distributions) {
      await tx.charge.updateMany({
        where: { id: distro.id, organizationId: context.organizationId },
        data: {
          amountPaid: { increment: distro.amountToApply },
          isFullyPaid: distro.isFullyPaid
        }
      });
    }

    if (remainingCredit.gt(0)) {
      const activeLease = await tx.lease.findFirst({
        where: { tenantId: tenant.id, isActive: true, isPrimary: true }
      }) || await tx.lease.findFirst({ where: { tenantId: tenant.id, isActive: true } });

      if (activeLease) {
        await tx.charge.create({
          data: {
            organizationId: context.organizationId,
            tenantId: tenant.id,
            leaseId: activeLease.id,
            type: 'CREDIT',
            amount: remainingCredit.negated(),
            amountPaid: 0,
            dueDate: new Date(),
            isFullyPaid: false,
          }
        });
      }
    }

    const assetAccount = await tx.account.findFirst({
      where: { category: AccountCategory.ASSET, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "GENERAL CASH-ON-HAND", category: AccountCategory.ASSET, organizationId: context.organizationId }
    });

    const revenueAccount = await tx.account.findFirst({
      where: { category: AccountCategory.INCOME, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "GENERAL OPERATING REVENUE (AUTO)", category: AccountCategory.INCOME, organizationId: context.organizationId }
    });

    const transaction = await createBalancedTransaction({
      organizationId: context.organizationId,
      description: `Payment from ${tenant.name} - REF: ${payload.referenceText || 'NONE'}`,
      date: new Date(payload.transactionDate),
      entries: [
        {
          accountId: assetAccount.id,
          type: 'DEBIT',
          amount: amountToApply,
          tenantId: tenant.id,
          paymentMode: payload.paymentMode as any,
          referenceText: payload.referenceText
        },
        {
          accountId: revenueAccount.id,
          type: 'CREDIT',
          amount: amountToApply,
          tenantId: tenant.id,
          paymentMode: payload.paymentMode as any,
          referenceText: payload.referenceText
        }
      ]
    }, tx);

    await recordAuditLog({
      action: 'PAYMENT',
      entityType: 'LEDGER_ENTRY',
      entityId: transaction.id,
      metadata: { amount: amountToApply.toNumber(), tenantId: payload.tenantId, reference: payload.referenceText },
      tx: tx as any
    });

    return { transactionId: transaction.id, appliedCount: distributions.length, remainingCredit: remainingCredit.toNumber() };
  });
}
