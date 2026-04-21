import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { AccountCategory, PaymentMode, EntryType } from "@/src/schema/enums";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * FINANCE CORE LEDGER LOGIC
 * 
 * Mandate: Atomic Zero-Sum Enforcement and Forensic Status Management.
 */

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

export async function voidLedgerEntryService(
  entryId: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.$transaction(async (tx: any) => {
    const entry = await tx.ledgerEntry.findFirst({
      where: { id: entryId, organizationId: context.organizationId }
    });

    if (!entry) throw new Error("ERR_FISCAL_ABSENT: Target decommissioning record not found.");
    if (entry.status === 'VOIDED') throw new Error("ERR_STATE_CONFLICT: Record already decommissioned.");

    await tx.ledgerEntry.updateMany({
      where: { id: entryId, organizationId: context.organizationId },
      data: { status: 'VOIDED' }
    });

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
