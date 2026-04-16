import { prisma } from '@/lib/prisma'
import { AccountCategory, Prisma } from '@prisma/client'

// Technical interface for internal report aggregation
interface AgingEntry {
  name: string;
  totalDue: number;
  daysPastDue: number;
}

export async function generateReportData() {
  const now = new Date();
  
  // 1. Net Realizable Revenue (NRR) = Collected Income - Operational Expenses
  const incomes = await prisma.account.findMany({ 
    where: { category: AccountCategory.INCOME }, 
    include: { entries: true } 
  });
  const expenses = await prisma.account.findMany({ 
    where: { category: AccountCategory.EXPENSE }, 
    include: { entries: true } 
  });

  const totalCollectedIncome = Math.abs(incomes.reduce((acc: number, account: any) => 
    acc + account.entries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0), 0
  ));
  
  const totalOperationalExpense = expenses.reduce((acc: number, account: any) => 
    acc + account.entries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0), 0
  );

  const netRealizableRevenue = totalCollectedIncome - totalOperationalExpense;

  // 2. Utility Delta Analysis
  const utilExpenseAccs = expenses.filter((a: any) => a.name.includes('Master'));
  const utilIncomeAccs = incomes.filter((a: any) => a.name.includes('Utility'));

  const utilExpense = utilExpenseAccs.reduce((acc: number, acct: any) => 
    acc + acct.entries.reduce((s: number, e: any) => s + Number(e.amount), 0), 0
  );
  const utilRecovery = Math.abs(utilIncomeAccs.reduce((acc: number, acct: any) => 
    acc + acct.entries.reduce((s: number, e: any) => s + Number(e.amount), 0), 0
  ));
  
  const utilityDelta = utilExpense - utilRecovery;
  const isUtilityWarning = utilExpense > 0 && (utilityDelta / utilExpense) > 0.15; // Unrecovered > 15%

  // 3. Aging Snapshot
  const tenants = await prisma.tenant.findMany({
    include: {
      charges: {
        where: { isFullyPaid: false, amount: { gt: 0 } }
      }
    }
  });

  const agingSnapshot: AgingEntry[] = tenants.map((t: any) => {
    let totalDue = 0;
    let maxDays = 0;
    for (const c of t.charges) {
      const due = (Number(c.amount) - Number(c.amountPaid));
      totalDue += due;
      const days = Math.floor((now.getTime() - (c.dueDate as Date).getTime()) / (1000 * 60 * 60 * 24));
      if (days > maxDays) maxDays = days;
    }
    return { name: t.name, totalDue, daysPastDue: maxDays > 0 ? maxDays : 0 };
  }).filter((t: AgingEntry) => t.totalDue > 0).sort((a: AgingEntry, b: AgingEntry) => b.totalDue - a.totalDue);

  return {
    reportDate: now.toDateString(),
    netRealizableRevenue,
    totalCollectedIncome,
    totalOperationalExpense,
    utilityAnalysis: { utilExpense, utilRecovery, utilityDelta, isUtilityWarning },
    agingSnapshot
  };
}
