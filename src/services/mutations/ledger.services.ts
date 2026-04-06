import { getSovereignClient } from "@/src/lib/db";
import { calculateWaterfallDistribution } from "@/src/core/algorithms/finance";
import { Prisma } from "@prisma/client";
import { AccountCategory } from "@/src/schema/enums";
import { randomUUID } from "crypto";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * LEDGER MUTATION SERVICE (SOVEREIGN EDITION)
 * 
 * Orchestrates atomic financial transactions with absolute data integrity.
 * 
 * Mandate: 
 * 1. Decimal-Safe Math (Prisma.Decimal).
 * 2. Automated Surveillance via Shielded Client.
 * 3. Atomic Multi-Step Transactions.
 */

/**
 * Processes a tenant payment through the FIFO Waterfall Distribution.
 */
export async function processPaymentService(
  payload: {
    tenantId: string;
    amountPaid: number;
    transactionDate: Date;
    paymentMode: string;
    referenceText?: string;
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const amountToApply = new Prisma.Decimal(payload.amountPaid);
    if (amountToApply.lte(0)) {
       throw new Error("ERR_FISCAL_BREACH: Payment amount must be absolute positive.");
    }

    // 1. Fetch Tenant and Outstanding Charges
    const tenant = await tx.tenant.findUnique({
      where: { id: payload.tenantId, organizationId: context.organizationId },
      include: {
        charges: {
          where: { isFullyPaid: false, amount: { gt: 0 }, organizationId: context.organizationId }, 
          include: { lease: true }
        }
      }
    });

    if (!tenant) throw new Error("ERR_TENANT_RECORD_ABSENT");

    // 2. Execute Algorithm: Waterfall Distribution
    const { distributions, remainingCredit } = calculateWaterfallDistribution(
      amountToApply,
      tenant.charges
    );

    // 3. Materialize Charge Updates
    for (const distro of distributions) {
      await tx.charge.update({
        where: { id: distro.id, organizationId: context.organizationId },
        data: {
          amountPaid: { increment: distro.amountToApply },
          isFullyPaid: distro.isFullyPaid
        }
      });
    }

    // 4. Handle Overpayment (Credit Materialization)
    if (remainingCredit.gt(0)) {
      const activeLease = await tx.lease.findFirst({ 
        where: { tenantId: tenant.id, isActive: true, isPrimary: true } 
      }) || await tx.lease.findFirst({ 
        where: { tenantId: tenant.id, isActive: true } 
      });

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

    // 5. Locate/Materialize Core Accounts (Registry Sync)
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

    // 6. Double-Entry Ledger Commitment
    const transactionId = randomUUID();
    
    // DEBIT ASSET
    await tx.ledgerEntry.create({
      data: {
        organizationId: context.organizationId,
        transactionId,
        accountId: assetAccount.id,
        tenantId: tenant.id,
        amount: amountToApply,
        date: new Date(),
        transactionDate: payload.transactionDate,
        description: `Payment from ${tenant.name} (${payload.paymentMode}) - REF: ${payload.referenceText || 'NONE'}`,
        paymentMode: payload.paymentMode as any,
        referenceText: payload.referenceText
      }
    });

    // CREDIT REVENUE
    await tx.ledgerEntry.create({
      data: {
        organizationId: context.organizationId,
        transactionId,
        accountId: revenueAccount.id,
        tenantId: tenant.id,
        amount: amountToApply.negated(),
        date: new Date(),
        transactionDate: payload.transactionDate,
        description: `Revenue recognized via ${tenant.name}`,
        paymentMode: payload.paymentMode as any,
        referenceText: payload.referenceText
      }
    });

    // 7. Audit Surveillance
    await recordAuditLog({
      action: 'PAYMENT',
      entityType: 'LEDGER_ENTRY',
      entityId: transactionId,
      metadata: { amount: amountToApply.toNumber(), tenantId: payload.tenantId },
      tx: tx as any
    });

    return { transactionId, appliedCount: distributions.length, remainingCredit: remainingCredit.toNumber() };
  });
}

/**
 * Logs a manual expense or income entry into the ledger with strict 
 * sign-convention enforcement and asset account synchronization.
 */
export async function logExpenseService(
  payload: {
    amount: number;
    payee: string;
    description: string;
    ledgerId: string;
    type: 'INCOME' | 'EXPENSE';
    propertyId?: string;
    expenseCategoryId: string;
    paymentMode: string;
  },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);
  const transactionId = randomUUID();
  const date = new Date();

  // SIGN CONVENTION: INCOME (+) | EXPENSE (-)
  const finalAmount = payload.type === 'INCOME' 
    ? new Prisma.Decimal(payload.amount).abs() 
    : new Prisma.Decimal(payload.amount).abs().negated();

  return await db.$transaction(async (tx: any) => {
    const account = await tx.account.findFirst({
      where: { category: AccountCategory.ASSET, organizationId: context.organizationId }
    });

    if (!account) throw new Error("ERR_REGISTRY_SYNC: No primary asset account for treasury synchronization.");

    const entry = await tx.ledgerEntry.create({
      data: {
        organizationId: context.organizationId,
        transactionId,
        accountId: account.id,
        amount: finalAmount,
        date,
        transactionDate: date,
        description: payload.description,
        payee: payload.payee,
        propertyId: payload.propertyId,
        expenseCategoryId: payload.expenseCategoryId,
        paymentMode: payload.paymentMode as any
      }
    });

    await recordAuditLog({
      action: 'CREATE',
      entityType: payload.type === 'INCOME' ? 'REVENUE' : 'EXPENSE',
      entityId: entry.id,
      metadata: { amount: finalAmount.toNumber(), payee: payload.payee, type: payload.type },
      tx: tx as any
    });

    return { entryId: entry.id, transactionId };
  });
}

/**
 * Waives a charge balance for a tenant, creating a non-repudiable audit trace.
 */
export async function waiveChargeService(
  chargeId: string,
  reasonText: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  return await db.$transaction(async (tx: any) => {
    const charge = await tx.charge.findUnique({ 
      where: { id: chargeId, organizationId: context.organizationId } 
    });

    if (!charge) throw new Error("ERR_CHARGE_ABSENT");
    
    const balance = charge.amount.minus(charge.amountPaid);
    if (balance.lte(0)) throw new Error("ERR_FISCAL_CONFLICT: Charge already satisfied.");

    await tx.charge.update({
      where: { id: chargeId },
      data: {
        amountPaid: charge.amount,
        isFullyPaid: true
      }
    });

    // Detailed Audit for Waive-off (Governance Protocol)
    await recordAuditLog({
      action: 'UPDATE',
      entityType: 'CHARGE',
      entityId: chargeId,
      metadata: { action: 'WAIVE_OFF', balanceWaived: balance.toNumber(), reason: reasonText },
      tx: tx as any
    });

    return { success: true, waived: balance.toNumber() };
  });
}

/**
 * Reconciles utility recovery metrics for a given property.
 */
export async function reconcileUtilitiesService(
  propertyId: string, 
  dateRange: { start: Date, end: Date },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.operatorId);

  const expenseAccounts = await db.account.findMany({
    where: { category: AccountCategory.EXPENSE, name: { contains: 'Master' }, organizationId: context.organizationId }
  });

  const incomeAccounts = await db.account.findMany({
    where: { category: AccountCategory.INCOME, name: { contains: 'Utility Recovery' }, organizationId: context.organizationId }
  });

  const expenseAgg = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: {
      organizationId: context.organizationId,
      accountId: { in: expenseAccounts.map((a: { id: string }) => a.id) },
      date: { gte: dateRange.start, lte: dateRange.end }
    }
  });

  const incomeAgg = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: {
      organizationId: context.organizationId,
      accountId: { in: incomeAccounts.map((a: { id: string }) => a.id) },
      date: { gte: dateRange.start, lte: dateRange.end }
    }
  });

  const totalExpense = expenseAgg._sum.amount ? new Prisma.Decimal(expenseAgg._sum.amount) : new Prisma.Decimal(0);
  const totalRecovery = incomeAgg._sum.amount ? new Prisma.Decimal(incomeAgg._sum.amount).abs() : new Prisma.Decimal(0);

  const delta = totalExpense.minus(totalRecovery);
  const rate = totalExpense.gt(0) ? totalRecovery.dividedBy(totalExpense).times(100) : new Prisma.Decimal(0);

  return {
    totalExpense: totalExpense.toNumber(),
    totalRecovery: totalRecovery.toNumber(),
    unrecoveredDelta: delta.toNumber(),
    recoveryRate: rate.toNumber()
  };
}
