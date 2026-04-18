'use client'

import { useState, useMemo } from 'react'
import { Card, Badge, cn } from '@/components/ui-finova'
import { Landmark, Activity, ListChecks, DollarSign, ArrowRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react'

interface UnifiedLedgerRow {
  date: Date;
  type: 'DEBIT' | 'CREDIT';
  description: string;
  amount: number;
  debitAmount: number | null;
  creditAmount: number | null;
  runningBalance: number;
}

interface LedgerTerminalProps {
  charges: any[];
  ledgerEntries: any[];
}

export default function LedgerTerminal({ charges, ledgerEntries }: LedgerTerminalProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'compliance'>('compliance');

  const unifiedTimeline = useMemo(() => {
    const timeline: UnifiedLedgerRow[] = [];

    // Add ALL charges (Debits)
    charges.forEach(c => {
      timeline.push({
        date: new Date(c.dueDate),
        type: 'DEBIT',
        description: `${c.type} CHARGE: ${c.id.split('-')[0].toUpperCase()}`,
        amount: Number(c.amount),
        debitAmount: Number(c.amount),
        creditAmount: null,
        runningBalance: 0 // Placeholder
      });
    });

    // Add ALL ledger entries (Credits)
    ledgerEntries.forEach(e => {
      timeline.push({
        date: new Date(e.transactionDate),
        type: 'CREDIT',
        description: `PAYMENT: ${e.description || 'Verified Inflow'}`,
        amount: Math.abs(Number(e.amount)),
        debitAmount: null,
        creditAmount: Math.abs(Number(e.amount)),
        runningBalance: 0 // Placeholder
      });
    });

    // Sort by Date (Oldest to Newest)
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate Running Balance
    let currentBalance = 0;
    timeline.forEach(row => {
      if (row.type === 'DEBIT') {
        currentBalance += row.amount;
      } else {
        currentBalance -= row.amount;
      }
      row.runningBalance = currentBalance;
    });

    // Return Reversed for UI (Recent at top)
    return [...timeline].reverse();
  }, [charges, ledgerEntries]);

  return (
    <div className="bg-muted/5 border border-border rounded-[var(--radius)] overflow-hidden shadow-2xl backdrop-blur-sm">
      
      {/* TAB NAVIGATION: TACTICAL TOGGLE */}
      <div className="px-10 py-8 border-b border-border flex flex-col md:flex-row justify-between items-center gap-6 bg-muted/20">
        <div className="flex items-center gap-5">
           <Landmark className="w-6 h-6 text-brand opacity-40" />
           <h3 className="text-display font-weight-display text-foreground">Forensic Unified Ledger</h3>
        </div>

        <div className="flex p-1 bg-background border border-border rounded-[var(--radius)]">
           <button 
             onClick={() => setActiveTab('timeline')}
             className={cn(
               "px-6 py-2 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-[0.15em] transition-all",
               activeTab === 'timeline' ? "bg-muted text-foreground" : "text-foreground/20 hover:text-foreground/40"
             )}
           >
             Timeline
           </button>
           <button 
             onClick={() => setActiveTab('compliance')}
             className={cn(
               "px-6 py-2 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-[0.15em] transition-all",
               activeTab === 'compliance' ? "bg-muted text-foreground" : "text-foreground/20 hover:text-foreground/40"
             )}
           >
             Compliance
           </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {activeTab === 'timeline' ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">Temporal_Node</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">Description // Forensic_Tag</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 text-right">Debit (+)</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 text-right">Credit (-)</th>
                <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 text-right">Net_Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {unifiedTimeline.map((row, idx) => (
                <tr key={idx} className="group hover:bg-card[0.02] transition-colors">
                  <td className="px-10 py-5 whitespace-nowrap">
                    <span className="text-[10px] font-bold tabular-nums text-foreground/40 uppercase tracking-[0.1em]">{row.date.toLocaleDateString()}</span>
                  </td>
                  <td className="px-10 py-5">
                    <div className="flex items-center gap-4">
                       {row.type === 'DEBIT' ? (
                         <ArrowUpRight className="w-3 h-3 text-destructive/60" />
                       ) : (
                         <ArrowDownLeft className="w-3 h-3 text-mercury-green/60" />
                       )}
                       <span className="text-[13px] font-medium text-foreground tracking-tight truncate max-w-sm">{row.description}</span>
                    </div>
                  </td>
                  <td className="px-10 py-5 text-right">
                    {row.debitAmount ? (
                      <span className="text-[14px] text-destructive/80 font-finance tabular-nums">+${row.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <span className="text-foreground/10">-</span>
                    )}
                  </td>
                  <td className="px-10 py-5 text-right">
                    {row.creditAmount ? (
                      <span className="text-[14px] text-mercury-green font-finance tabular-nums">-${row.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    ) : (
                      <span className="text-foreground/10">-</span>
                    )}
                  </td>
                  <td className="px-10 py-5 text-right">
                    <span className={cn(
                      "text-[15px] font-finance tabular-nums",
                      row.runningBalance > 0 ? "text-destructive/80" : "text-mercury-green"
                    )}>
                      ${row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                 <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">Charge Node</th>
                 <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 text-center">Due_Temporal</th>
                 <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 text-center">Settlement_Date</th>
                 <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 text-right">Assessment</th>
                 <th className="px-10 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {charges.map((c) => {
                  const matchedEntry = ledgerEntries.find((e: any) => 
                    Math.abs(new Date(e.transactionDate).getTime() - new Date(c.dueDate).getTime()) < 30 * 24 * 60 * 60 * 1000
                  );
                  const isLate = matchedEntry && new Date(matchedEntry.transactionDate) > new Date(new Date(c.dueDate).getTime() + 5 * 24 * 60 * 60 * 1000);
                  
                  return (
                     <tr key={c.id} className="group hover:bg-muted/5 transition-colors">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-5">
                              <div className="bg-muted h-9 w-9 rounded-[var(--radius-sm)] flex items-center justify-center text-foreground/40 border border-border">
                                 <DollarSign className="w-4 h-4" />
                              </div>
                              <span className="text-foreground text-[13px] font-medium tracking-tight uppercase tracking-[0.1em]">{c.type}</span>
                           </div>
                        </td>
                        <td className="px-10 py-6 text-center">
                           <span className="text-[10px] font-bold tabular-nums text-foreground/40 uppercase tracking-[0.1em]">{new Date(c.dueDate).toLocaleDateString()}</span>
                        </td>
                        <td className="px-10 py-6 text-center">
                           {(matchedEntry && c.isFullyPaid) ? (
                             <span className={cn(
                               "text-[10px] font-bold tabular-nums uppercase tracking-[0.1em]",
                               isLate ? "text-amber-500" : "text-mercury-green/60"
                             )}>
                               {new Date(matchedEntry.transactionDate).toLocaleDateString()}
                             </span>
                           ) : (
                             <span className="text-[10px] font-bold text-destructive/20 uppercase tracking-[0.15em]">PENDING</span>
                           )}
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className="text-[18px] text-foreground font-finance tabular-nums font-medium tracking-tight">
                              ${Number(c.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                           </span>
                        </td>
                        <td className="px-10 py-6 text-right">
                           <span className={cn(
                              "px-3 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-[0.15em] border transition-colors",
                              c.isFullyPaid ? "bg-mercury-green/10 border-mercury-green/20 text-mercury-green" : "bg-destructive/10 border-destructive/20 text-destructive/80"
                           )}>
                              {c.isFullyPaid ? 'SETTLED' : 'OUTSTANDING'}
                           </span>
                        </td>
                     </tr>
                  )
               })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
