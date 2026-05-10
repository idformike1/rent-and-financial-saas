'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Filter, Receipt, Plus, Calendar, User, FileText, ChevronDown, Home, Wrench, ArrowDownRight, ArrowUpRight, Ban, Activity } from 'lucide-react';
import { Button, Badge } from '@/src/components/finova/ui-finova';
import { Card } from '@/src/components/system/Card';

interface FinancialActivityFeedProps {
  propertyData: any;
  ledgerEntries: any[];
  onLogTransaction: () => void;
  disabled?: boolean;
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(val);

const getTransactionIcon = (description: string = '', amount: number) => {
  const desc = description.toLowerCase();
  if (desc.includes('rent')) return Home;
  if (desc.includes('repair') || desc.includes('maintenance') || desc.includes('service')) return Wrench;
  if (desc.includes('refund') || desc.includes('reversal')) return Ban;
  return amount > 0 ? ArrowDownRight : ArrowUpRight;
};

export default function FinancialActivityFeed({ 
  propertyData, 
  ledgerEntries = [], 
  onLogTransaction,
  disabled
}: FinancialActivityFeedProps) {
  const [filterUnit, setFilterUnit] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [filterMonth, setFilterMonth] = useState('ALL');

  const allUnits = propertyData.units || [];

  // Extract unique months from ledger for the filter
  const uniqueMonths = Array.from(new Set(ledgerEntries.map(e => {
    const d = new Date(e.transactionDate);
    return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
  }))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const filteredEntries = ledgerEntries.filter(entry => {
    const selectedUnit = allUnits.find((u: any) => u.id === filterUnit);
    const unitTenantIds = selectedUnit?.leases?.map((l: any) => l.tenant?.id).filter(Boolean) || [];
    
    const matchesUnit = filterUnit === 'ALL' || 
                        entry.unitId === filterUnit || 
                        (entry.tenantId && unitTenantIds.includes(entry.tenantId));

    const matchesType = filterType === 'ALL' || (
      filterType === 'INCOME' ? Number(entry.amount) > 0 : Number(entry.amount) < 0
    );
    
    const d = new Date(entry.transactionDate);
    const monthStr = `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
    const matchesMonth = filterMonth === 'ALL' || monthStr === filterMonth;

    return matchesUnit && matchesType && matchesMonth;
  });

  return (
    <Card className="flex flex-col h-full p-0 border-none bg-transparent shadow-none">
      {/* Unified Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-muted/10 border border-border/40 flex items-center justify-center">
            <Activity className="w-4 h-4 text-brand/60" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Fiscal Pulse</h2>
            <p className="text-[9px] font-medium text-muted-foreground/30 uppercase tracking-tight">{filteredEntries.length} Recorded Events</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={disabled}
          onClick={onLogTransaction}
          className="h-8 px-3 text-[9px] font-bold uppercase tracking-widest text-brand hover:bg-brand/5 border border-brand/20 rounded-lg disabled:opacity-20 transition-all"
        >
          <Plus className="w-3 h-3 mr-1.5" /> Log Entry
        </Button>
      </div>

      {/* Synchronized Filters */}
      <div className="flex items-center gap-2 mb-8 px-1">
        {[
          { value: filterUnit, setter: setFilterUnit, options: [{id: 'ALL', label: 'ALL UNITS'}, ...allUnits.map((u: any) => ({id: u.id, label: `UNIT ${u.unitNumber.replace(/^Unit\s+/i, '')}`}))] },
          { value: filterType, setter: setFilterType, options: [{id: 'ALL', label: 'ALL TYPES'}, {id: 'INCOME', label: 'INCOME'}, {id: 'EXPENSE', label: 'EXPENSES'}] },
          { value: filterMonth, setter: setFilterMonth, options: [{id: 'ALL', label: 'ALL TIME'}, ...uniqueMonths.map(m => ({id: m, label: m.toUpperCase()}))] }
        ].map((filter, i) => (
          <div key={i} className="relative group flex-1">
            <select 
              value={filter.value}
              onChange={(e) => filter.setter(e.target.value)}
              className="w-full appearance-none bg-muted/5 hover:bg-muted/10 border border-border/20 rounded-lg px-3 py-2 pr-8 text-[9px] font-bold text-muted-foreground/60 outline-none transition-all cursor-pointer focus:border-brand/40 uppercase tracking-wider"
              style={{ backgroundColor: 'var(--background)' }}
            >
              {filter.options.map(opt => (
                <option key={opt.id} value={opt.id} style={{ backgroundColor: '#0A0A0A' }}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Activity Feed */}
      <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {filteredEntries.map((entry) => {
          const amount = Number(entry.amount);
          const isIncome = amount > 0;
          const date = new Date(entry.transactionDate);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const Icon = getTransactionIcon(entry.description, amount);
          
          return (
            <div key={entry.id} className="group relative flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-all border border-transparent hover:border-white/5">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                  isIncome ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" : "bg-white/5 border-white/5 text-white/20"
                )}>
                  <Icon size={16} className="group-hover:scale-110 transition-transform" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-muted-foreground/20 uppercase tracking-[0.2em]">
                    {dateStr} • {entry.type}
                  </span>
                  <h3 className="text-[11px] font-bold text-foreground/80 tracking-tight leading-none group-hover:text-foreground transition-colors">
                    {entry.description || entry.expenseCategory?.name || 'FISCAL OPERATION'}
                  </h3>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-xs font-bold tabular-nums tracking-tight",
                  isIncome ? "text-emerald-500" : "text-foreground"
                )}>
                  {isIncome ? '+' : ''}{formatCurrency(Math.abs(amount))}
                </span>
              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-muted/5 rounded-full flex items-center justify-center border border-border/40">
              <Ban className="w-8 h-8 text-muted-foreground/10" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Fiscal Events</p>
              <p className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-tight">System is awaiting ledger ingestion.</p>
            </div>
          </div>
        )}
      </div>
    </Card>


  );
}
