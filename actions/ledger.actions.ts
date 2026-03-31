'use server'

import prisma from '@/lib/prisma'
import { Prisma, AccountCategory } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { PaymentSubmissionPayload, SystemResponse } from '@/types'
import { randomUUID } from 'crypto'

/**
 * ALGORITHM A: The Payment Waterfall (Primary-First)
 */
export async function processPayment(payload: PaymentSubmissionPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      let amountRemaining = new Prisma.Decimal(payload.amountPaid);
      if (amountRemaining.lte(0)) {
        return { success: false, message: "Amount must be greater than 0.", errorCode: "VALIDATION_ERROR" };
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: payload.tenantId },
        include: {
          charges: {
            where: { isFullyPaid: false, amount: { gt: 0 } }, 
            include: { lease: true }
          }
        }
      });

      if (!tenant) return { success: false, message: "Tenant not found", errorCode: "VALIDATION_ERROR" };

      // Algorithm A Step 2: Sort
      const charges = tenant.charges.sort((a, b) => {
        if (a.lease.isPrimary && !b.lease.isPrimary) return -1;
        if (!a.lease.isPrimary && b.lease.isPrimary) return 1;
        return a.dueDate.getTime() - b.dueDate.getTime();
      });

      const txOps = [];

      // Algorithm A Step 3: Distribute
      let loopIndex = 0;
      while (amountRemaining.gt(0) && loopIndex < charges.length) {
        const charge = charges[loopIndex];
        const balanceOwed = charge.amount.minus(charge.amountPaid);
        
        let amountToApply = amountRemaining;
        let newIsFullyPaid = false;

        if (amountRemaining.gte(balanceOwed)) {
          amountToApply = balanceOwed;
          newIsFullyPaid = true;
        }
        
        amountRemaining = amountRemaining.minus(amountToApply);
        
        txOps.push(
          prisma.charge.update({
            where: { id: charge.id },
            data: {
              amountPaid: charge.amountPaid.plus(amountToApply),
              isFullyPaid: newIsFullyPaid
            }
          })
        );
        loopIndex++;
      }

      // Overpayment: Credit
      if (amountRemaining.gt(0)) {
        const activeLease = await prisma.lease.findFirst({ where: { tenantId: tenant.id, isActive: true } });
        if (activeLease) {
          txOps.push(
            prisma.charge.create({
              data: {
                tenantId: tenant.id,
                leaseId: activeLease.id,
                type: 'CREDIT',
                amount: amountRemaining.negated(),
                amountPaid: new Prisma.Decimal(0),
                dueDate: new Date(),
                isFullyPaid: false,
              }
            })
          );
        }
      }

      // Algorithm A Step 4: Ledger double-entry
      const assetAccount = await prisma.account.findFirst({ where: { category: AccountCategory.ASSET } });
      const revenueAccount = await prisma.account.findFirst({ where: { name: 'Rental Revenue' } });

      if (!assetAccount || !revenueAccount) {
        return { success: false, message: "Crucial accounts missing in system.", errorCode: "STATE_CONFLICT" };
      }

      const transactionId = randomUUID();

      // DEBIT ASSET (Positive)
      txOps.push(
        prisma.ledgerEntry.create({
          data: {
            transactionId,
            accountId: assetAccount.id,
            amount: new Prisma.Decimal(payload.amountPaid),
            date: new Date(),
            description: `Payment from tenant ${tenant.name}`
          }
        })
      );

      // CREDIT REVENUE (Negative)
      txOps.push(
        prisma.ledgerEntry.create({
          data: {
            transactionId,
            accountId: revenueAccount.id,
            amount: new Prisma.Decimal(payload.amountPaid).negated(),
            date: new Date(),
            description: `Payment from tenant ${tenant.name}`
          }
        })
      );

      // Commit transaction
      await prisma.$transaction(txOps);

      return { success: true, message: "Payment processed successfully.", data: { transactionId } };
    } catch (e: any) {
      return { success: false, message: e.message || "Unknown error", errorCode: "STATE_CONFLICT" };
    }
  });
}

/**
 * ALGORITHM B: Utility Reconciliation Logic
 */
export async function reconcileUtilities(propertyId: string, startDate: Date, endDate: Date) {
  return runSecureServerAction('MANAGER', async (session) => {
    // 1. Fetch Master Expense (Water/Elec) for the period
    const expenseAccounts = await prisma.account.findMany({
      where: { category: AccountCategory.EXPENSE, name: { contains: 'Master' } }
    });

    // 2. Fetch Utility Recovery Income for the period
    const incomeAccounts = await prisma.account.findMany({
      where: { category: AccountCategory.INCOME, name: { contains: 'Utility Recovery' } }
    });

    const expenseEntryAgg = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        accountId: { in: expenseAccounts.map(a => a.id) },
        date: { gte: startDate, lte: endDate }
      }
    });

    const incomeEntryAgg = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        accountId: { in: incomeAccounts.map(a => a.id) },
        date: { gte: startDate, lte: endDate }
      }
    });

    // Note: Debits to expense are positive. Credits to income are negative.
    // So Expense = sum(expense_entries) [positive]. Income = abs(sum(income_entries)).
    const totalExpense = expenseEntryAgg._sum.amount?.toNumber() || 0;
    const totalRecoveryRaw = incomeEntryAgg._sum.amount?.toNumber() || 0;
    const totalRecovery = Math.abs(totalRecoveryRaw);

    const unrecoveredDelta = totalExpense - totalRecovery;
    const recoveryRate = totalExpense > 0 ? (totalRecovery / totalExpense) * 100 : 0;

    return {
      success: true,
      message: "Reconciled",
      data: {
        totalExpense,
        totalRecovery,
        unrecoveredDelta,
        recoveryRate
      }
    };
  });
}
