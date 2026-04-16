'use server';

import { prisma } from '@/lib/prisma';
import { runSecureServerAction } from '@/lib/auth-utils';
import { AccountCategory, Charge, LedgerEntry, Prisma } from '@prisma/client';

/**
 * TREASURY DOMAIN ACTIONS (AXIOM ENTERPRISE V3)
 * Materializing the Segmented Ledger feeds for Operating, Deposits, and Receivables.
 * 
 * Mandate: Strict type safety, Decimal-to-Number coercion for client stability,
 * and high-precision aggregation logic.
 */

export async function getAccountLedger(accountId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      let balance = 0;
      let entries: any[] = [];

      const formatD = (d: Date) => d.toISOString().split('T')[0];

      if (accountId === 'operating') {
        const ledgerEntries = await prisma.ledgerEntry.findMany({
          where: {
            organizationId: session.organizationId,
            OR: [
              { account: { category: AccountCategory.INCOME } },
              { account: { category: AccountCategory.EXPENSE } }
            ],
            NOT: {
              expenseCategory: {
                name: { contains: 'Security Deposit', mode: 'insensitive' }
              }
            }
          },
          include: {
            account: { select: { category: true } },
            expenseCategory: { select: { name: true } }
          },
          orderBy: { transactionDate: 'desc' }
        });

        balance = ledgerEntries.reduce((sum, e) => {
          const amt = Math.abs(Number(e.amount));
          if (e.account?.category === AccountCategory.INCOME) {
            return sum + amt;
          } else {
            return sum - amt;
          }
        }, 0);

        entries = ledgerEntries.map(e => ({
          id: e.id,
          date: formatD(e.transactionDate),
          payee: e.payee || 'OPERATIONAL_COUNTERPARTY',
          description: e.description || e.expenseCategory?.name || 'Uncategorized Entry',
          amount: Number(e.amount)
        }));

      } else if (accountId === 'deposits') {
        const depositEntries = await prisma.ledgerEntry.findMany({
          where: {
            organizationId: session.organizationId,
            expenseCategory: {
              name: { contains: 'Security Deposit', mode: 'insensitive' }
            }
          },
          include: {
            expenseCategory: { select: { name: true } }
          },
          orderBy: { transactionDate: 'desc' }
        });

        balance = depositEntries.reduce((sum, e) => sum + Number(e.amount), 0);

        entries = depositEntries.map(e => ({
          id: e.id,
          date: formatD(e.transactionDate),
          payee: e.payee || 'TENANT_FIDUCIARY',
          description: e.description || 'Escrowed Security Deposit',
          amount: Number(e.amount)
        }));

      } else if (accountId === 'receivables') {
        const openCharges = await prisma.charge.findMany({
          where: {
            organizationId: session.organizationId,
            isFullyPaid: false
          },
          include: {
            tenant: { select: { name: true } }
          },
          orderBy: { dueDate: 'asc' }
        });

        balance = openCharges.reduce((sum, c) => {
          return sum + (Number(c.amount) - Number(c.amountPaid));
        }, 0);

        entries = openCharges.map(c => ({
          id: c.id,
          date: formatD(c.dueDate),
          payee: c.tenant?.name || 'UNKNOWN_TENANT',
          description: `Outstanding ${c.type} Arrears`,
          amount: Number(c.amount) - Number(c.amountPaid)
        }));
      }

      return {
        success: true,
        data: {
          balance,
          entries
        }
      };
    } catch (e: any) {
      console.error('[TREASURY_LEDGER_FATAL]', e);
      return { 
        success: false, 
        message: e.message || "System reconciliation failure. Contact Axiom DevOps." 
      };
    }
  });
}
