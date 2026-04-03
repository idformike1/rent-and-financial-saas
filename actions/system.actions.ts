'use server'

import prisma from '@/lib/prisma'
import { AccountCategory } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

/**
 * SYSTEM ACTION: REVENUE SYNCHRONIZATION PROTOCOL
 * 
 * Target: Ledgers mislabeled as EXPENSE but named 'Income' or 'Revenue'.
 * Impact: Repairs 'Revenue accounts not reached' errors in the Waterfall engine.
 */
export async function executeRevenueSyncFix() {
  return runSecureServerAction('ADMIN', async (session) => {
    try {
      // 1. Locate Misclassified Ledgers
      const misclassified = await prisma.financialLedger.findMany({
        where: {
          organizationId: session.organizationId,
          class: 'EXPENSE',
          OR: [
            { name: { contains: 'INCOME', mode: 'insensitive' } },
            { name: { contains: 'REVENUE', mode: 'insensitive' } },
            { name: { contains: 'RENT', mode: 'insensitive' } }
          ]
        }
      });

      let updatedCount = 0;
      for (const ledger of misclassified) {
        await prisma.financialLedger.update({
          where: { id: ledger.id },
          data: { class: 'REVENUE' }
        });
        updatedCount++;

        // 2. Ensure backing Account persists
        const account = await prisma.account.findFirst({
           where: { name: ledger.name, organizationId: session.organizationId }
        });

        if (!account) {
           await prisma.account.create({
             data: {
               name: ledger.name,
               category: AccountCategory.INCOME,
               organizationId: session.organizationId
             }
           });
        }
      }

      // 3. Fallback: Ensure at least ONE global INCOME account exists
      const hasIncomeAccount = await prisma.account.findFirst({
        where: { category: AccountCategory.INCOME, organizationId: session.organizationId }
      });

      if (!hasIncomeAccount) {
         await prisma.account.create({
           data: {
             name: "GLOBAL REVENUE (SYSTEM)",
             category: AccountCategory.INCOME,
             organizationId: session.organizationId
           }
         });
         updatedCount++;
      }

      revalidatePath('/settings/categories');

      return { 
        success: true, 
        message: `Sync protocol complete. Refactored ${updatedCount} records. AXIOM engine should now reach revenue destination.`,
        data: { updated: updatedCount }
      };
    } catch (e: any) {
      console.error('[REVENUE_SYNC_FATAL]', e);
      return { success: false, message: `Sync Failed: ${e.message}` };
    }
  });
}
