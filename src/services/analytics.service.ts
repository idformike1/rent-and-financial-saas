import { getSovereignClient } from "@/src/lib/db";
import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

/**
 * ANALYTICAL MATRIX SERVICE (SOVEREIGN EDITION)
 * 
 * High-performance data aggregation for Executive and Collection dashboards.
 */

/**
 * AGGREGATOR: GLOBAL EXECUTIVE METRICS
 * Calculates macro-health KPIs: NOI, Arrears, and Occupancy.
 */
export async function getGlobalExecutiveMetrics(organizationId: string, periodStr: string) {
  return unstable_cache(
    async () => {
      const db = getSovereignClient(organizationId);

      // 1. Temporal Window Definition
      const [year, month] = periodStr.split("-").map(Number);
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      try {
        const [noiAggregate, arrearsAggregate, unitCount, activeLeaseCount] = await Promise.all([
          db.ledgerEntry.groupBy({
            by: ['type'],
            _sum: { amount: true },
            where: {
              organizationId,
              status: 'ACTIVE',
              transactionDate: { gte: startDate, lte: endDate },
              account: { category: { in: ['INCOME', 'EXPENSE'] } }
            }
          }),
          db.charge.aggregate({
            where: { organizationId, isFullyPaid: false, deletedAt: null },
            _sum: { amount: true, amountPaid: true }
          }),
          db.unit.count({
            where: { organizationId, deletedAt: null, maintenanceStatus: { not: 'DECOMMISSIONED' } }
          }),
          db.unit.count({
            where: { organizationId, deletedAt: null, leases: { some: { isActive: true } } }
          })
        ]);

        const income = noiAggregate.find(a => a.type === 'CREDIT')?._sum.amount || new Prisma.Decimal(0);
        const expense = noiAggregate.find(a => a.type === 'DEBIT')?._sum.amount || new Prisma.Decimal(0);
        const noi = new Prisma.Decimal(income).minus(new Prisma.Decimal(expense));

        const totalOwed = arrearsAggregate._sum.amount || new Prisma.Decimal(0);
        const totalPaid = arrearsAggregate._sum.amountPaid || new Prisma.Decimal(0);
        const totalArrears = new Prisma.Decimal(totalOwed).minus(new Prisma.Decimal(totalPaid));

        const occupancyRate = unitCount > 0 ? (activeLeaseCount / unitCount) * 100 : 0;

        return {
          noi: noi.toNumber(),
          totalArrears: totalArrears.toNumber(),
          occupancyRate: parseFloat(occupancyRate.toFixed(2))
        };
      } catch (e: any) {
        console.error('[ANALYTICAL_MATRIX_EXECUTIVE_FATAL]', e);
        throw new Error("ERR_ANALYTICS_FAILED: Executive metrics aggregation failure.");
      }
    },
    [`org-${organizationId}-executive-metrics-${periodStr}`],
    {
      tags: [`org-${organizationId}-analytics`],
      revalidate: 3600 // 1 Hour
    }
  )();
}

/**
 * AGGREGATOR: COLLECTION VELOCITY
 * Tracks the performance of a specific billing batch/service period.
 */
export async function getCollectionVelocity(organizationId: string, periodStr: string) {
  return unstable_cache(
    async () => {
      const db = getSovereignClient(organizationId);

      try {
        const aggregate = await db.charge.aggregate({
          where: { organizationId, servicePeriod: periodStr, deletedAt: null },
          _sum: { amount: true, amountPaid: true }
        });

        const totalBilled = aggregate._sum.amount || new Prisma.Decimal(0);
        const collected = aggregate._sum.amountPaid || new Prisma.Decimal(0);
        const remaining = new Prisma.Decimal(totalBilled).minus(new Prisma.Decimal(collected));
        
        const velocityPercentage = totalBilled.gt(0) 
          ? collected.dividedBy(totalBilled).times(100).toNumber() 
          : 0;

        return {
          totalBilled: totalBilled.toNumber(),
          collected: collected.toNumber(),
          remaining: remaining.toNumber(),
          velocityPercentage: parseFloat(velocityPercentage.toFixed(2))
        };
      } catch (e: any) {
        console.error('[ANALYTICAL_MATRIX_COLLECTION_FATAL]', e);
        throw new Error("ERR_ANALYTICS_FAILED: Collection velocity aggregation failure.");
      }
    },
    [`org-${organizationId}-collection-velocity-${periodStr}`],
    {
      tags: [`org-${organizationId}-analytics`],
      revalidate: 3600 // 1 Hour
    }
  )();
}

/**
 * AGGREGATOR: PROPERTY LEDGER FEED
 * Materializes a serialized ledger feed for specific property telemetry.
 */
export async function getPropertyLedgerEntries(organizationId: string, propertyId: string, type: string) {
  return unstable_cache(
    async () => {
      const { treasuryService } = await import("./treasury.service");
      try {
        const db = getSovereignClient(organizationId);
        
        // Find all active tenants for this property to include their transactions
        const propertyTenants = await db.lease.findMany({
          where: { unit: { propertyId }, isActive: true, deletedAt: null },
          select: { tenantId: true }
        });
        const tenantIds = propertyTenants.map(l => l.tenantId).filter(Boolean);

        const filters: any = {
          OR: [
            { propertyId },
            { tenantId: { in: tenantIds } }
          ]
        };
        
        // Temporal Windowing
        const now = new Date();
        if (type === 'MONTHLY') {
          filters.startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filters.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        } else if (type === 'YEARLY') {
          filters.startDate = new Date(now.getFullYear(), 0, 1);
          filters.endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        }

        if (type === 'NOI') {
          filters.category = ['INCOME', 'EXPENSE'];
        } else if (['GROSS_POTENTIAL', 'LEAKAGE', 'COLLECTION'].includes(type)) {
          filters.category = 'INCOME';
        }

        const response = await treasuryService.getMasterLedger(organizationId, filters);
        const rawLedger = response.data;
        
        const safeIso = (d: any) => {
          try {
            if (!d) return null;
            if (typeof d.toISOString === 'function') return d.toISOString();
            const date = new Date(d);
            return isNaN(date.getTime()) ? d : date.toISOString();
          } catch (e) {
            return d;
          }
        };

        return rawLedger.map((entry: any) => ({
          ...entry,
          amount: Number(entry.amount),
          transactionDate: safeIso(entry.transactionDate),
          createdAt: safeIso(entry.createdAt),
          updatedAt: safeIso(entry.updatedAt),
          deletedAt: safeIso(entry.deletedAt)
        }));
      } catch (e: any) {
        console.error('[ANALYTICS_SERVICE_LEDGER_FATAL]', e);
        throw new Error("ERR_LEDGER_MATERIALIZATION_FAILURE");
      }
    },
    [`org-${organizationId}-property-${propertyId}-ledger-${type}`],
    {
      tags: [`org-${organizationId}-analytics`, `org-${organizationId}-ledger`],
      revalidate: 300 // 5 Minutes
    }
  )();
}
