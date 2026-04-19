import { auth } from "@/auth";
import { prisma } from '@/lib/prisma';
import InsightsClient from "./InsightsClient";

export default async function InsightsGrid() {
  const session = await auth();
  if (!session?.user) return null;

  const organizationId = (session.user as any).organizationId;

  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { organizationId },
    include: { account: true, expenseCategory: true },
    orderBy: { transactionDate: 'asc' }
  });

  const sanitizedEntries = ledgerEntries.map((e: any) => ({
    id: e.id,
    amount: Number(e.amount),
    transactionDate: e.transactionDate instanceof Date ? e.transactionDate.toISOString() : e.transactionDate,
    description: e.description,
    account: {
      category: e.account?.category
    },
    expenseCategory: {
      name: e.expenseCategory?.name
    }
  }));

  let totalIncome = 0;
  let totalExpense = 0;
  let totalAssets = 0;

  sanitizedEntries.forEach((e: any) => {
    if (e.account?.category === "INCOME") totalIncome += Math.abs(e.amount);
    if (e.account?.category === "EXPENSE") totalExpense += Math.abs(e.amount);
    if (e.account?.category === "ASSET") totalAssets += Math.abs(e.amount);
  });

  const chartDataMap: Record<string, { income: number, expense: number }> = {};

  sanitizedEntries.forEach((e: any) => {
    const month = new Date(e.transactionDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!chartDataMap[month]) chartDataMap[month] = { income: 0, expense: 0 };

    if (e.account?.category === "INCOME") chartDataMap[month].income += Math.abs(e.amount);
    if (e.account?.category === "EXPENSE") chartDataMap[month].expense += Math.abs(e.amount);
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

  return (
    <InsightsClient 
      chartData={chartData}
      entries={sanitizedEntries}
      totalAssets={totalAssets}
    />
  );
}
