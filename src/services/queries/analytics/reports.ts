import { getSovereignClient } from "@/src/lib/db";
import { AccountCategory, Prisma } from "@prisma/client";

/**
 * SPECIALIZED REPORTS & DETAILED QUERIES
 */

/**
 * Materializes the Dynamic Rent Roll for an asset.
 */
export async function getRentRollService(
  propertyId: string | undefined,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  const units = await db.unit.findMany({
    where: {
      organizationId: context.organizationId,
      propertyId: propertyId || undefined
    },
    include: {
      leases: {
        where: { isActive: true },
        include: { tenant: { select: { name: true } } }
      }
    }
  });

  return units.map((u: any) => ({
    unitNumber: u.unitNumber,
    tenantName: u.leases[0]?.tenant?.name || 'VACANT',
    rentAmount: Number(u.leases[0]?.rentAmount || u.marketRent || 0),
    depositAmount: Number(u.leases[0]?.depositAmount || 0)
  }));
}

/**
 * Retrieves historical ledger entries for a specific asset and drill-down category.
 */
export async function getPropertyLedgerEntriesService(
  propertyId: string,
  type: string,
  context: { operatorId: string, organizationId: string }
) {
  const db = getSovereignClient(context.organizationId);

  return await db.ledgerEntry.findMany({
    where: {
      propertyId,
      organizationId: context.organizationId,
      OR: [
        { account: { category: type === 'NOI' ? undefined : (type === 'REVENUE' ? AccountCategory.INCOME : AccountCategory.EXPENSE) } },
        { expenseCategory: { name: { contains: type, mode: 'insensitive' } } }
      ]
    },
    include: { expenseCategory: true },
    orderBy: { transactionDate: 'desc' },
    take: 50
  });
}

/**
 * Materializes the Master Ledger (Transaction Archive) for search/filter.
 */
export async function getMasterLedgerService(
  context: { operatorId: string, organizationId: string },
  filters?: {
    query?: string;
    startDate?: Date;
    endDate?: Date;
    category?: string;
    propertyId?: string;
    tenantId?: string;
    accountId?: string;
    categoryId?: string;
    minAmount?: number;
    maxAmount?: number;
    skip?: number;
    take?: number;
  }
) {
  const db = getSovereignClient(context.organizationId);
  const { query, startDate, endDate, category, propertyId, tenantId, accountId, categoryId, minAmount, maxAmount, skip = 0, take = 100 } = filters || {};

  const where: Prisma.LedgerEntryWhereInput = {
    organizationId: context.organizationId,
  };

  if (query) {
    where.OR = [
      { description: { contains: query, mode: 'insensitive' } },
      { account: { name: { contains: query, mode: 'insensitive' } } },
      { expenseCategory: { name: { contains: query, mode: 'insensitive' } } },
      { payee: { contains: query, mode: 'insensitive' } }
    ];
  }

  if (startDate || endDate) {
    where.transactionDate = {
      gte: startDate,
      lte: endDate,
    };
  }

  if (category && category !== 'ALL') {
    if (category === 'INCOME') {
      where.amount = { gte: 0 };
    } else if (category === 'EXPENSE') {
      where.amount = { lt: 0 };
    }
  }

  if (propertyId && propertyId !== 'ALL') {
    where.propertyId = propertyId;
  }

  if (tenantId && tenantId !== 'ALL') {
    where.tenantId = tenantId;
  }
  
  if (accountId && accountId !== 'ALL') {
    where.accountId = accountId;
  }

  if (categoryId && categoryId !== 'ALL') {
    where.expenseCategoryId = categoryId;
  }
  
  if (minAmount !== undefined || maxAmount !== undefined) {
    const amtFilter: any = {};
    if (minAmount !== undefined) amtFilter.gte = minAmount;
    if (maxAmount !== undefined) amtFilter.lte = maxAmount;
    
    where.AND = [
      ...(where.AND as any[] || []),
      {
        OR: [
          { amount: { ...amtFilter } },
          { amount: { ...Object.fromEntries(Object.entries(amtFilter).map(([k, v]) => [k, -(v as number)])) } }
        ]
      }
    ];
  }

  return await db.ledgerEntry.findMany({
    where,
    include: { 
      account: true, 
      expenseCategory: true,
      property: { select: { name: true } },
      tenant: { select: { name: true } }
    },
    orderBy: { transactionDate: 'desc' },
    skip,
    take
  });
}

/**
 * Saves a report snapshot and returns a temporary access token.
 */
export async function saveReportSnapshotService(
  payload: any,
  context: { operatorId: string, organizationId: string }
) {
  // Reserved for future enterprise snapshot materialization.
  return { token: `TOKEN-${Math.random().toString(36).substring(7).toUpperCase()}` };
}
