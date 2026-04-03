'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { PaymentMode, AccountCategory } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { recordAuditLog } from '@/lib/audit-logger'

export async function logExpense(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    const transactionId = randomUUID();
    const date = new Date(formData.get('date') as string);
    const rawAmount = parseFloat(formData.get('amount') as string);
    const payee = formData.get('payee') as string;
    const description = formData.get('description') as string;
    const ledgerId = formData.get('scope') as string; // This is the FinancialLedger ID
    const type = formData.get('type') as string || 'EXPENSE';
    const propertyId = formData.get('propertyId') as string || null;
    const expenseCategoryId = formData.get('subCategoryId') as string || formData.get('parentCategoryId') as string;
    const paymentMode = formData.get('paymentMode') as PaymentMode || PaymentMode.BANK;

    if (!rawAmount || !payee || !expenseCategoryId || !ledgerId) {
      return { error: "Missing critical governance data. Operation aborted." };
    }

    // SIGN CONVENTION: INCOME is Positive Inflow, EXPENSE is Negative Outflow
    const amount = type === 'INCOME' ? Math.abs(rawAmount) : -Math.abs(rawAmount);

    try {
      await prisma.$transaction(async (tx) => {
        // Find a default account for the treasury hit (ASSET - Cash/Bank)
        const account = await tx.account.findFirst({
            where: { category: AccountCategory.ASSET, organizationId: session.organizationId }
        });

        if (!account) throw new Error("No primary asset account found for ledger synchronization.");

        // Create the master ledger entry
        const entry = await tx.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId,
            accountId: account.id,
            amount: amount,
            date,
            transactionDate: date,
            description,
            payee,
            propertyId,
            expenseCategoryId,
            paymentMode
          }
        });

        await recordAuditLog({
          action: 'CREATE',
          entityType: type === 'INCOME' ? 'REVENUE' : 'EXPENSE',
          entityId: entry.id,
          metadata: { amount, payee, type, description },
          tx
        });
      });

      revalidatePath('/expenses');
      revalidatePath('/reports/master-ledger');
      return { success: true };
    } catch (e: any) {
      console.error('[EXPENSE_LOG_FATAL]', e);
      return { error: e.message || "Digital ledger synchronization failed." };
    }
  });
}
