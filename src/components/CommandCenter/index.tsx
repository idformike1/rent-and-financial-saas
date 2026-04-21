'use client';

import React, { useState, useTransition } from 'react';
import { CreditCard, Receipt, Activity } from 'lucide-react';
import { LedgerView } from './LedgerView';
import { UtilityForm } from './UtilityForm';
import { PaymentForm } from './PaymentForm';

/**
 * FINANCIAL COMMAND CENTER (MERCURY UI REFACTORED)
 * 
 * Modular monolith decomposition hosting the primary fiscal controls for 
 * tenant-level operations.
 */

interface DashboardProps {
  tenant: {
    id: string;
    name: string;
    leaseId: string;
    unitId: string;
  };
  ledgerEntries: any[];
  balance: number;
}

export function FinancialCommandCenter({ tenant, ledgerEntries, balance }: DashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'ACCRUAL' | 'PAYMENT'>('LEDGER');

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#1C1C1C] border border-white/10 p-6 rounded-[var(--radius-sm)] shadow-xl">
        <div>
          <h1 className="text-xl font-bold tracking-clinical text-white mb-1 uppercase">Tenancy Command Center</h1>
          <p className="text-[11px] text-clinical-muted uppercase font-bold tracking-widest">Fiscal Operations: <span className="text-white">{tenant.name}</span></p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <div className="bg-black/50 px-4 py-2 rounded-[var(--radius-sm)] border border-white/5">
            <p className="text-[9px] text-clinical-muted uppercase tracking-widest font-bold mb-1">Current Balance</p>
            <p className={`text-xl font-finance tracking-clinical ${balance > 0 ? 'text-rose-400' : 'text-mercury-green'}`}>
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <NavButton icon={<Receipt size={14} />} label="A/R Ledger" active={activeTab === 'LEDGER'} onClick={() => setActiveTab('LEDGER')} />
          <NavButton icon={<Activity size={14} />} label="Utility & Billing" active={activeTab === 'ACCRUAL'} onClick={() => setActiveTab('ACCRUAL')} />
          <NavButton icon={<CreditCard size={14} />} label="Log Payment" active={activeTab === 'PAYMENT'} onClick={() => setActiveTab('PAYMENT')} />
        </div>
        
        <div className="lg:col-span-3">
          {activeTab === 'LEDGER' && <LedgerView entries={ledgerEntries} />}
          {activeTab === 'ACCRUAL' && <UtilityForm tenant={tenant} isPending={isPending} startTransition={startTransition} />}
          {activeTab === 'PAYMENT' && <PaymentForm tenant={tenant} isPending={isPending} startTransition={startTransition} />}
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--radius-sm)] text-[11px] font-bold tracking-widest uppercase transition-all duration-200 border ${
        active 
          ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' 
          : 'text-clinical-muted hover:bg-white/5 border-transparent'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
