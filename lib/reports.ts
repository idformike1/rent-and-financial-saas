import prisma from '@/lib/prisma'
import { AccountCategory } from '@prisma/client'

export async function generateReportData() {
  const now = new Date();
  
  // 1. Net Realizable Revenue (NRR) = Collected Income - Operational Expenses
  const incomes = await prisma.account.findMany({ where: { category: AccountCategory.INCOME }, include: { entries: true } });
  const expenses = await prisma.account.findMany({ where: { category: AccountCategory.EXPENSE }, include: { entries: true } });

  const totalCollectedIncome = Math.abs(incomes.reduce((acc, account) => 
    acc + account.entries.reduce((sum, entry) => sum + entry.amount.toNumber(), 0), 0
  ));
  
  const totalOperationalExpense = expenses.reduce((acc, account) => 
    acc + account.entries.reduce((sum, entry) => sum + entry.amount.toNumber(), 0), 0
  );

  const netRealizableRevenue = totalCollectedIncome - totalOperationalExpense;

  // 2. Utility Delta Analysis
  const utilExpenseAccs = expenses.filter(a => a.name.includes('Master'));
  const utilIncomeAccs = incomes.filter(a => a.name.includes('Utility'));

  const utilExpense = utilExpenseAccs.reduce((acc, acct) => acc + acct.entries.reduce((s, e) => s + e.amount.toNumber(), 0), 0);
  const utilRecovery = Math.abs(utilIncomeAccs.reduce((acc, acct) => acc + acct.entries.reduce((s, e) => s + e.amount.toNumber(), 0), 0));
  
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

  const agingSnapshot = tenants.map(t => {
    let totalDue = 0;
    let maxDays = 0;
    for (const c of t.charges) {
      const due = (c.amount.toNumber() - c.amountPaid.toNumber());
      totalDue += due;
      const days = Math.floor((now.getTime() - c.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > maxDays) maxDays = days;
    }
    return { name: t.name, totalDue, daysPastDue: maxDays > 0 ? maxDays : 0 };
  }).filter(t => t.totalDue > 0).sort((a,b) => b.totalDue - a.totalDue);

  return {
    reportDate: now.toDateString(),
    netRealizableRevenue,
    totalCollectedIncome,
    totalOperationalExpense,
    utilityAnalysis: { utilExpense, utilRecovery, utilityDelta, isUtilityWarning },
    agingSnapshot
  };
}
