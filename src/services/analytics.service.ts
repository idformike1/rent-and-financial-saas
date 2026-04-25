import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";

/**
 * ANALYTICAL MATRIX SERVICE (SOVEREIGN EDITION)
 * 
 * High-performance data aggregation for Executive and Collection dashboards.
 * Mandate: 
 * 1. Vault Isolation (Strict organizationId filtering).
 * 2. Database-Level Aggregation (Zero Node.js memory overhead).
 * 3. GAAP-Compliant Recognition.
 */

/**
 * AGGREGATOR: GLOBAL EXECUTIVE METRICS
 * Calculates macro-health KPIs: NOI, Arrears, and Occupancy.
 */
export async function getGlobalExecutiveMetrics(organizationId: string, periodStr: string) {
  const db = getSovereignClient(organizationId);

  // 1. Temporal Window Definition
  const [year, month] = periodStr.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  try {
    const [noiAggregate, arrearsAggregate, unitCount, activeLeaseCount] = await Promise.all([
      // NOI: Income (CREDIT) - Expense (DEBIT) for operational accounts
      db.ledgerEntry.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: {
          organizationId,
          status: 'ACTIVE',
          transactionDate: { gte: startDate, lte: endDate },
          account: {
            category: { in: ['INCOME', 'EXPENSE'] }
          }
        }
      }),

      // TOTAL ARREARS: Sum of outstanding debt across all global charges
      db.charge.aggregate({
        where: {
          organizationId,
          isFullyPaid: false,
          deletedAt: null
        },
        _sum: {
          amount: true,
          amountPaid: true
        }
      }),

      // OCCUPANCY: Unit Capacity vs Active Tenancy
      db.unit.count({
        where: { 
          organizationId, 
          deletedAt: null,
          maintenanceStatus: { not: 'DECOMMISSIONED' } 
        }
      }),

      db.unit.count({
        where: {
          organizationId,
          deletedAt: null,
          leases: {
            some: { isActive: true }
          }
        }
      })
    ]);

    // NOI Calculation Logic
    const income = noiAggregate.find(a => a.type === 'CREDIT')?._sum.amount || new Prisma.Decimal(0);
    const expense = noiAggregate.find(a => a.type === 'DEBIT')?._sum.amount || new Prisma.Decimal(0);
    const noi = new Prisma.Decimal(income).minus(new Prisma.Decimal(expense));

    // Arrears Calculation
    const totalOwed = arrearsAggregate._sum.amount || new Prisma.Decimal(0);
    const totalPaid = arrearsAggregate._sum.amountPaid || new Prisma.Decimal(0);
    const totalArrears = new Prisma.Decimal(totalOwed).minus(new Prisma.Decimal(totalPaid));

    // Occupancy Logic
    const occupancyRate = unitCount > 0 ? (activeLeaseCount / unitCount) * 100 : 0;

    return {
      noi,
      totalArrears,
      occupancyRate: parseFloat(occupancyRate.toFixed(2))
    };

  } catch (e: any) {
    console.error('[ANALYTICAL_MATRIX_EXECUTIVE_FATAL]', e);
    throw new Error("ERR_ANALYTICS_FAILED: Executive metrics aggregation failure.");
  }
}

/**
 * AGGREGATOR: COLLECTION VELOCITY
 * Tracks the performance of a specific billing batch/service period.
 */
export async function getCollectionVelocity(organizationId: string, periodStr: string) {
  const db = getSovereignClient(organizationId);

  try {
    const aggregate = await db.charge.aggregate({
      where: {
        organizationId,
        servicePeriod: periodStr,
        deletedAt: null
      },
      _sum: {
        amount: true,
        amountPaid: true
      }
    });

    const totalBilled = aggregate._sum.amount || new Prisma.Decimal(0);
    const collected = aggregate._sum.amountPaid || new Prisma.Decimal(0);
    const remaining = new Prisma.Decimal(totalBilled).minus(new Prisma.Decimal(collected));
    
    const velocityPercentage = totalBilled.gt(0) 
      ? collected.dividedBy(totalBilled).times(100).toNumber() 
      : 0;

    return {
      totalBilled,
      collected,
      remaining,
      velocityPercentage: parseFloat(velocityPercentage.toFixed(2))
    };

  } catch (e: any) {
    console.error('[ANALYTICAL_MATRIX_COLLECTION_FATAL]', e);
    throw new Error("ERR_ANALYTICS_FAILED: Collection velocity aggregation failure.");
  }
}
