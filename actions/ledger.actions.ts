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
        return { success: false, message: "Fiscal Breach: Amount must be greater than zero.", errorCode: "VALIDATION_ERROR" };
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: payload.tenantId, organizationId: session.organizationId },
        include: {
          charges: {
            where: { isFullyPaid: false, amount: { gt: 0 }, organizationId: session.organizationId }, 
            include: { lease: true }
          }
        }
      });

      if (!tenant) return { success: false, message: "Tenant registry mismatch.", errorCode: "VALIDATION_ERROR" };

      /**
       * ALGORITHM A (UPGRADED): MULTI-DIMENSIONAL WATERFALL
       * Priority Array:
       * 1. Date Chronology (Oldest Debt First)
       * 2. Relationship Tier (Primary Leases First)
       * 3. Entity Integrity (Secondary Leases)
       */
      const charges = tenant.charges.sort((a: any, b: any) => {
        // Tie-breaker 1: Maturity (Oldest Due Date)
        const dateDiff = a.dueDate.getTime() - b.dueDate.getTime();
        if (dateDiff !== 0) return dateDiff;
        
        // Tie-breaker 2: Subscription Tier (Primary First)
        if (a.lease.isPrimary && !b.lease.isPrimary) return -1;
        if (!a.lease.isPrimary && b.lease.isPrimary) return 1;
        
        return 0;
      });

      const txOps = [];

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
            where: { id: charge.id, organizationId: session.organizationId },
            data: {
              amountPaid: charge.amountPaid.plus(amountToApply),
              isFullyPaid: newIsFullyPaid
            }
          })
        );
        loopIndex++;
      }

      // Overpayment: Automatic Credit Materialization
      if (amountRemaining.gt(0)) {
        const activeLease = await prisma.lease.findFirst({ 
          where: { tenantId: tenant.id, isActive: true, isPrimary: true } 
        }) || await prisma.lease.findFirst({ 
          where: { tenantId: tenant.id, isActive: true } 
        });

        if (activeLease) {
          txOps.push(
            prisma.charge.create({
              data: {
                organizationId: session.organizationId,
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

      const assetAccount = await prisma.account.findFirst({ where: { category: AccountCategory.ASSET, organizationId: session.organizationId } });
      const revenueAccount = await prisma.account.findFirst({ where: { name: 'Rental Revenue', organizationId: session.organizationId } });

      if (!assetAccount || !revenueAccount) {
        return { success: false, message: "System Ledger Error: Revenue accounts not reached.", errorCode: "STATE_CONFLICT" };
      }

      const transactionId = randomUUID();
      const pDate = new Date(payload.transactionDate);

      // DEBIT ASSET (Positive) - Mapping Payment Mode and Ref
      txOps.push(
        prisma.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId,
            accountId: assetAccount.id,
            amount: new Prisma.Decimal(payload.amountPaid),
            date: new Date(),
            transactionDate: pDate,
            description: `Payment from ${tenant.name} (${payload.paymentMode}) - REF: ${payload.referenceText}`,
            paymentMode: payload.paymentMode as any,
            referenceText: payload.referenceText
          }
        })
      );

      // CREDIT REVENUE (Negative)
      txOps.push(
        prisma.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId,
            accountId: revenueAccount.id,
            amount: new Prisma.Decimal(payload.amountPaid).negated(),
            date: new Date(),
            transactionDate: pDate,
            description: `Revenue recognized via ${tenant.name}`,
            paymentMode: payload.paymentMode as any,
            referenceText: payload.referenceText
          }
        })
      );

      await prisma.$transaction(txOps);

      return { success: true, message: "Waterfall processing complete. Ledger entry immutable.", data: { transactionId } };
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
      where: { category: AccountCategory.EXPENSE, name: { contains: 'Master' }, organizationId: session.organizationId }
    });

    // 2. Fetch Utility Recovery Income for the period
    const incomeAccounts = await prisma.account.findMany({
      where: { category: AccountCategory.INCOME, name: { contains: 'Utility Recovery' }, organizationId: session.organizationId }
    });

    const expenseEntryAgg = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        organizationId: session.organizationId,
        accountId: { in: expenseAccounts.map((a: any) => a.id) },
        date: { gte: startDate, lte: endDate }
      }
    });

    const incomeEntryAgg = await prisma.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: {
        organizationId: session.organizationId,
        accountId: { in: incomeAccounts.map((a: any) => a.id) },
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
