import { getSovereignClient } from "@/src/lib/db";
import { AccountCategory, Prisma } from "@prisma/client";

/**
 * STRUCTURAL BREAKDOWNS & DATA GROUPING
 */

/**
 * Materializes the Detailed Structural Ontology for the organization.
 */
export async function getDetailedOntologyService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.organizationId);

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
      {
        id: 'corporate-overhead', name: 'Corporate Overhead', type: 'CATEGORY',
        children: corporateExpenses.map((e: any) => ({
          id: e.id,
          name: e.description || e.expenseCategory?.name || 'Corporate Entry',
          amount: Number(e.amount),
          type: 'EXPENSE'
        }))
      }
    ]
  };
}

/**
 * Materializes data for the Waterfall (Sankey) visualization.
 */
export async function getWaterfallDataService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.organizationId);

  const ledgers = await db.financialLedger.findMany({
    where: { organizationId: context.organizationId },
    include: {
      categories: {
        include: {
          entries: { select: { amount: true } }
        }
      }
    }
  });

  type SankeyNode = { id: string; name: string; color?: string };
  type SankeyLink = { source: string; target: string; value: number; color?: string };

  const nodes: SankeyNode[] = [
    { id: 'GROSS_REVENUE', name: 'GROSS REVENUE', color: '#10b981' },
    { id: 'OPERATING_EXPENSES', name: 'TOTAL EXPENSES', color: '#f43f5e' },
    { id: 'NOI', name: 'NET OPERATING INCOME', color: '#6366f1' }
  ];

  const links: SankeyLink[] = [];
  let totalRevenue = new Prisma.Decimal(0);
  let totalExpense = new Prisma.Decimal(0);

  ledgers.forEach((ledger: any) => {
    let ledgerTotal = new Prisma.Decimal(0);
    ledger.categories.forEach((cat: any) => {
      const catTotal = cat.entries.reduce(
        (sum: Prisma.Decimal, entry: any) => sum.plus(new Prisma.Decimal(entry.amount)),
        new Prisma.Decimal(0)
      );
      ledgerTotal = ledgerTotal.plus(catTotal);

      if (catTotal.gt(0)) {
        if (!nodes.find(n => n.id === cat.id)) nodes.push({ id: cat.id, name: cat.name.toUpperCase() });
        links.push({
          source: cat.id,
          target: ledger.id,
          value: catTotal.toNumber(),
          color: ledger.class === 'REVENUE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'
        });
      }
    });

    if (!nodes.find(n => n.id === ledger.id)) nodes.push({ id: ledger.id, name: ledger.name.toUpperCase() });
    if (ledgerTotal.gt(0)) {
      if (ledger.class === 'REVENUE') {
        totalRevenue = totalRevenue.plus(ledgerTotal);
        links.push({ source: ledger.id, target: 'GROSS_REVENUE', value: ledgerTotal.toNumber(), color: '#10b981' });
      } else if (ledger.class === 'EXPENSE') {
        totalExpense = totalExpense.plus(ledgerTotal);
        links.push({ source: ledger.id, target: 'OPERATING_EXPENSES', value: ledgerTotal.toNumber(), color: '#f43f5e' });
      }
    }
  });

  if (totalRevenue.gt(0)) links.push({ source: 'GROSS_REVENUE', target: 'NOI', value: totalRevenue.toNumber(), color: 'rgba(99, 102, 241, 0.4)' });
  if (totalExpense.gt(0)) links.push({ source: 'OPERATING_EXPENSES', target: 'NOI', value: totalExpense.toNumber(), color: 'rgba(244, 63, 94, 0.4)' });

  return {
    nodes,
    links,
    stats: {
      totalRevenue: totalRevenue.toNumber(),
      totalExpense: totalExpense.toNumber(),
      noi: totalRevenue.minus(totalExpense).toNumber()
    }
  };
}

/**
 * Materializes Tax Preparation data (Audit-Ready).
 */
export async function getTaxPrepService(
  year: number,
  propertyId: string | undefined,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const aggregations = await db.ledgerEntry.groupBy({
    by: ['expenseCategoryId'],
    _sum: { amount: true },
    where: {
      organizationId: context.organizationId,
      propertyId: propertyId || undefined,
      transactionDate: { gte: start, lte: end },
      OR: [
        { account: { category: AccountCategory.EXPENSE } },
        { expenseCategoryId: { not: null } }
      ]
    }
  });

  const categoryIds = aggregations.map(a => a.expenseCategoryId).filter(Boolean) as string[];
  const categories = await db.expenseCategory.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true }
  });

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  return aggregations.map(a => ({
    category: a.expenseCategoryId ? (categoryMap.get(a.expenseCategoryId) || 'Uncategorized Operations') : 'Uncategorized Operations',
    amount: Number(a._sum.amount || 0)
  }));
}
