'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { PaymentMode } from '@prisma/client'

export async function logExpense(formData: FormData) {
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
    throw new Error("Missing critical governance data. Operation aborted.");
  }

  try {
    // Find a default account for outflow (e.g., Bank Checking)
    // In a real system, would be selected in form
    const account = await (prisma as any).account.findFirst({
        where: { category: 'ASSET' }
    });

    if (!account) throw new Error("No default asset account found for debit.");

    // Create the ledger entry
    await (prisma as any).ledgerEntry.create({
      data: {
        transactionId,
        accountId: account.id,
        amount: -amount, // Expenses are negative on asset accounts? Or positive on expense accounts? 
        // In double-entry, this is a Credit (-) on Bank.
        date,
        transactionDate: date,
        description,
        payee,
        propertyId,
        expenseCategoryId,
        paymentMode
      }
    });

    // Mirroring credit entry would happen in a real system (debit the expense account)
    // For this refactor, we are focusing on the LedgerEntry record enrichment.

    revalidatePath('/expenses');
    revalidatePath('/reports/master-ledger');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
