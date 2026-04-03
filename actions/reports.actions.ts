'use server'

import prisma from '@/lib/prisma'
import { auth } from "@/auth"
import { startOfYear, endOfYear, subYears, subMonths, startOfMonth, endOfMonth, format } from 'date-fns'
import { GAAPIncomeStatement, calculateNOI, calculateMovingAverage, calculateStandardDeviation } from '@/lib/analytics/engine'

export async function getProfitAndLoss(dateRange: string = 'YTD', scope: string = 'GLOBAL', propertyId?: string): Promise<GAAPIncomeStatement> {
  const session = await auth()
  if (!session?.user?.organizationId) throw new Error("UNAUTHORIZED_ACCESS_DENIED")
  const orgId = session.user.organizationId

  let start: Date, end: Date;
  const now = new Date();
  if (dateRange === 'YTD') {
    start = startOfYear(now);
    end = now;
  } else if (dateRange === 'LAST_YEAR') {
    start = startOfYear(subYears(now, 1));
    end = endOfYear(subYears(now, 1));
  } else {
    start = new Date(0);
    end = now;
  }

  // 1. Calculate Gross Potential Rent (GPR) from all units
  const units = await prisma.unit.findMany({
    where: { 
        organizationId: orgId,
        ...(propertyId ? { propertyId } : {})
    },
    include: { leases: { where: { isActive: true } } }
  })
  
  const gpr = units.reduce((sum: number, u: any) => {
    const lease = u.leases[0];
    return sum + (lease ? Number(lease.rentAmount) : 0);
  }, 0);

  // 2. Fetch Aggregated Income (EGR)
  const incomeAgg = await prisma.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: {
      organizationId: orgId,
      transactionDate: { gte: start, lte: end },
      account: { category: 'INCOME' },
      ...(propertyId ? { propertyId } : {})
    }
  })
  const egr = Number(incomeAgg._sum.amount || 0);

  // 3. Fetch Aggregated Expenses by Category
  const expenses = await prisma.ledgerEntry.groupBy({
    by: ['expenseCategoryId'],
    _sum: { amount: true },
    where: {
       organizationId: orgId,
       transactionDate: { gte: start, lte: end },
       account: { category: 'EXPENSE' },
       ...(propertyId ? { propertyId } : {})
    }
  })

  // Group into OpEx/CapEx logic (assuming mapping for now)
  const opexCategories: Record<string, number> = {};
  const capexCategories: Record<string, number> = {};
  
  // Fetch names for categories
  const categoryIds = expenses.map((e: any) => e.expenseCategoryId).filter(Boolean) as string[];
  const categories = await prisma.expenseCategory.findMany({
    where: { id: { in: categoryIds } }
  })
  
  let opexTotal = 0;
  let capexTotal = 0;

  expenses.forEach((e: any) => {
    const cat = categories.find((c: any) => c.id === e.expenseCategoryId);
    const amount = Math.abs(Number(e._sum.amount || 0));
    const name = cat?.name || 'Uncategorized';
    
    // Simplistic OpEx/CapEx split for demo (CapEx usually involves 'Improvement' or 'Capital')
    if (name.toLowerCase().includes('improvement') || name.toLowerCase().includes('capital')) {
        capexCategories[name] = amount;
        capexTotal += amount;
    } else {
        opexCategories[name] = amount;
        opexTotal += amount;
    }
  })

  return {
    metadata: {
      organizationId: orgId,
      generatedAt: new Date(),
      interval: dateRange
    },
    revenue: {
      grossPotentialRent: gpr,
      vacancyLoss: gpr - egr > 0 ? gpr - egr : 0,
      otherIncome: 0, // Placeholder
      effectiveGrossRevenue: egr
    },
    expenses: {
      operating: {
        categories: opexCategories,
        total: opexTotal
      },
      capital: {
        categories: capexCategories,
        total: capexTotal
      },
      total: opexTotal + capexTotal
    },
    metrics: {
      netOperatingIncome: calculateNOI(egr, opexTotal),
      operatingExpenseRatio: egr > 0 ? (opexTotal / egr) * 100 : 0
    }
  }
}

export async function getAnomalyDetection() {
    const session = await auth();
    if (!session?.user?.organizationId) return [];
    
    const orgId = session.user.organizationId;
    const sixMonthsAgo = subMonths(new Date(), 6);

    // Get MoM totals for last 6 months
    const expenses = await prisma.ledgerEntry.groupBy({
        by: ['transactionDate'],
        _sum: { amount: true },
        where: {
            organizationId: orgId,
            transactionDate: { gte: sixMonthsAgo },
            account: { category: 'EXPENSE' }
        }
    })

    // Prepare MoM data
    const momData: Record<string, number> = {};
    expenses.forEach((e: any) => {
        const key = format(e.transactionDate, 'MMM yyyy');
        momData[key] = (momData[key] || 0) + Math.abs(Number(e._sum.amount));
    });

    const values = Object.values(momData);
    const avg = calculateMovingAverage(values);
    const stdDev = calculateStandardDeviation(values);
    const threshold = avg + (stdDev * 1.5); // 1.5 std dev threshold

    return Object.entries(momData).map(([month, total]) => ({
        month,
        total,
        isAnomaly: total > threshold
    }));
}

export async function getCashFlowForecast() {
    const session = await auth();
    if (!session?.user?.organizationId) return [];
    
    const orgId = session.user.organizationId;
    const oneYearAgo = subYears(new Date(), 1);

    // Historical average MoM
    const entries = await prisma.ledgerEntry.groupBy({
        by: ['transactionDate', 'accountId'],
        _sum: { amount: true },
        where: {
            organizationId: orgId,
            transactionDate: { gte: oneYearAgo }
        }
    })

    // Very simplified forecast logic for demo
    return [
        { date: format(subMonths(new Date(), 0), 'MMM'), forecast: 50000 },
        { date: format(subMonths(new Date(), -1), 'MMM'), forecast: 48000 },
        { date: format(subMonths(new Date(), -2), 'MMM'), forecast: 52000 }
    ];
}

export async function getMasterLedger(query?: string) {
    const session = await auth();
    if (!session?.user?.organizationId) return [];
    
    return prisma.ledgerEntry.findMany({
        where: { 
            organizationId: session.user.organizationId,
            ...(query ? { description: { contains: query, mode: 'insensitive' } } : {})
        },
        include: { expenseCategory: true, account: true },
        orderBy: { transactionDate: 'desc' },
        take: 100
    });
}

export async function saveReportSnapshot(payload: any) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("UNAUTHORIZED");

    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const snapshot = await prisma.reportSnapshot.create({
        data: {
            urlToken: token,
            payload: JSON.stringify(payload),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            organizationId: session.user.organizationId
        }
    });

    return { token: snapshot.urlToken };
}

export async function getRentRoll(propertyId?: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("UNAUTHORIZED");
    const orgId = session.user.organizationId;

    const leases = await prisma.lease.findMany({
        where: {
            organizationId: orgId,
            isActive: true,
            ...(propertyId ? { unit: { propertyId } } : {})
        },
        include: {
            tenant: true,
            unit: true
        }
    });

    return leases.map((l: any) => ({
        tenantName: l.tenant.name,
        unitNumber: l.unit.unitNumber,
        rentAmount: Number(l.rentAmount),
        depositAmount: Number(l.depositAmount)
    }));
}

export async function getTaxPrep(year: number, propertyId?: string) {
    const session = await auth();
    if (!session?.user?.organizationId) throw new Error("UNAUTHORIZED");
    const orgId = session.user.organizationId;

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const entries = await prisma.ledgerEntry.findMany({
        where: {
            organizationId: orgId,
            transactionDate: { gte: start, lte: end },
            propertyId: propertyId || { not: null },
            account: { category: 'EXPENSE' }
        },
        include: {
            expenseCategory: true
        }
    });

    const grouped: Record<string, number> = {};
    entries.forEach((e: any) => {
        const cat = e.expenseCategory?.name || 'Other';
        grouped[cat] = (grouped[cat] || 0) + Math.abs(Number(e.amount));
    });

    return Object.entries(grouped).map(([category, amount]) => ({ category, amount }));
}
