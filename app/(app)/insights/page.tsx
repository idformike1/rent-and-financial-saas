import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import InsightsClient from "./InsightsClient";
import {
  generateRunwayNarrative,
  generateIncomeNarrative,
  generateOutflowNarrative
} from "./semanticGenerator";

export const metadata = {
  title: "Insights | Axiom Finova",
  description: "Overview of your financial health.",
};

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const organizationId = (session.user as any).organizationId;

  // --- Secure Data Pipeline ---
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { organizationId },
    include: { account: true, expenseCategory: true },
    orderBy: { transactionDate: 'asc' }
  });

  // Serialize Decimal -> Number to prevent Client Component hydration errors
  const sanitizedEntries = ledgerEntries.map((e: any) => ({
    ...e,
    amount: Number(e.amount)
  }));

  let totalIncome = 0;
  let totalExpense = 0;
  let totalAssets = 0;

  sanitizedEntries.forEach((e: any) => {
    if (e.account?.category === "INCOME") totalIncome += e.amount;
    if (e.account?.category === "EXPENSE") totalExpense += e.amount;
    if (e.account?.category === "ASSET") totalAssets += e.amount;
  });

  const netCashflow = totalIncome - totalExpense;

  // Generate Array for LedgerChart (Grouped by month, simulating a daily/monthly series)
  const chartDataMap: Record<string, { income: number, expense: number }> = {};

  sanitizedEntries.forEach((e: any) => {
    const month = new Date(e.transactionDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!chartDataMap[month]) chartDataMap[month] = { income: 0, expense: 0 };

    if (e.account?.category === "INCOME") chartDataMap[month].income += e.amount;
    if (e.account?.category === "EXPENSE") chartDataMap[month].expense += e.amount;
  });

  const chartData = Object.entries(chartDataMap).map(([month, data]) => ({
    date: month,
    netCashflow: data.income - data.expense,
    moneyIn: data.income,
    moneyOut: -data.expense
  }));

  if (chartData.length === 0) {
    chartData.push({ date: 'Today', netCashflow: 0, moneyIn: 0, moneyOut: 0 });
  }

  const activeMonths = chartData.length > 0 ? chartData.length : 1;
  const burnRate = totalExpense / activeMonths;

  // --- Semantic Engine Generators ---
  const runwayNode = generateRunwayNarrative(burnRate, totalAssets);
  const incomeNode = generateIncomeNarrative(totalIncome, sanitizedEntries);
  const outflowNode = generateOutflowNarrative(totalExpense, sanitizedEntries);

  return (
    <InsightsClient 
      netCashflow={netCashflow}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      chartData={chartData}
      runwayNode={runwayNode}
      outflowNode={outflowNode}
      incomeNode={incomeNode}
    />
  );
}
