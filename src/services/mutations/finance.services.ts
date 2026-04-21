import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { AccountCategory, PaymentMode, EntryType } from "@/src/schema/enums";
import { randomUUID } from "crypto";
import { recordAuditLog } from "@/lib/audit-logger";
import { calculateWaterfallDistribution } from "@/src/core/algorithms/finance";

/**
 * FINANCE MUTATION SERVICE (SOVEREIGN AUTHORITY)
 * 
 * Orchestrates all fiscal commands including Billing Cycles, 
 * Bulk Ingestion, Payment Processing, and Ledger Reconciliation.
 * 
 * Mandate:
 * 1. Decimal-Safe Math (Prisma.Decimal).
 * 2. Non-Repudiable Audit Logging.
 * 3. Atomic Multi-Step Transactions.
 */

/* ── 0. THE ZERO-SUM ENFORCER ─────────────────────────────────────────── */

export async function createBalancedTransaction(
  payload: {
    organizationId: string;
    description: string;
    idempotencyKey?: string;
    date?: Date;
    entries: {
      accountId: string;
      amount: Prisma.Decimal | number;
      type: 'DEBIT' | 'CREDIT';
      tenantId?: string;
      propertyId?: string;
      expenseCategoryId?: string;
      payee?: string;
      paymentMode?: PaymentMode;
      referenceText?: string;
    }[];
  },
  existingTx?: any
) {
  const db = getSovereignClient(payload.organizationId);
  const runner = existingTx || db;

  // 1. Zero-Sum Math Verification
  let totalDebit = new Prisma.Decimal(0);
  let totalCredit = new Prisma.Decimal(0);

  for (const entry of payload.entries) {
    const amt = new Prisma.Decimal(entry.amount).abs();
    if (entry.type === 'DEBIT') totalDebit = totalDebit.add(amt);
    if (entry.type === 'CREDIT') totalCredit = totalCredit.add(amt);
  }

  if (!totalDebit.equals(totalCredit)) {
    throw new Error(
      `ERR_ZERO_SUM_VIOLATION: Transaction is not balanced. ` +
      `Debits: ${totalDebit.toString()}, Credits: ${totalCredit.toString()}`
    );
  }

  // 2. Atomic Execution with Idempotency
  return await runner.$transaction(async (tx: any) => {
    if (payload.idempotencyKey) {
      const existing = await tx.transaction.findUnique({
        where: { idempotencyKey: payload.idempotencyKey },
        include: { entries: true }
      });
      if (existing) return existing;
    }

    const transaction = await tx.transaction.create({
      data: {
        organizationId: payload.organizationId,
        idempotencyKey: payload.idempotencyKey,
        description: payload.description,
        date: payload.date || new Date(),
      }
    });

    for (const entry of payload.entries) {
      await tx.ledgerEntry.create({
        data: {
          organizationId: payload.organizationId,
          transactionId: transaction.id,
          accountId: entry.accountId,
          type: entry.type as EntryType,
          amount: new Prisma.Decimal(entry.amount),
          date: payload.date || new Date(),
          transactionDate: payload.date || new Date(),
          description: payload.description,
          tenantId: entry.tenantId,
          propertyId: entry.propertyId,
          expenseCategoryId: entry.expenseCategoryId,
          payee: entry.payee,
          paymentMode: entry.paymentMode || PaymentMode.CASH,
          referenceText: entry.referenceText,
        }
      });
    }

    return transaction;
  });
}

/* ── 1. BILLING CYCLE ORCHESTRATION ───────────────────────────────────────── */

export async function runMonthlyBillingCycleService(
  targetDate: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);
  const targetTime = new Date(targetDate);
  const startOfMonth = new Date(targetTime.getFullYear(), targetTime.getMonth(), 1);
  const endOfMonth = new Date(targetTime.getFullYear(), targetTime.getMonth() + 1, 0);

  return await db.$transaction(async (tx: any) => {
    const activeLeases = await tx.lease.findMany({
      where: { isActive: true, organizationId: context.organizationId },
      include: { unit: true }
    });

    let generatedCount = 0;
    let bypassedCount = 0;
    const generatedIds: string[] = [];

    for (const lease of activeLeases) {
      if (lease.unit.maintenanceStatus === 'DECOMMISSIONED') {
        bypassedCount++;
        continue;
      }

      const existingCharge = await tx.charge.findFirst({
        where: {
          leaseId: lease.id,
          type: 'RENT',
          dueDate: { gte: startOfMonth, lte: endOfMonth },
          organizationId: context.organizationId
        }
      });

      if (!existingCharge) {
        const charge = await tx.charge.create({
          data: {
            organizationId: context.organizationId,
            tenantId: lease.tenantId,
            leaseId: lease.id,
            type: 'RENT',
            amount: lease.rentAmount,
            dueDate: startOfMonth,
            isFullyPaid: false
          }
        });
        generatedCount++;
        generatedIds.push(charge.id);
      }
    }

    if (generatedCount > 0) {
      await recordAuditLog({
        action: 'CREATE',
        entityType: 'CHARGE',
        entityId: `BILLING_CYCLE_${startOfMonth.toISOString()}`,
        metadata: { cycleStart: startOfMonth, generated: generatedCount, recordIds: generatedIds },
        tx: tx as any
      });
    }

    return { generated: generatedCount, bypassed: bypassedCount };
  });
}

/* ── 2. MASS DATA INGESTION ─────────────────────────────────────────────── */

export async function ingestLedgerService(
  records: any[],
  context: { operatorId: string; organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);
  const totalVolume = records.reduce((sum, r) => sum + Math.abs(Number(r.amount)), 0);
  const entriesCreated: string[] = [];

  return await db.$transaction(async (tx: any) => {
    const expenseAccount = await tx.account.findFirst({
      where: { category: AccountCategory.EXPENSE, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "GENERAL EXPENSE (AUTO)", category: AccountCategory.EXPENSE, organizationId: context.organizationId }
    });

    const incomeAccount = await tx.account.findFirst({
      where: { category: AccountCategory.INCOME, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "GENERAL INCOME (AUTO)", category: AccountCategory.INCOME, organizationId: context.organizationId }
    });

    const assetAccount = await tx.account.findFirst({
      where: { category: AccountCategory.ASSET, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "OPERATING CASH (AUTO)", category: AccountCategory.ASSET, organizationId: context.organizationId }
    });

    for (const record of records) {
      const netAmount = new Prisma.Decimal(record.amount);
      const isOutflow = netAmount.lt(0);

      const transaction = await createBalancedTransaction({
        organizationId: context.organizationId,
        description: record.description || `Bulk Import: ${record.payee}`,
        date: record.date ? new Date(record.date) : new Date(),
        entries: [
          {
            accountId: isOutflow ? expenseAccount.id : assetAccount.id,
            type: 'DEBIT',
            amount: netAmount.abs(),
            payee: record.payee,
            paymentMode: record.paymentMode || PaymentMode.BANK
          },
          {
            accountId: isOutflow ? assetAccount.id : incomeAccount.id,
            type: 'CREDIT',
            amount: netAmount.abs(),
            payee: record.payee,
            paymentMode: record.paymentMode || PaymentMode.BANK
          }
        ]
      }, tx);

      entriesCreated.push(transaction.id);
    }

    await recordAuditLog({
      action: 'CREATE',
      entityType: 'LEDGER_ENTRY',
      entityId: `BULK_INGEST_${Date.now()}`,
      metadata: { count: records.length, totalVolume, ingressType: 'CSV_UPLOAD', transactionIds: entriesCreated },
      tx: tx as any
    });

    return { count: records.length, totalVolume };
  });
}

/* ── 3. PAYMENT PROCESSING (WATERFALL) ──────────────────────────────────── */

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

/* ── 4. EXPENSE LOGGING ─────────────────────────────────────────────────── */

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
  const db = getSovereignClient(context.organizationId);
  const date = new Date();

  return await db.$transaction(async (tx: any) => {
    const categoryAccount = await tx.account.findFirst({
      where: { category: payload.type === 'INCOME' ? AccountCategory.INCOME : AccountCategory.EXPENSE, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: {
        name: payload.type === 'INCOME' ? "GENERAL INCOME (AUTO)" : "GENERAL EXPENSE (AUTO)",
        category: payload.type === 'INCOME' ? AccountCategory.INCOME : AccountCategory.EXPENSE,
        organizationId: context.organizationId
      }
    });

    const assetAccount = await tx.account.findFirst({
      where: { category: AccountCategory.ASSET, organizationId: context.organizationId }
    }) || await tx.account.create({
      data: { name: "GENERAL CASH-ON-HAND", category: AccountCategory.ASSET, organizationId: context.organizationId }
    });

    const transaction = await createBalancedTransaction({
      organizationId: context.organizationId,
      description: payload.description,
      date,
      entries: [
        {
          accountId: payload.type === 'INCOME' ? assetAccount.id : categoryAccount.id,
          type: 'DEBIT',
          amount: new Prisma.Decimal(payload.amount).abs(),
          payee: payload.payee,
          propertyId: payload.propertyId,
          expenseCategoryId: payload.expenseCategoryId,
          paymentMode: payload.paymentMode as any
        },
        {
          accountId: payload.type === 'INCOME' ? categoryAccount.id : assetAccount.id,
          type: 'CREDIT',
          amount: new Prisma.Decimal(payload.amount).abs(),
          payee: payload.payee,
          propertyId: payload.propertyId,
          expenseCategoryId: payload.expenseCategoryId,
          paymentMode: payload.paymentMode as any
        }
      ]
    }, tx);

    await recordAuditLog({
      action: 'CREATE',
      entityType: payload.type === 'INCOME' ? 'REVENUE' : 'EXPENSE',
      entityId: transaction.id,
      metadata: { amount: payload.amount, payee: payload.payee, type: payload.type, category: payload.expenseCategoryId },
      tx: tx as any
    });

    return { entryId: transaction.id, transactionId: transaction.id };
  });
}

/* ── 5. CREDIT & WAIVERS ─────────────────────────────────────────────────── */

export async function waiveChargeService(
  chargeId: string,
  reasonText: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const charge = await tx.charge.findFirst({ where: { id: chargeId, organizationId: context.organizationId } });
    if (!charge) throw new Error("ERR_CHARGE_ABSENT");

    const balance = charge.amount.minus(charge.amountPaid);
    if (balance.lte(0)) throw new Error("ERR_FISCAL_CONFLICT: Charge already satisfied.");

    await tx.charge.updateMany({
      where: { id: chargeId, organizationId: context.organizationId },
      data: { amountPaid: charge.amount, isFullyPaid: true }
    });

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

/* ── 6. UTILITY RECONCILIATION ────────────────────────────────────────────── */

export async function reconcileUtilitiesService(
  propertyId: string,
  dateRange: { start: Date, end: Date },
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

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
      date: { gte: dateRange.start, lte: dateRange.end },
      status: 'ACTIVE'
    }
  });

  const incomeAgg = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: {
      organizationId: context.organizationId,
      accountId: { in: incomeAccounts.map((a: { id: string }) => a.id) },
      date: { gte: dateRange.start, lte: dateRange.end },
      status: 'ACTIVE'
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

/* ── 7. FORENSIC DECOMMISSIONING ─────────────────────────────────────────── */

/**
 * VOID LEDGER ENTRY SERVICE
 * 
 * Non-destructively decommissions a fiscal record.
 * Mandate: Atomic Status Update + Forensic Audit Signature.
 */
export async function voidLedgerEntryService(
  entryId: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    // 1. Fetch record for forensic snapshot
    const entry = await tx.ledgerEntry.findFirst({
      where: { id: entryId, organizationId: context.organizationId }
    });

    if (!entry) throw new Error("ERR_FISCAL_ABSENT: Target decommissioning record not found.");
    if (entry.status === 'VOIDED') throw new Error("ERR_STATE_CONFLICT: Record already decommissioned.");

    // 2. Execute Voiding
    await tx.ledgerEntry.updateMany({
      where: { id: entryId, organizationId: context.organizationId },
      data: { status: 'VOIDED' }
    });

    // 3. Dispatch Nuclear Purge Audit Signature
    await recordAuditLog({
      action: 'NUCLEAR_PURGE',
      entityType: 'LEDGER_ENTRY',
      entityId: entryId,
      metadata: {
        prevStatus: 'ACTIVE',
        amount: entry.amount.toNumber(),
        description: entry.description,
        payee: entry.payee,
        forensicTimestamp: new Date().toISOString()
      },
      tx: tx as any
    });

    return { ...entry, status: 'VOIDED' };
  });
}
