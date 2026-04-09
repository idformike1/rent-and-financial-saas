'use client';

import React from 'react';
import SummaryCard from './SummaryCard';
import BreakdownCard from './BreakdownCard';

interface InsightsMoneyOutProps {
  entries: any[];
  expense: number;
}

export default function InsightsMoneyOut({ entries, expense }: InsightsMoneyOutProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <SummaryCard entries={entries.filter(e => e.account?.category === "EXPENSE")} title="Summary" />
      <BreakdownCard 
        title="Money out" 
        amount={-expense} 
        entries={entries} 
        type="EXPENSE" 
      />
    </div>
  );
}
