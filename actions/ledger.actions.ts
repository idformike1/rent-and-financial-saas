'use server'

import prisma from '@/lib/prisma'
import { Prisma, AccountCategory } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { PaymentSubmissionPayload, SystemResponse } from '@/types'
import { randomUUID } from 'crypto'
import { recordAuditLog } from '@/lib/audit-logger'

/**
 * ALGORITHM A: The Payment Waterfall (Primary-First)
 */
export async function processPayment(payload: PaymentSubmissionPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        let amountRemaining = new Prisma.Decimal(payload.amountPaid);
        if (amountRemaining.lte(0)) {
          throw new Error("Fiscal Breach: Amount must be greater than zero.");
        }

        const tenant = await tx.tenant.findUnique({
          where: { id: payload.tenantId, organizationId: session.organizationId },
          include: {
            charges: {
              where: { isFullyPaid: false, amount: { gt: 0 }, organizationId: session.organizationId }, 
              include: { lease: true }
            }
          }
        });

        if (!tenant) throw new Error("Tenant registry mismatch.");

        /**
         * ALGORITHM A (UPGRADED): MULTI-DIMENSIONAL WATERFALL
         */
        const charges = tenant.charges.sort((a: any, b: any) => {
          const dateDiff = a.dueDate.getTime() - b.dueDate.getTime();
          if (dateDiff !== 0) return dateDiff;
          if (a.lease.isPrimary && !b.lease.isPrimary) return -1;
          if (!a.lease.isPrimary && b.lease.isPrimary) return 1;
          return 0;
        });

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
          
          await tx.charge.update({
            where: { id: charge.id, organizationId: session.organizationId },
            data: {
              amountPaid: charge.amountPaid.plus(amountToApply),
              isFullyPaid: newIsFullyPaid
            }
          });
          loopIndex++;
        }

        // Overpayment: Automatic Credit Materialization
        if (amountRemaining.gt(0)) {
          const activeLease = await tx.lease.findFirst({ 
            where: { tenantId: tenant.id, isActive: true, isPrimary: true } 
          }) || await tx.lease.findFirst({ 
            where: { tenantId: tenant.id, isActive: true } 
          });

          if (activeLease) {
            await tx.charge.create({
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
            });
          }
        }

        let assetAccount = await tx.account.findFirst({ 
          where: { category: AccountCategory.ASSET, organizationId: session.organizationId } 
        });

        // REVENUE SEARCH UPGRADE (V.3.2)
        let revenueAccount = await tx.account.findFirst({ 
          where: { category: AccountCategory.INCOME, organizationId: session.organizationId } 
        });

        // FALLBACK: If no explicit INCOME account, search for ANY FinancialLedger with class REVENUE
        if (!revenueAccount) {
          const revenueLedger = await prisma.financialLedger.findFirst({
            where: { class: 'REVENUE', organizationId: session.organizationId }
          });
          
          if (revenueLedger) {
            // Attempt to find a backing account for this revenue stream
            revenueAccount = await tx.account.findFirst({
              where: { name: revenueLedger.name, organizationId: session.organizationId }
            });
            
            // AUTO-MATERIALIZATION protocol: create backing account if it exists as a ledger
            if (!revenueAccount) {
              revenueAccount = await tx.account.create({
                data: {
                  name: revenueLedger.name,
                  category: AccountCategory.INCOME,
                  organizationId: session.organizationId
                }
              });
            }
          } else {
             // FINAL FALLBACK: Materialize a global system income account if absolutely nothing exists
             revenueAccount = await tx.account.create({
               data: {
                 name: "GENERAL OPERATING REVENUE (AUTO)",
                 category: AccountCategory.INCOME,
                 organizationId: session.organizationId
               }
             });
          }
        }

        // ASSET FALLBACK: Ensure a Cash account exists for Debit
        if (!assetAccount) {
          assetAccount = await tx.account.findFirst({ 
            where: { name: { contains: 'CASH', mode: 'insensitive' }, organizationId: session.organizationId } 
          }) || await tx.account.create({
            data: {
              name: "CASH ON HAND (AUTO)",
              category: AccountCategory.ASSET,
              organizationId: session.organizationId
            }
          });
        }

        if (!assetAccount || !revenueAccount) {
          throw new Error("Critical Ledger Failure: Automated account materialization failed. Contact Infrastructure.");
        }

        const transactionId = randomUUID();
        const pDate = new Date(payload.transactionDate);

        // DEBIT ASSET (Positive)
        await tx.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId,
            accountId: assetAccount.id,
            tenantId: tenant.id,
            amount: new Prisma.Decimal(payload.amountPaid),
            date: new Date(),
            transactionDate: pDate,
            description: `Payment from ${tenant.name} (${payload.paymentMode}) - REF: ${payload.referenceText}`,
            paymentMode: payload.paymentMode as any,
            referenceText: payload.referenceText
          }
        });

        // CREDIT REVENUE (Negative)
        await tx.ledgerEntry.create({
          data: {
            organizationId: session.organizationId,
            transactionId,
            accountId: revenueAccount.id,
            tenantId: tenant.id,
            amount: new Prisma.Decimal(payload.amountPaid).negated(),
            date: new Date(),
            transactionDate: pDate,
            description: `Revenue recognized via ${tenant.name}`,
            paymentMode: payload.paymentMode as any,
            referenceText: payload.referenceText
          }
        });

        await recordAuditLog({
          action: 'PAYMENT',
          entityType: 'LEDGER_ENTRY',
          entityId: transactionId,
          metadata: { amount: payload.amountPaid, tenantId: payload.tenantId, mode: payload.paymentMode },
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });

        return { transactionId };
      });

      return { success: true, message: "Waterfall processing complete. Ledger entry immutable.", data: result };
    } catch (e: any) {
      console.error('[PAYMENT_WATERFALL_FATAL]', e);
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
