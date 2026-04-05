'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { AccountCategory } from '@prisma/client'

/**
 * GLOBAL PORTFOLIO TELEMETRY ENGINE (V.2)
 * High-performance organization-wide data aggregation with time-series comparison.
 */
export async function getGlobalPortfolioTelemetry() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const orgId = session.organizationId;
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      const fetchWindowMetrics = async (start: Date, end: Date) => {
        const [revenueAgg, opexAgg, arrearsAgg, totalUnits, occupiedUnits] = await Promise.all([
          // Revenue: Credits to Income Accounts
          prisma.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
              organizationId: orgId,
              account: { category: AccountCategory.INCOME },
              transactionDate: { gte: start, lte: end }
            }
          }),
          // OPEX: Debits to Expense Accounts
          prisma.ledgerEntry.aggregate({
            _sum: { amount: true },
            where: {
              organizationId: orgId,
              account: { category: AccountCategory.EXPENSE },
              transactionDate: { gte: start, lte: end }
            }
          }),
          // Arrears Snapshot (Current Unpaid Liabilities)
          prisma.charge.aggregate({
            _sum: { amount: true, amountPaid: true },
            where: {
              organizationId: orgId,
              isFullyPaid: false,
              dueDate: { lte: end }
            }
          }),
          // Capacity vs Coverage
          prisma.unit.count({ where: { organizationId: orgId } }),
          prisma.unit.count({
            where: {
              organizationId: orgId,
              leases: { some: { isActive: true } }
            }
          })
        ]);

        const revenue = Math.abs(Number(revenueAgg._sum.amount || 0));
        const opex = Number(opexAgg._sum.amount || 0);
        const debt = Number(arrearsAgg._sum.amount || 0) - Number(arrearsAgg._sum.amountPaid || 0);
        const yieldRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        return { revenue, opex, debt, yieldRate };
      };

      const current = await fetchWindowMetrics(thirtyDaysAgo, now);
      const previous = await fetchWindowMetrics(sixtyDaysAgo, thirtyDaysAgo);

      const calculateDelta = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
      };

      return {
        success: true,
        data: {
          current,
          previous,
          deltas: {
            revenue: calculateDelta(current.revenue, previous.revenue),
            opex: calculateDelta(current.opex, previous.opex),
            debt: calculateDelta(current.debt, previous.debt),
            yield: current.yieldRate - previous.yieldRate
          }
        }
      };

    } catch (e: any) {
      console.error('[MACRO_ACTION_ERROR]', e);
      return { success: false, message: e instanceof Error ? e.message : "System Reconciliation Failure" };
    }
  });
}
