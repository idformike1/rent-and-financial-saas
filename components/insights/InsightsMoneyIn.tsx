'use client';

import React from 'react';
import SummaryCard from './SummaryCard';
import BreakdownCard from './BreakdownCard';

interface InsightsMoneyInProps {
  entries: any[];
  income: number;
}

export default function InsightsMoneyIn({ entries, income }: InsightsMoneyInProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <SummaryCard entries={entries.filter(e => e.account?.category === "INCOME")} title="Summary" />
      <BreakdownCard 
        title="Money in" 
        amount={income} 
        entries={entries} 
        type="INCOME" 
      />
    </div>
  );
}
