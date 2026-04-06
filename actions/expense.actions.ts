'use server'

import { revalidatePath } from 'next/cache'
import { runSecureServerAction } from '@/lib/auth-utils'
import { logExpenseService } from '@/src/services/mutations/ledger.services'
import { PaymentMode } from '@prisma/client'

/**
 * LOG EXPENSE ACTION (GATEKEEPER)
 */
export async function logExpense(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // 1. Data Normalization & Header Re-mapping
      const rawAmount = parseFloat(formData.get('amount') as string);
      const payee = formData.get('payee') as string;
      const description = formData.get('description') as string;
      const ledgerId = formData.get('scope') as string;
      const type = (formData.get('type') as string || 'EXPENSE') as 'INCOME' | 'EXPENSE';
      const propertyId = formData.get('propertyId') as string || undefined;
      const expenseCategoryId = formData.get('subCategoryId') as string || formData.get('parentCategoryId') as string;
      const paymentMode = formData.get('paymentMode') as PaymentMode || PaymentMode.BANK;

      if (!rawAmount || !payee || !expenseCategoryId || !ledgerId) {
        return { error: "ERR_PROTOCOL_VIOLATION: Missing critical financial headers." };
      }

      // 2. Delegation to Sovereign Service Layer
      const result = await logExpenseService(
        {
          amount: rawAmount,
          payee,
          description,
          ledgerId,
          type,
          propertyId,
          expenseCategoryId,
          paymentMode
        },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      // 3. Global Cache Synchronization
      revalidatePath('/expenses');
      revalidatePath('/reports/master-ledger');
      
      return { success: true, data: result };

    } catch (e: any) {
      console.error('[EXPENSE_ACTION_FATAL]', e);
      return { error: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
