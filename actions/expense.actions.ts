'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function logExpenseAction(data: {
  amount: number;
  date: string;
  description: string;
  expenseAccountId: string;
}) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      const transactionId = `EXP-${randomUUID().slice(0, 8)}`;
      const date = new Date(data.date);

      // We assume a default "Bank Checking" account for the credit side of the transaction
      const bankAccount = await prisma.account.findFirst({
        where: { name: { contains: 'Bank' } }
      });

      if (!bankAccount) throw new Error("Material Asset (Bank) account not found in registry.");

      await prisma.$transaction([
        // Debit the Expense Account (+)
        prisma.ledgerEntry.create({
          data: {
            transactionId,
            accountId: data.expenseAccountId,
            amount: data.amount,
            date,
            description: data.description
          }
        }),
        // Credit the Asset/Bank Account (-)
        prisma.ledgerEntry.create({
          data: {
            transactionId,
            accountId: bankAccount.id,
            amount: -data.amount,
            date,
            description: data.description
          }
        })
      ]);

      revalidatePath('/treasury');
      revalidatePath('/reports/master-ledger');
      return { success: true, message: "Expense effectively logged in the ledger." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function getExpenseAccounts() {
  const accounts = await prisma.account.findMany({
    where: { category: 'EXPENSE' }
  });
  return accounts;
}
