'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { getSovereignClient } from '@/src/lib/db'
import { revalidatePath } from 'next/cache'
import { EntryType } from '@prisma/client'

/**
 * WEALTH HUB ACTIONS (SOVEREIGN AUTHORITY)
 */

export async function executeInternalTransfer(payload: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  memo: string;
}) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const db = getSovereignClient(session.organizationId);
      
      // Atomic Double-Entry Transaction
      await db.$transaction(async (tx) => {
        // 1. Create the parent transaction record
        const transaction = await tx.transaction.create({
          data: {
            organizationId: session.organizationId,
            description: `Internal Transfer: ${payload.memo}`,
          }
        });

        // 2. Source Deduction (CREDIT to Asset)
        await tx.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId: transaction.id,
            wealthAccountId: payload.fromAccountId, // Map to new Registry
            amount: -payload.amount,
            type: EntryType.CREDIT,
            description: `Transfer Out: ${payload.memo}`,
            transactionDate: new Date(),
          }
        });

        // 3. Destination Credit (DEBIT to Asset)
        await tx.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId: transaction.id,
            wealthAccountId: payload.toAccountId, // Map to new Registry
            amount: payload.amount,
            type: EntryType.DEBIT,
            description: `Transfer In: ${payload.memo}`,
            transactionDate: new Date(),
          }
        });
      });

      revalidatePath('/wealth/transfers');
      revalidatePath('/reports/insights');
      
      return { success: true, message: "Transfer executed successfully. Sovereign Ledger updated." };
    } catch (e: any) {
      console.error('[WEALTH_TRANSFER_FATAL]', e);
      return { success: false, message: e.message || "Failed to execute transfer." };
    }
  });
}

export async function getWealthAccounts() {
    return runSecureServerAction('VIEWER', async (session) => {
        const db = getSovereignClient(session.organizationId);
        return await db.wealthAccount.findMany({
            where: { organizationId: session.organizationId, isArchived: false },
            select: { id: true, name: true, category: true }
        });
    }, false);
}

export async function logPersonalExpense(payload: {
  amount: number;
  categoryId: string;
  payee: string;
  date: string;
  accountId: string;
}) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const db = getSovereignClient(session.organizationId);
      const parsedDate = new Date(payload.date);
      
      await db.$transaction(async (tx) => {
        // 1. Create Transaction Shell
        const transaction = await tx.transaction.create({
          data: {
            organizationId: session.organizationId,
            description: `Personal Expense: ${payload.payee}`,
            date: parsedDate,
          }
        });

        // 2. Create Deduction Entry (CREDIT)
        await tx.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId: transaction.id,
            wealthAccountId: payload.accountId, // Map to new Registry
            amount: -payload.amount,
            type: EntryType.CREDIT,
            description: `Expense Payment to ${payload.payee}`,
            transactionDate: parsedDate,
            expenseCategoryId: payload.categoryId,
            payee: payload.payee,
          }
        });
      });

      revalidatePath('/wealth/cash-flow');
      revalidatePath('/reports/insights');
      
      return { success: true, message: "Expense logged to Sovereign Ledger." };
    } catch (e: any) {
      console.error('[WEALTH_EXPENSE_FATAL]', e);
      return { success: false, message: e.message || "Failed to log expense." };
    }
  });
}
export async function logPersonalIncome(payload: {
  amount: number;
  sourceId: string;
  payee: string;
  date: string;
  accountId: string;
}) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const db = getSovereignClient(session.organizationId);
      const parsedDate = new Date(payload.date);
      
      await db.$transaction(async (tx) => {
        // 1. Create Transaction Shell
        const transaction = await tx.transaction.create({
          data: {
            organizationId: session.organizationId,
            description: `Personal Income: ${payload.payee}`,
            date: parsedDate,
          }
        });

        // 2. Create Inflow Entry (DEBIT to Asset)
        await tx.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId: transaction.id,
            wealthAccountId: payload.accountId, // Map to new Registry
            amount: payload.amount,
            type: EntryType.DEBIT,
            description: `Income Inflow: ${payload.payee}`,
            transactionDate: parsedDate,
            incomeSourceId: payload.sourceId,
            payee: payload.payee,
          }
        });
      });

      revalidatePath('/wealth/cash-flow');
      revalidatePath('/reports/insights');
      
      return { success: true, message: "Income logged to Sovereign Ledger." };
    } catch (e: any) {
      console.error('[WEALTH_INCOME_FATAL]', e);
      return { success: false, message: e.message || "Failed to log income." };
    }
  });
}
