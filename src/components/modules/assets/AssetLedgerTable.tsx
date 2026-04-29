'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { AssetProperty } from "@/src/services/queries/assets.services";
import { Filter, Receipt, Plus, Upload } from 'lucide-react';
import { toast } from '@/lib/toast';

interface AssetLedgerTableProps {
  properties: AssetProperty[];
  ledgerEntries?: any[];
}

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined || isNaN(Number(val))) return '—';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(Number(val));
};

export default function AssetLedgerTable({ properties, ledgerEntries = [] }: AssetLedgerTableProps) {
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const allUnits = properties.flatMap(p => p.units || []);

  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesUnit = filterUnit === 'ALL' || entry.unitId === filterUnit;
    const matchesType = filterType === 'ALL' || (
      filterType === 'INCOME' ? Number(entry.amount) > 0 : Number(entry.amount) < 0
    );
    return matchesUnit && matchesType;
  });

  return (
    <div className="flex flex-col w-full">
      {/* ── FILTER BAR ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between p-4 bg-muted/20 border-b border-border gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted-foreground" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Filters</span>
          </div>
          
          <select 
            value={filterUnit} 
            onChange={(e) => setFilterUnit(e.target.value)}
            className="bg-card border border-border text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-brand/40 text-foreground/80 appearance-none cursor-pointer"
          >
            <option value="ALL">All Units</option>
            {allUnits.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.unitNumber}</option>
            ))}
          </select>

          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-card border border-border text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-brand/40 text-foreground/80 appearance-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
      </div>

      {/* ── TABLE / EMPTY HUB ────────────────────────────────────────────── */}
      <div className="w-full">
        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-muted-foreground text-left border-b border-border bg-muted/10">
                  <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-widest">Timestamp</th>
                  <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-widest">Unit / Entity</th>
                  <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-widest">Description</th>
                  <th className="py-3 px-6 text-[10px] font-bold uppercase tracking-widest text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 px-6 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {new Date(entry.transactionDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-foreground">
                          {allUnits.find(u => u.id === entry.unitId)?.unitNumber || 'Global'}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">
                          {entry.tenant?.name || 'Asset Registry'}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-6">
                      <p className="text-xs text-foreground/60 truncate max-w-[250px]">
                        {entry.description || entry.expenseCategory?.name || 'Fiscal Operation'}
                      </p>
                    </td>
                    <td className="py-2.5 px-6 text-right">
                      <span className={cn(
                        "font-mono text-sm font-bold tabular-nums",
                        Number(entry.amount) > 0 ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {formatCurrency(Math.abs(Number(entry.amount)))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <Receipt className="w-6 h-6 text-muted-foreground opacity-40" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold text-foreground">No transactions recorded</p>
                <p className="text-xs text-muted-foreground leading-relaxed">This ledger is currently silent. Log a manual transaction or import bank statements to begin fiscal surveillance.</p>
              </div>
              <div className="flex items-center gap-3 w-full">
                <button 
                  onClick={() => toast.info('Transaction log pending.')}
                  className="flex-1 h-10 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand/90 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Log Transaction
                </button>
                <button 
                  onClick={() => toast.info('Import engine pending.')}
                  className="flex-1 h-10 bg-muted text-foreground rounded-lg text-xs font-bold hover:bg-accent transition-all flex items-center justify-center gap-2 border border-border"
                >
                  <Upload className="w-4 h-4" /> Import Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
