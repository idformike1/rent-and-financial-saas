import React from 'react';

export const Capsule = ({ children }: { children: React.ReactNode }) => (
  <span className="text-white font-bold">{children}</span>
);

export const generateRunwayNarrative = (burnRate: number, totalAssets: number) => {
  const runway = burnRate > 0 ? (totalAssets / burnRate).toFixed(1) : "Infinite";
  return (
    <span className="text-[#F4F5F9]">
      Net cash flow is <Capsule>{totalAssets < 0 ? '−' : ''}${Math.abs(totalAssets).toLocaleString('en-US', { minimumFractionDigits: 0 })}</Capsule> YTD. Your Mercury balances total <Capsule>${Math.abs(totalAssets).toLocaleString('en-US', { minimumFractionDigits: 0 })}</Capsule> with a monthly burn rate of <Capsule>−${Math.abs(burnRate).toLocaleString('en-US', { minimumFractionDigits: 0 })}/mo</Capsule>. Runway ceiling: {runway} fully completed months.
    </span>
  );
};

export const generateIncomeNarrative = (totalIncome: number, entries: any[]) => {
  const incomeEntries = entries.filter((e) => e.account?.category === "INCOME");
  const count = incomeEntries.length;
  
  // Find top income source
  let topSource = "General Revenue";
  let topAmount = 0;
  const sourceMap: Record<string, number> = {};
  incomeEntries.forEach((e) => {
    const name = e.account?.name || "Revenue";
    sourceMap[name] = (sourceMap[name] || 0) + Math.abs(e.amount);
  });
  Object.entries(sourceMap).forEach(([name, amount]) => {
    if (amount > topAmount) {
      topAmount = amount;
      topSource = name;
    }
  });

  const percent = totalIncome > 0 ? ((topAmount / totalIncome) * 100).toFixed(1) : 0;

  return (
    <span className="text-[#F4F5F9]">
      Money in reached <Capsule>${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}</Capsule> with <Capsule>{topSource}</Capsule> contributing <Capsule>{percent}%</Capsule> of total inflows.
    </span>
  );
};

export const generateOutflowNarrative = (totalExpense: number, entries: any[]) => {
  const expenseEntries = entries.filter((e) => e.account?.category === "EXPENSE");
  const count = expenseEntries.length;

  return (
    <span className="text-[#F4F5F9]">
      Spending was <Capsule>−${Math.abs(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 0 })}</Capsule> across <Capsule>{count} transactions</Capsule>. This is an increase of <Capsule>0%</Capsule> from the prior period.
    </span>
  );
};
