'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Filter, Receipt, Plus, Calendar, User, FileText, ChevronDown } from 'lucide-react';
import { Button, Badge } from '@/src/components/finova/ui-finova';
import { Card } from '@/src/components/system/Card';

interface FinancialActivityFeedProps {
  propertyData: any;
  ledgerEntries: any[];
  onLogTransaction: () => void;
}

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  }).format(val);

export default function FinancialActivityFeed({ 
  propertyData, 
  ledgerEntries = [], 
  onLogTransaction 
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted/20 rounded-lg">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Financial Activity</h2>
          <Badge variant="default" className="text-[10px] font-bold opacity-60">{filteredEntries.length}</Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogTransaction}
          className="text-[10px] font-bold uppercase tracking-widest text-brand hover:bg-brand/5"
        >
          <Plus className="w-3 h-3 mr-1.5" /> Log Transaction
        </Button>
      </div>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-8">
        <div className="relative group">
          <select 
            value={filterUnit}
            onChange={(e) => setFilterUnit(e.target.value)}
            className="appearance-none bg-muted/20 hover:bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 pr-8 text-[10px] font-bold text-muted-foreground outline-none transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
          >
            <option value="ALL" style={{ backgroundColor: '#000' }}>ALL UNITS</option>
            {allUnits.map((u: any) => (
              <option key={u.id} value={u.id} style={{ backgroundColor: '#000' }}>UNIT {u.unitNumber.replace(/^Unit\s+/i, '')}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
        </div>

        <div className="relative group">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="appearance-none bg-muted/20 hover:bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 pr-8 text-[10px] font-bold text-muted-foreground outline-none transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
          >
            <option value="ALL" style={{ backgroundColor: '#000' }}>ALL TYPES</option>
            <option value="INCOME" style={{ backgroundColor: '#000' }}>INCOME ONLY</option>
            <option value="EXPENSE" style={{ backgroundColor: '#000' }}>EXPENSES ONLY</option>
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
        </div>

        <div className="relative group">
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="appearance-none bg-muted/20 hover:bg-muted/30 border border-border/50 rounded-lg px-3 py-1.5 pr-8 text-[10px] font-bold text-muted-foreground outline-none transition-all cursor-pointer"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
          >
            <option value="ALL" style={{ backgroundColor: '#000' }}>ALL TIME</option>
            {uniqueMonths.map(m => (
              <option key={m} value={m} style={{ backgroundColor: '#000' }}>{m.toUpperCase()}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto space-y-6 pr-2 custom-scrollbar">
        {filteredEntries.map((entry) => {
          const isIncome = Number(entry.amount) > 0;
          const date = new Date(entry.transactionDate);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          
          return (
            <div key={entry.id} className="group relative flex items-start justify-between border-b border-border/10 pb-4 last:border-0">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest">
                  {dateStr}
                </span>
                <h3 className="text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                  {entry.description || entry.expenseCategory?.name || 'Fiscal Operation'}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="default" 
                    className={cn(
                      "text-[8px] font-bold px-1.5 py-0 border",
                      entry.type === 'CREDIT' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-muted/30 text-muted-foreground/60 border-border/50"
                    )}
                  >
                    {entry.type}
                  </Badge>
                  <span className="text-[10px] font-medium text-muted-foreground/40 uppercase tracking-widest">
                    {entry.status || 'SYSTEM'} NOTICE
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={cn(
                  "text-sm font-bold tabular-nums",
                  isIncome ? "text-emerald-500" : "text-foreground"
                )}>
                  {formatCurrency(Math.abs(Number(entry.amount)))}
                </span>
              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="p-4 bg-muted/10 rounded-full">
              <Receipt className="w-8 h-8 text-muted-foreground/20" />
            </div>
            <p className="text-sm font-bold text-muted-foreground/60">No activity recorded for this period</p>
          </div>
        )}
      </div>
    </Card>
  );
}
