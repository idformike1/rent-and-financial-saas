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
    <div className="bg-background border border-border rounded-[3rem] overflow-hidden shadow-2xl">
      
      {/* TAB NAVIGATION: TACTICAL TOGGLE */}
      <div className="px-12 py-10 border-b border-border flex flex-col md:flex-row justify-between items-center gap-8 bg-card/[0.02]">
        <div className="flex items-center gap-6">
           <Landmark className="w-8 h-8 text-brand" />
           <h3 className="text-xl font-black text-foreground italic tracking-tighter uppercase leading-none font-mono">Forensic Unified Ledger</h3>
        </div>

        <div className="flex p-1.5 bg-slate-900 rounded-3xl border border-white/5 font-mono">
           <button 
             onClick={() => setActiveTab('timeline')}
             className={cn(
               "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeTab === 'timeline' ? "bg-white/5 text-foreground shadow-xl" : "text-slate-500 hover:text-slate-300"
             )}
           >
             [ CHRONOLOGICAL_LEDGER ]
           </button>
           <button 
             onClick={() => setActiveTab('compliance')}
             className={cn(
               "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeTab === 'compliance' ? "bg-white/5 text-foreground shadow-xl" : "text-slate-500 hover:text-slate-300"
             )}
           >
             [ COMPLIANCE_MATRIX ]
           </button>
        </div>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {activeTab === 'timeline' ? (
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/5 bg-card/[0.01]">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Description</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Debit (+)</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Credit (-)</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Net_Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {unifiedTimeline.map((row, idx) => (
                <tr key={idx} className="group hover:bg-card/[0.02] transition-colors">
                  <td className="px-10 py-6 whitespace-nowrap">
                    <span className="text-[10px] font-black text-slate-500 uppercase">{row.date.toLocaleDateString()}</span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                       {row.type === 'DEBIT' ? (
                         <ArrowUpRight className="w-3 h-3 text-rose-500/50" />
                       ) : (
                         <ArrowDownLeft className="w-3 h-3 text-emerald-500/50" />
                       )}
                       <span className="text-xs font-bold text-foreground uppercase tracking-tight truncate max-w-sm">{row.description}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    {row.debitAmount ? (
                      <span className="text-sm font-black text-rose-500 font-finance tabular-nums">+${row.debitAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    ) : '-'}
                  </td>
                  <td className="px-10 py-6 text-right">
                    {row.creditAmount ? (
                      <span className="text-sm font-black text-emerald-500 font-finance tabular-nums">-${row.creditAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    ) : '-'}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className={cn(
                      "text-md font-black font-finance tabular-nums italic",
                      row.runningBalance > 0 ? "text-rose-500" : "text-emerald-500"
                    )}>
                      ${row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="border-b border-white/5 bg-card/[0.01]">
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Charge Node</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Due Date</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-center">Payment Date</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Assessment</th>
                 <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {charges.map((c) => {
                  const matchedEntry = ledgerEntries.find((e: any) => 
                    Math.abs(new Date(e.transactionDate).getTime() - new Date(c.dueDate).getTime()) < 30 * 24 * 60 * 60 * 1000
                  );
                  const isLate = matchedEntry && new Date(matchedEntry.transactionDate) > new Date(new Date(c.dueDate).getTime() + 5 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <tr key={c.id} className="group hover:bg-card/[0.02] transition-colors">
                       <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                             <div className="bg-slate-900 h-10 w-10 rounded-xl flex items-center justify-center text-brand border border-white/5">
                                <DollarSign className="w-4 h-4" />
                             </div>
                             <span className="font-black text-foreground text-xs uppercase tracking-tighter italic">{c.type}</span>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(c.dueDate).toLocaleDateString()}</span>
                       </td>
                       <td className="px-10 py-8 text-center">
                          {(matchedEntry && c.isFullyPaid) ? (
                            <span className={cn(
                              "text-[10px] font-black uppercase tracking-widest",
                              isLate ? "text-amber-500" : "text-emerald-500"
                            )}>
                              {new Date(matchedEntry.transactionDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-rose-500/40 uppercase tracking-widest">PENDING</span>
                          )}
                       </td>
                       <td className="px-10 py-8 text-right">
                          <span className="text-lg font-black text-foreground tracking-tighter italic font-finance tabular-nums">
                             ${Number(c.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <span className={cn(
                             "px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase border-2",
                             c.isFullyPaid ? "border-emerald-500/30 text-emerald-500" : "border-rose-500/30 text-rose-500"
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
