'use client';

import React, { useState, useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BreakdownCardProps {
  title: string;
  amount: number;
  entries: any[];
  type: 'INCOME' | 'EXPENSE';
}

export default function BreakdownCard({ title, amount, entries, type }: BreakdownCardProps) {
  const isIncome = type === 'INCOME';
  const subTabs = isIncome ? ['Source', 'Category', 'GL Code'] : ['Recipient', 'Category', 'GL Code'];
  const [activeSubTab, setActiveSubTab] = useState(subTabs[0]);

  const tableData = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach(e => {
      // Filter by type if provided, otherwise assume caller filtered
      if (type && e.account?.category !== type) return;

      let key = "Other";
      if (activeSubTab === 'Source' || activeSubTab === 'Recipient') {
        key = e.account?.name || "Unknown";
      } else if (activeSubTab === 'Category') {
        key = isIncome ? (e.account?.type || "Revenue") : (e.expenseCategory?.name || "Operations");
      } else if (activeSubTab === 'GL Code') {
        const prefix = isIncome ? '400' : '500';
        key = `${prefix}${e.account?.id?.slice(-1) || '1'}`;
      }

      map[key] = (map[key] || 0) + Math.abs(e.amount);
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);
    return Object.entries(map)
      .map(([name, val]) => ({
        name,
        amount: val,
        percent: Number((total > 0 ? (val / total) * 100 : 0).toFixed(1))
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [entries, activeSubTab, type, isIncome]);

  const barColor = isIncome ? 'var(--sidebar-primary)' : 'var(--destructive)'; // Indigo vs Pink/Red

  return (
    <div className="bg-card border border-white/[0.05] rounded-[var(--radius-sm)] p-6 flex flex-col gap-6  overflow-hidden relative">
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

      <div className="flex flex-col gap-1 relative z-10">
        <h3 className="text-[20px] font-normal text-white tracking-clinical font-arcadia">{title}</h3>
        <p className="text-[24px] font-normal text-white tracking-clinical font-finance">
          {isIncome ? '+' : '−'}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center p-[2px] bg-white/[0.02] border border-white/[0.05] rounded-[var(--radius-sm)] w-full relative z-10">
        {subTabs.map((tab) => (
          <div
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              "flex-1 text-center py-1.5 rounded-[var(--radius-sm)] text-[13px] font-normal cursor-pointer transition-all duration-200",
              activeSubTab === tab 
                ? "bg-muted text-foreground  border border-white/5" 
                : "text-clinical-muted hover:text-foreground"
            )}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Analytical Table */}
      <div className="w-full relative z-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-[12px] uppercase tracking-[0.08em] text-clinical-muted font-normal pb-3 w-[40%]">
                {activeSubTab === 'GL Code' ? 'GL Code' : (isIncome ? 'Source' : 'Recipient')}
              </th>
              <th className="text-left text-[12px] uppercase tracking-[0.08em] text-clinical-muted font-normal pb-3 w-[35%]">% of total</th>
              <th className="text-right text-[12px] uppercase tracking-[0.08em] text-clinical-muted font-normal pb-3 w-[25%]">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableData.length > 0 ? (
              tableData.map((row) => (
                <tr key={row.name} className="h-[48px] hover:bg-white/[0.02] transition-colors group">
                  <td className="text-[14px] leading-[20px] text-foreground font-normal truncate max-w-[150px]">{row.name}</td>
                  <td>
                    <div className="flex items-center gap-3 pr-4">
                      <div className="h-[4px] flex-1 bg-white/10 rounded-[var(--radius-sm)] overflow-hidden">
                        <div
                          className="h-full rounded-[var(--radius-sm)] transition-all duration-700 ease-[cubic-bezier(0.25, 0.1, 0.25, 1)]"
                          style={{ width: `${row.percent}%`, backgroundColor: barColor }}
                        />
                      </div>
                      <span className="text-[12px] text-clinical-muted font-mono min-w-[38px]">{row.percent}%</span>
                    </div>
                  </td>
                  <td className="text-right text-[14px] text-foreground font-mono">
                    ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-8 text-center text-clinical-muted text-[14px]">No data for this selection</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
