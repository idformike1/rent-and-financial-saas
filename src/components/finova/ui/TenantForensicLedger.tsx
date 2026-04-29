"use client";

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, History, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LedgerEntry {
  id: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  transactionDate: string | Date;
  description: string;
  referenceText?: string;
}

interface Charge {
  id: string;
  type: string;
  amount: number;
  amountPaid: number;
  dueDate: string | Date;
  isFullyPaid: boolean;
  ledgerEntries?: LedgerEntry[];
}

interface TenantForensicLedgerProps {
  charges: Charge[];
  tenantName: string;
}

/**
 * TENANT FORENSIC LEDGER (SOVEREIGN MICRO-VIEW)
 * 
 * A high-density analytical component representing the Waterfall Reconciliation logic.
 * Features nested drill-downs, forensic badges, and glassmorphic aesthetics.
 */
const TenantForensicLedger: React.FC<TenantForensicLedgerProps> = ({ charges, tenantName }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 1. FISCAL AGGREGATION
  const totalAccrued = charges.reduce((acc, c) => acc + Number(c.amount), 0);
  const totalLiquidated = charges.reduce((acc, c) => acc + Number(c.amountPaid), 0);
  const currentBalance = totalAccrued - totalLiquidated;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const getStatusBadge = (charge: Charge) => {
    if (charge.isFullyPaid) return <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Settle</span>;
    if (charge.amountPaid > 0) return <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">Partial</span>;
    return <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 bg-zinc-500/5 border border-zinc-500/10 px-2 py-0.5 rounded-full">Unpaid</span>;
  };

  if (!charges || charges.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl bg-zinc-950/20 backdrop-blur-md">
        <History className="w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">No forensic data found for {tenantName}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 1. BALANCE HEADER ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1 bg-zinc-950/50 border border-white/5 rounded-xl overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-r border-white/5 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Accrued</span>
          <span className="font-mono text-xl font-bold text-zinc-100">{formatCurrency(totalAccrued)}</span>
        </div>
        <div className="p-6 border-r border-white/5 flex flex-col items-center bg-emerald-500/5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 mb-1">Total Liquidated</span>
          <span className="font-mono text-xl font-bold text-emerald-400">{formatCurrency(totalLiquidated)}</span>
        </div>
        <div className="p-6 flex flex-col items-center bg-red-500/5">
          <span className="text-[10px] uppercase tracking-[0.2em] text-red-500 mb-1">Current Balance</span>
          <span className="font-mono text-xl font-bold text-red-400">{formatCurrency(currentBalance)}</span>
        </div>
      </div>

      {/* ── 2. FORENSIC TABLE ──────────────────────────────────────────────── */}
      <div className="border border-white/5 rounded-xl overflow-hidden bg-zinc-950/20 backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-900/50 border-bottom border-white/5">
              <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Due Date</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Obligation</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-right">Amount</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-right">Paid</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-zinc-500 font-medium text-center">Status</th>
              <th className="p-4 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {charges.map((charge) => (
              <React.Fragment key={charge.id}>
                <tr 
                  className={cn(
                    "group cursor-pointer border-t border-white/5 transition-colors hover:bg-white/5",
                    expandedId === charge.id && "bg-white/5"
                  )}
                  onClick={() => setExpandedId(expandedId === charge.id ? null : charge.id)}
                >
                  <td className="p-4 font-mono text-xs text-zinc-400">
                    {new Date(charge.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide">{charge.type.replace('_', ' ')}</span>
                      <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">{charge.id.split('-')[0]}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-mono text-xs font-bold text-zinc-200">
                    {formatCurrency(charge.amount)}
                  </td>
                  <td className="p-4 text-right font-mono text-xs text-emerald-400">
                    {formatCurrency(charge.amountPaid)}
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(charge)}
                  </td>
                  <td className="p-4 text-zinc-600">
                    {expandedId === charge.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </td>
                </tr>

                {/* ── 3. WATERFALL DRILL-DOWN ──────────────────────────────────── */}
                <AnimatePresence>
                  {expandedId === charge.id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-black/40"
                    >
                      <td colSpan={6} className="p-0">
                        <div className="px-6 py-4 space-y-3 border-l-2 border-emerald-500/50 m-4 bg-emerald-500/5 rounded-r-lg">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-bold mb-4 flex items-center">
                            <ShieldCheck className="w-3 h-3 mr-2" /> Liquidation Trace
                          </p>
                          
                          {charge.ledgerEntries && charge.ledgerEntries.length > 0 ? (
                            <div className="space-y-2">
                              {charge.ledgerEntries.map((entry) => (
                                <div key={entry.id} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded border border-white/5">
                                  <div className="flex flex-col">
                                    <span className="text-[11px] text-zinc-100 font-medium">{entry.description}</span>
                                    <span className="text-[9px] text-zinc-500 font-mono">{new Date(entry.transactionDate).toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded italic">
                                      {entry.referenceText || 'NO_REF'}
                                    </span>
                                    <span className="text-xs font-mono font-bold text-emerald-400">
                                      +{formatCurrency(entry.amount)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center text-zinc-500 text-[11px] italic">
                              <AlertCircle className="w-3 h-3 mr-2" /> No payments applied to this obligation yet.
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TenantForensicLedger;
