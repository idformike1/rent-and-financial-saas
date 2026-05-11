'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Filter, Receipt, Plus, Calendar, User, FileText, ChevronDown, Home, Wrench, ArrowDownRight, ArrowUpRight, Ban, Activity } from 'lucide-react';
import { Button, Badge } from '@/src/components/finova/ui-finova';
import { Card } from '@/src/components/system/Card';
import { motion, AnimatePresence } from 'framer-motion';

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

const humanize = (str: string) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/[_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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
    <div className="flex flex-col h-full bg-transparent">
      {/* Unified Header */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-inner transition-colors group-hover:border-brand/30">
            <Activity className="w-5 h-5 text-brand/80" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-[13px] font-bold text-white tracking-tight leading-none mb-1.5 uppercase">LEDGER</h2>
            <p className="text-[10px] font-medium text-white/40 leading-none">
              {filteredEntries.length} transactions
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          disabled={disabled}
          onClick={onLogTransaction}
          className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-brand hover:bg-brand/10 border border-brand/20 rounded-xl disabled:opacity-20 transition-all shadow-lg shadow-brand/5"
        >
          <Plus className="w-3.5 h-3.5 mr-2" /> Log Entry
        </Button>
      </div>

      {/* Synchronized Filters */}
      <div className="flex items-center gap-4 mb-8 px-1">
        {[
          { 
            label: 'Nodes', 
            value: filterUnit, 
            setter: setFilterUnit, 
            options: [{id: 'ALL', label: 'All Nodes'}, ...allUnits.map((u: any) => ({id: u.id, label: u.unitNumber.replace(/^Unit\s+/i, 'Node ')}))] 
          },
          { 
            label: 'Flows', 
            value: filterType, 
            setter: setFilterType, 
            options: [{id: 'ALL', label: 'All Flows'}, {id: 'INCOME', label: 'Inflow'}, {id: 'EXPENSE', label: 'Outflow'}] 
          },
          { 
            label: 'Time', 
            value: filterMonth, 
            setter: setFilterMonth, 
            options: [{id: 'ALL', label: 'All Time'}, ...uniqueMonths.map(m => ({id: m, label: m}))] 
          }
        ].map((filter, i) => (
          <ClinicalDropdown 
            key={i}
            value={filter.value}
            options={filter.options}
            onChange={filter.setter}
          />
        ))}
      </div>

      {/* Activity Feed (Adaptive Slabs) */}
      <div className="h-[70vh] xl:h-full xl:flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {filteredEntries.map((entry) => {
          const amount = Number(entry.amount);
          const isIncome = amount > 0;
          const date = new Date(entry.transactionDate);
          const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const Icon = getTransactionIcon(entry.description, amount);
          
          return (
            <div 
              key={entry.id} 
              className="group relative transition-all duration-300 ease-out p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.08] hover:border-white/25 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/50 cursor-pointer"
            >
              <div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
                
                {/* 1. Transaction Icon */}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border transition-all shrink-0",
                  isIncome ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" : "bg-white/5 border-white/5 text-white/20"
                )}>
                  <Icon size={16} className="group-hover:scale-110 transition-transform" />
                </div>

                {/* 2. Description & Metadata */}
                <div className="flex flex-col w-full min-w-0">
                  <h3 className="text-[13px] font-semibold text-white tracking-tight leading-tight truncate group-hover:text-white transition-colors">
                    {humanize(entry.description || entry.expenseCategory?.name || 'Fiscal Operation')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-bold text-white/20 tracking-tight whitespace-nowrap">
                      {dateStr}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/5" />
                    <span className="text-[10px] font-bold text-white/20 tracking-tight truncate">
                      {humanize(entry.type)}
                    </span>
                  </div>
                </div>

                {/* 3. Amount Section */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-none">
                  <div className="sm:hidden text-[9px] font-bold text-white/20">Amount</div>
                  <div className="flex flex-col items-end">
                    <span className={cn(
                      "text-[15px] font-bold tabular-nums tracking-tight leading-none",
                      isIncome ? "text-emerald-500" : "text-white"
                    )}>
                      {isIncome ? '+' : '-'}{formatCurrency(Math.abs(amount))}
                    </span>
                    <span className="hidden sm:block text-[9px] text-white/10 font-bold tracking-tight mt-1.5">
                      {isIncome ? 'Inflow' : 'Outflow'}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          );
        })}

        {filteredEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center border border-white/5">
              <Ban className="w-8 h-8 text-white/5" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-white/20 uppercase tracking-widest">No Transactions</p>
              <p className="text-[10px] text-white/10 font-medium uppercase tracking-tight">System is awaiting ledger ingestion.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ClinicalDropdown({ value, options, onChange }: { value: string, options: any[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.id === value) || options[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 group border",
          isOpen ? "bg-white/5 border-white/10 text-white" : "text-white/40 border-white/5 hover:text-white hover:bg-white/5"
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest">{selectedOption.label}</span>
        <ChevronDown 
          size={10} 
          className={cn(
            "text-white/20 transition-transform duration-200",
            isOpen ? "rotate-180" : "group-hover:text-white/40"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 w-48 bg-[#09090B] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
            >
              <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar">
                {options.map((opt) => (
                  <button 
                    key={opt.id}
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest",
                      opt.id === value 
                        ? "bg-white/10 text-white pointer-events-none" 
                        : "hover:bg-white/5 text-white/40 hover:text-white"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
