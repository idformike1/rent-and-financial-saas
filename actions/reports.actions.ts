'use server'

import prisma from '@/lib/prisma'
import { startOfYear, endOfYear, subYears } from 'date-fns'

export async function getProfitAndLoss(dateRange: string, scope: string, propertyId?: string) {
  let start: Date, end: Date;
  
  const now = new Date();
  if (dateRange === 'YTD') {
    start = startOfYear(now);
    end = now;
  } else if (dateRange === 'LAST_YEAR') {
    start = startOfYear(subYears(now, 1));
    end = endOfYear(subYears(now, 1));
  } else {
    // Custom logic or default to all time
    start = new Date(0);
    end = new Date();
  }

  const entries = await (prisma as any).ledgerEntry.findMany({
    where: {
      date: { gte: start, lte: end },
      ...(scope !== 'GLOBAL' ? { expenseCategory: { scope } } : {}),
      ...(propertyId ? { propertyId } : {})
    },
    include: {
      expenseCategory: true,
      account: true
    }
  });

  const income = entries
    .filter((e: any) => e.account.category === 'INCOME')
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const expensesByCategory: Record<string, number> = {};
  entries
    .filter((e: any) => e.account.category === 'EXPENSE' || e.expenseCategoryId)
    .forEach((e: any) => {
      const catName = e.expenseCategory?.name || e.account.name;
      expensesByCategory[catName] = (expensesByCategory[catName] || 0) + Math.abs(Number(e.amount));
    });

  return {
    income,
    expenses: Object.entries(expensesByCategory).map(([name, total]) => ({ name, total })),
    totalExpenses: Object.values(expensesByCategory).reduce((a, b) => a + b, 0)
  };
}

export async function getRentRoll(propertyId?: string) {
  const leases = await (prisma as any).lease.findMany({
    where: {
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
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);

  const entries = await (prisma as any).ledgerEntry.findMany({
    where: {
      date: { gte: start, lte: end },
      propertyId: propertyId || { not: null },
      expenseCategory: { scope: 'PROPERTY' }
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
