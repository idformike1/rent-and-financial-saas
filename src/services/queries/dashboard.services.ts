import { getSovereignClient } from "@/src/lib/db";
import { AccountCategory, Prisma } from "@prisma/client";
import { FINANCIAL_PERIODS, REVENUE_FILTER_CONTEXT } from "@/src/core/algorithms/finance";

/**
 * DASHBOARD & ONTOLOGY SERVICE (QUERY LAYER)
 * 
 * Provides high-fidelity telemetry and structural visibility into the Sovereign registry.
 */

/**
 * Executes the Global Portfolio Telemetry engine with time-series comparison.
 */
export async function getGlobalPortfolioTelemetryService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);
  const now = new Date();
  
  const thirtyDaysAgo = new Date(now.getTime() - FINANCIAL_PERIODS.TRAILING_MONTH * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - (FINANCIAL_PERIODS.TRAILING_MONTH * 2) * 24 * 60 * 60 * 1000);

  const fetchMetrics = async (start: Date, end: Date) => {
    const [revAgg, opexAgg, arrearsAgg, count, occupiedCount] = await Promise.all([
      db.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { 
          organizationId: context.organizationId, 
          account: { category: AccountCategory.INCOME }, 
          transactionDate: { gte: start, lte: end },
          AND: REVENUE_FILTER_CONTEXT 
        }
      }),
      db.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { 
          organizationId: context.organizationId, 
          account: { category: AccountCategory.EXPENSE }, 
          transactionDate: { gte: start, lte: end },
          AND: REVENUE_FILTER_CONTEXT
        }
      }),
      db.charge.aggregate({
        _sum: { amount: true, amountPaid: true },
        where: { organizationId: context.organizationId, isFullyPaid: false, dueDate: { lte: end } }
      }),
      db.unit.count({ where: { organizationId: context.organizationId } }),
      db.unit.count({ where: { organizationId: context.organizationId, leases: { some: { isActive: true } } } })
    ]);

    const rev = revAgg._sum.amount ? new Prisma.Decimal(revAgg._sum.amount).abs().toNumber() : 0;
    const opex = opexAgg._sum.amount ? new Prisma.Decimal(opexAgg._sum.amount).toNumber() : 0;
    const debt = (arrearsAgg._sum.amount ? new Prisma.Decimal(arrearsAgg._sum.amount) : new Prisma.Decimal(0))
      .minus(arrearsAgg._sum.amountPaid ? new Prisma.Decimal(arrearsAgg._sum.amountPaid) : new Prisma.Decimal(0))
      .toNumber();
    const yieldRate = count > 0 ? (occupiedCount / count) * 100 : 0;

    return { revenue: rev, opex, debt, yieldRate };
  };

  const current = await fetchMetrics(thirtyDaysAgo, now);
  const previous = await fetchMetrics(sixtyDaysAgo, thirtyDaysAgo);

  const delta = (curr: number, prev: number) => prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

  return {
    current,
    previous,
    deltas: {
      revenue: delta(current.revenue, previous.revenue),
      opex: delta(current.opex, previous.opex),
      debt: delta(current.debt, previous.debt),
      yield: current.yieldRate - previous.yieldRate
    }
  };
}

/**
 * Materializes the Detailed Structural Ontology for the organization.
 */
export async function getDetailedOntologyService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);

  const buildings = await db.property.findMany({
    where: { organizationId: context.organizationId },
    include: {
      units: { include: { leases: { where: { isActive: true }, include: { tenant: { select: { id: true, name: true } } } } } },
      ledgerEntries: {
        where: { organizationId: context.organizationId, OR: [{ account: { category: 'EXPENSE' } }, { expenseCategoryId: { not: null } }] },
        take: 10,
        orderBy: { transactionDate: 'desc' },
        include: { expenseCategory: true }
      }
    }
  });

  const corporateExpenses = await db.ledgerEntry.findMany({
    where: { organizationId: context.organizationId, propertyId: null, OR: [{ account: { category: 'EXPENSE' } }, { expenseCategoryId: { not: null } }] },
    take: 20,
    orderBy: { transactionDate: 'desc' },
    include: { expenseCategory: true }
  });

  const mappedBuildings = buildings.map((b: any) => {
    const tenantsMap = new Map();
    b.units.forEach((u: any) => u.leases.forEach((l: any) => l.tenant && tenantsMap.set(l.tenant.id, l.tenant.name)));

    return {
      id: b.id,
      name: b.name,
      type: 'BUILDING',
      tenants: Array.from(tenantsMap.entries()).map(([id, name]) => ({ id, name, type: 'TENANT' })),
      expenses: b.ledgerEntries.map((e: any) => ({
        id: e.id,
        name: e.description || e.expenseCategory?.name || 'Uncategorized OPEX',
        amount: Number(e.amount),
        type: 'EXPENSE'
      }))
    };
  });

  return {
    id: context.organizationId,
    name: "Sovereign Registry",
    type: 'ORGANIZATION',
    children: [
      { id: 'asset-portfolio', name: 'Asset Portfolio', type: 'CATEGORY', children: mappedBuildings },
      { id: 'corporate-overhead', name: 'Corporate Overhead', type: 'CATEGORY', children: corporateExpenses.map((e: any) => ({
        id: e.id,
        name: e.description || e.expenseCategory?.name || 'Corporate Entry',
        amount: Number(e.amount),
        type: 'EXPENSE'
      })) }
    ]
  };
}
