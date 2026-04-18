'use client';

import React, { useMemo } from 'react';

interface SummaryCardProps {
  entries: any[];
  title?: string;
}

export default function SummaryCard({ entries, title = "Summary" }: SummaryCardProps) {
  const metrics = useMemo(() => {
    const transactions = entries.length;
    const uniqueAccounts = new Set(entries.map(e => e.accountId)).size;
    
    // Calculate fees: search for 'fee' in account name or category
    const fees = entries.reduce((sum, e) => {
      const accountName = e.account?.name?.toLowerCase() || '';
      const catName = e.expenseCategory?.name?.toLowerCase() || '';
      if (accountName.includes('fee') || catName.includes('fee')) {
        return sum + Math.abs(e.amount);
      }
      return sum;
    }, 0);

    return { transactions, uniqueAccounts, fees };
  }, [entries]);

  return (
    <div className="bg-card border border-white/[0.05] rounded-[var(--radius)] p-6 flex flex-col gap-8  relative overflow-hidden">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

      <h3 className="text-[14px] font-normal text-muted-foreground tracking-tight relative z-10">{title}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 relative z-10">
        {/* Metric 1: Transactions */}
        <div className="flex flex-col gap-2 border-b border-white/5 pb-4 md:border-b-0 md:pb-0">
          <span className="text-[13px] text-muted-foreground font-normal tracking-tight">Transactions</span>
          <span className="text-[28px] text-white font-normal font-finance leading-none">
            {metrics.transactions.toLocaleString()}
          </span>
        </div>

        {/* Metric 2: Accounts/Cards Used */}
        <div className="flex flex-col gap-2 border-b border-white/5 pb-4 md:border-b-0 md:pb-0">
          <span className="text-[13px] text-muted-foreground font-normal tracking-tight">Accounts used</span>
          <span className="text-[28px] text-white font-normal font-finance leading-none">
            {metrics.uniqueAccounts.toLocaleString()}
          </span>
        </div>

        {/* Metric 3: Fees Paid (Full Width) */}
        <div className="flex flex-col gap-2 col-span-1 md:col-span-2 mt-2">
          <span className="text-[13px] text-muted-foreground font-normal tracking-tight">Fees paid</span>
          <span className="text-[28px] text-white font-normal font-finance leading-none">
            {metrics.fees > 0 ? '−' : ''}${metrics.fees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
}
