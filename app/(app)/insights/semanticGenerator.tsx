import React from 'react';

// The Workstation Capsule component for semantic data highlighting
export const Capsule = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-white/10 text-white rounded-[4px] px-1.5 py-0.5 font-mono text-[13px] mx-1 border border-white/5 shadow-sm">
    {children}
  </span>
);

export const generateRunwayNarrative = (burnRate: number, totalAssets: number) => {
  if (totalAssets <= 0) {
    return <span>System requires established treasury balances to compute runway trajectory.</span>;
  }
  
  if (burnRate <= 0) {
    return (
      <span>
        Your operations are cash-flow positive. Treasury holds <Capsule>${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Capsule> with <Capsule>Infinite</Capsule> runway.
      </span>
    );
  }

  const runway = (totalAssets / burnRate).toFixed(1);
  return (
    <span>
      Based on your monthly burn rate, you have <Capsule>{runway} months</Capsule> of runway remaining in treasury.
    </span>
  );
};

export const generateIncomeNarrative = (totalIncome: number, entries: any[]) => {
  const incomeEntries = entries.filter((e) => e.account?.category === "INCOME");
  
  if (incomeEntries.length === 0) {
    return <span>No significant inflow telemetry registered for this period.</span>;
  }

  // Find the top income entry or category
  let topSource = "General Revenue";
  let topAmount = 0;

  // Aggregate by account name to find top source
  const sourceMap: Record<string, number> = {};
  incomeEntries.forEach((e) => {
    const name = e.account?.name || "Revenue";
    sourceMap[name] = (sourceMap[name] || 0) + e.amount;
  });

  Object.entries(sourceMap).forEach(([name, amount]) => {
    if (amount > topAmount) {
      topAmount = amount;
      topSource = name;
    }
  });

  const percent = totalIncome > 0 ? ((topAmount / totalIncome) * 100).toFixed(1) : 0;

  return (
    <span>
      Inflow velocity reached <Capsule>${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Capsule>. Your primary source was <Capsule>{topSource}</Capsule>, representing <Capsule>{percent}%</Capsule> of total income.
    </span>
  );
};

export const generateOutflowNarrative = (totalExpense: number, entries: any[]) => {
  const expenseEntries = entries.filter((e) => e.account?.category === "EXPENSE");
  const count = expenseEntries.length;

  if (count === 0) {
    return <span>No expenditure registered. Operations holding nominal flow.</span>;
  }

  return (
    <span>
      Total spending was <Capsule>−${Math.abs(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 2 })}</Capsule> spread across <Capsule>{count} transactions</Capsule> this period.
    </span>
  );
};
