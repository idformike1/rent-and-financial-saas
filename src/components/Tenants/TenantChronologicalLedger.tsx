"use client";

import React from 'react';
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';

interface LedgerItem {
  id: string;
  date: string;
  description: string;
  type: 'CHARGE' | 'PAYMENT';
  amount: number;
}

interface TenantChronologicalLedgerProps {
  charges: any[];
  ledgerEntries: any[];
}

/**
 * TENANT CHRONOLOGICAL LEDGER (THE TRUTH FEED)
 * 
 * Merges Charges (Debits) and Payments (Credits) into a single 
 * chronological stream to visualize the rent lifecycle.
 */
export default function TenantChronologicalLedger({ charges, ledgerEntries }: TenantChronologicalLedgerProps) {
  // 1. Merge and Normalize
  const mergedItems: LedgerItem[] = [
    ...charges.map(c => ({
      id: c.id,
      date: c.dueDate,
      description: `${c.type.replace('_', ' ')} Obligation`,
      type: 'CHARGE' as const,
      amount: Number(c.amount)
    })),
    ...ledgerEntries.map(e => ({
      id: e.id,
      date: e.transactionDate,
      description: e.description,
      type: 'PAYMENT' as const,
      amount: Number(e.amount)
    }))
  ];

  // 2. Sort Ascending to calculate Running Balance correctly
  const ascendingItems = [...mergedItems].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  let runningBalance = 0;
  const itemsWithBalance = ascendingItems.map(item => {
    if (item.type === 'CHARGE') {
      runningBalance += item.amount;
    } else {
      runningBalance -= item.amount;
    }
    return { ...item, balance: runningBalance };
  });

  // 3. Sort Descending for display (Newest First)
  const displayItems = [...itemsWithBalance].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-[10px] text-foreground/40 font-bold uppercase tracking-[0.15em] flex items-center gap-3">
             <Landmark className="w-4 h-4 text-amber-500 opacity-40" /> Historical Truth Feed
          </h3>
          <p className="text-xl font-light tracking-tight text-white mt-1">Chronological Ledger</p>
        </div>
      </div>

      <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-950/20 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-white/5">
                <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Date</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Description</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-center">Event</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-right">Amount</th>
                <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-right">Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item) => (
                <tr key={item.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4 font-mono text-xs text-zinc-400">
                    {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors">{item.description}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center justify-center w-fit mx-auto gap-1",
                      item.type === 'CHARGE' 
                        ? "border-amber-500/20 text-amber-500 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.05)]" 
                        : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.05)]"
                    )}>
                      {item.type === 'CHARGE' ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownLeft className="w-2.5 h-2.5" />}
                      {item.type}
                    </span>
                  </td>
                  <td className={cn(
                    "p-4 text-right font-mono text-xs font-bold",
                    item.type === 'CHARGE' ? "text-zinc-200" : "text-emerald-400"
                  )}>
                    {item.type === 'PAYMENT' ? '-' : ''}{formatCurrency(item.amount)}
                  </td>
                  <td className={cn(
                    "p-4 text-right font-mono text-xs font-bold",
                    item.balance > 0 ? "text-amber-500/80" : "text-zinc-400"
                  )}>
                    {formatCurrency(item.balance)}
                  </td>
                </tr>
              ))}
              {displayItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">
                    No historical entries detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
