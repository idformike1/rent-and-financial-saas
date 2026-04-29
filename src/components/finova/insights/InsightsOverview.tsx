'use client';

import React from 'react';
import BreakdownCard from './BreakdownCard';

interface InsightsOverviewProps {
  entries: any[];
  income: number;
  expense: number;
}

export default function InsightsOverview({
  entries,
  income,
  expense
}: InsightsOverviewProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <BreakdownCard 
        title="Money in" 
        amount={income} 
        entries={entries} 
        type="INCOME" 
      />
      <BreakdownCard 
        title="Money out" 
        amount={-expense} 
        entries={entries} 
        type="EXPENSE" 
      />
    </div>
  );
}
