"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { format, subDays, subMonths, startOfMonth, startOfYear } from "date-fns";

export type Timeframe = "3M" | "YTD" | "ALL";

export async function getInsightsData(organizationId: string | undefined, timeframe: Timeframe = "3M") {
  // Determine date window
  const now = new Date();
  let startDate = new Date();

  if (timeframe === "3M") {
    startDate = subMonths(now, 3);
  } else if (timeframe === "YTD") {
    startDate = startOfYear(now);
  } else {
    startDate = new Date(2000, 0, 1); // Earliest possible
  }

  // Common where clause
  const whereClause: Prisma.LedgerEntryWhereInput = {
    transactionDate: { gte: startDate, lte: now },
    ...(organizationId ? { organizationId } : {}), // Safety for single tenant local dev if needed
  };

  // 1. Fetch Ledger Entries
  const entries = await (prisma as any).ledgerEntry.findMany({
    where: whereClause,
    include: {
      account: true,
      expenseCategory: true,
    },
    orderBy: { transactionDate: 'asc' }
  });

  // Calculate Metrics
  let totalIncome = 0;
  let totalExpense = 0;
  
  // Categorized Spending
  const categoryMap: Record<string, number> = {};

  // For Chart (Group by Month/Day depending on scale, but let's do simple month bucketing)
  const chartDataMap: Record<string, { income: number, expense: number }> = {};

  entries.forEach((entry: any) => {
    const amt = Number(entry.amount);
    if (!entry.account) return;

    if (entry.account.category === "INCOME") {
      totalIncome += amt;
    } else if (entry.account.category === "EXPENSE") {
      totalExpense += amt;
      
      // Top categories
      if (entry.expenseCategory) {
        const catName = entry.expenseCategory.name;
        categoryMap[catName] = (categoryMap[catName] || 0) + amt;
      } else {
        categoryMap["Uncategorized"] = (categoryMap["Uncategorized"] || 0) + amt;
      }
    }

    // Bucket for chart
    const monthKey = format(new Date(entry.transactionDate), "MMM yyyy");
    if (!chartDataMap[monthKey]) {
      chartDataMap[monthKey] = { income: 0, expense: 0 };
    }
    
    if (entry.account.category === "INCOME") {
      chartDataMap[monthKey].income += amt;
    } else if (entry.account.category === "EXPENSE") {
      chartDataMap[monthKey].expense += amt;
    }
  });

  const netCashFlow = totalIncome - totalExpense;

  // Calculate months diff to find Average Monthly Burn
  let monthsDiff = 1;
  if (timeframe === "3M") monthsDiff = 3;
  if (timeframe === "YTD") monthsDiff = (now.getMonth() + 1); // Approx months elapsed

  const burnRate = totalExpense / Math.max(1, monthsDiff);

  // Runway Calculation (Need total assets without date filter)
  const assetEntries = await (prisma as any).ledgerEntry.findMany({
    where: {
      account: { category: "ASSET" },
      ...(organizationId ? { organizationId } : {})
    },
  });

  const totalAssets = assetEntries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);
  const runwayMonths = burnRate > 0 ? (totalAssets / burnRate) : 999;

  // Format Top Categories array
  const topCategories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount], index) => {
      // Calculate percentage
      const pct = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      
      // Provide some default colors based on index
      const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500'];
      
      return {
        name,
        amount,
        pct,
        color: colors[index % colors.length]
      };
    });

  // Format Chart Data
  const chartData = Object.entries(chartDataMap).map(([month, data]) => ({
    name: month,
    income: data.income,
    expense: data.expense,
    net: data.income - data.expense
  }));

  return {
    netCashFlow,
    burnRate,
    runwayMonths,
    totalAssets,
    topCategories,
    chartData
  };
}
