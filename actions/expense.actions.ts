'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { PaymentMode, AccountCategory } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'

export async function logExpense(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    const transactionId = randomUUID();
    const date = new Date(formData.get('date') as string);
    const amount = parseFloat(formData.get('amount') as string);
    const payee = formData.get('payee') as string;
    const description = formData.get('description') as string;
    const scope = formData.get('scope') as string;
    const propertyId = formData.get('propertyId') as string || null;
    const expenseCategoryId = formData.get('subCategoryId') as string || formData.get('parentCategoryId') as string;
    const paymentMode = formData.get('paymentMode') as PaymentMode || PaymentMode.BANK;

    if (!amount || !payee || !expenseCategoryId || (scope === 'PROPERTY' && !propertyId)) {
      return { error: "Missing critical governance data. Operation aborted." };
    }

    try {
      // Find a default account for outflow (e.g., Bank Checking)
      const account = await prisma.account.findFirst({
          where: { category: AccountCategory.ASSET, organizationId: session.organizationId }
      });

      if (!account) return { error: "No default asset account found for debit." };

      // Create the ledger entry
      await prisma.ledgerEntry.create({
        data: {
          organizationId: session.organizationId,
          transactionId,
          accountId: account.id,
          amount: -amount,
          date,
          transactionDate: date,
          description,
          payee,
          propertyId,
          expenseCategoryId,
          paymentMode
        }
      });

      revalidatePath('/expenses');
      revalidatePath('/reports/master-ledger');
      return { success: true };
    } catch (e: any) {
      return { error: e.message };
    }
  });
}
