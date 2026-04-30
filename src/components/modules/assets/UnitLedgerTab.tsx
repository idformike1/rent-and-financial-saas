"use client";
import React, { useEffect, useState, useOptimistic } from 'react';
import { getUnitLedgerFeed } from '@/actions/asset.actions';
import { cn } from '@/lib/utils';
import { LedgerSkeleton } from '@/src/components/finova/ui/SovereignSkeleton';

interface LedgerEntryRow {
  id: string;
  transactionDate: string;
  description: string;
  amount: number | string;
  paymentMode: string;
  status: 'ACTIVE' | 'VOIDED';
  account: { category: string };
  isOptimistic?: boolean;
}

const formatValue = (amount: number | string, category: string) => {
  const num = Math.abs(Number(amount));
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  if (category === 'EXPENSE') return `( ${formatted} )`;
  return formatted;
};

import LedgerInjectionForm from './LedgerInjectionForm';

export default function UnitLedgerTab({ activeUnit }: { activeUnit: any }) {
  const unitId = activeUnit?.id;
  const [feed, setFeed] = useState<LedgerEntryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. OPTIMISTIC STRATUM
  const [optimisticFeed, addOptimisticEntry] = useOptimistic(
    feed,
    (state: LedgerEntryRow[], newEntry: LedgerEntryRow) => [newEntry, ...state]
  );

  useEffect(() => {
    let active = true;
    if (!unitId) return;
    
    setIsLoading(true);
    getUnitLedgerFeed(unitId).then(data => {
      if (active && data) {
        setFeed(data);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, [unitId]);

  if (isLoading) {
    return <LedgerSkeleton />;
  }


  const handleOptimisticInjection = async (entry: LedgerEntryRow) => {
    addOptimisticEntry(entry);
  };

  const refreshFeed = () => {
    if (!unitId) return;
    setIsLoading(true);
    getUnitLedgerFeed(unitId).then(data => {
      if (data) {
        setFeed(data);
      }
      setIsLoading(false);
    });
  };

  return (
    <div className="animate-in fade-in duration-300">
      <LedgerInjectionForm 
        activeUnit={activeUnit} 
        onOptimisticEntry={handleOptimisticInjection} 
        onSuccess={refreshFeed}
      />

      {optimisticFeed.length === 0 ? (
        <div className="w-full h-32 border border-dashed border-[#1F2937] flex items-center justify-center">
          <span className="font-mono text-[11px] text-[#9CA3AF] uppercase tracking-widest">
            NO LEDGER ARTIFACTS DETECTED
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-[#1F2937] bg-[#12121A]">
          <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#1A1A24] border-b border-[#1F2937]">
            <th className="text-left px-4 py-3 font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Date</th>
            <th className="text-left px-4 py-3 font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Descriptor</th>
            <th className="text-left px-4 py-3 font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Mode</th>
            <th className="text-right px-4 py-3 font-mono text-[10px] text-[#9CA3AF] uppercase tracking-widest">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1F2937]/50 text-[13px] font-mono">
          {optimisticFeed.map((entry, idx) => {
            const isVoided = entry.status === 'VOIDED';
            const isExpense = entry.account?.category === 'EXPENSE';
            const isPending = entry.isOptimistic;
            
            return (
              <tr 
                key={entry.id || idx} 
                className={cn(
                  "hover:bg-white/[0.02] transition-colors",
                  isVoided && "opacity-40 grayscale",
                  isPending && "opacity-60 italic animate-pulse"
                )}
              >
                <td className="px-4 py-3 text-[#E5E7EB] whitespace-nowrap">
                  {entry.transactionDate && !isNaN(new Date(entry.transactionDate).getTime())
                    ? new Date(entry.transactionDate).toISOString().split('T')[0]
                    : "PENDING"}
                </td>
                <td className="px-4 py-3 text-[#9CA3AF] truncate max-w-[150px]">
                  {entry.description || 'Optimistic Entry'}
                  {isPending && (
                    <span className="ml-2 inline-flex items-center gap-1.5 text-[10px] text-blue-400 font-bold tracking-widest animate-in fade-in slide-in-from-left-2 duration-500">
                      <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                      PENDING
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-[#E5E7EB]">
                  {entry.paymentMode}
                </td>
                <td className={cn(
                  "px-4 py-3 text-right tabular-nums",
                  isExpense ? "text-amber-500" : "text-[#5D71F9]"
                )}>
                  {formatValue(entry.amount, entry.account?.category)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
        </div>
      )}
    </div>
  );
}
