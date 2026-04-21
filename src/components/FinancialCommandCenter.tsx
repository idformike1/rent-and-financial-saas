'use client';

import React, { useState, useTransition } from 'react';
import { processPayment } from '@/actions/finance.actions';
import { generateUtilityAccrualAction } from '@/actions/billing.actions';
import { Card, Input, Button, Label, Badge, MercuryTable, THead, TBody, TR, TD, Select } from '@/components/ui-finova';
import { toast } from '@/lib/toast';
import { Activity, CreditCard, Receipt, FileText, Zap, Droplets, MinusCircle } from 'lucide-react';
import { PaymentMode } from '@prisma/client'; // Import PaymentMode from Prisma or use string

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
          {activeTab === 'ACCRUAL' && <ChargeEntryForm tenant={tenant} isPending={isPending} startTransition={startTransition} />}
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

function LedgerView({ entries }: { entries: any[] }) {
  return (
    <Card variant="muted" className="p-0 border-white/10 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-clinical">Accounts Receivable Ledger</h2>
        <p className="text-[11px] text-clinical-muted mt-1 uppercase font-bold tracking-widest">Immutable record of all financial events</p>
      </div>
      <div className="p-0">
        <MercuryTable>
          <THead>
            <TR isHeader>
              <TD isHeader>Date</TD>
              <TD isHeader>Description</TD>
              <TD isHeader>Type</TD>
              <TD isHeader className="text-right">Debit</TD>
              <TD isHeader className="text-right">Credit</TD>
            </TR>
          </THead>
          <TBody>
            {entries.length === 0 && (
              <TR>
                <TD colSpan={5}>
                  <div className="text-center text-clinical-muted py-8 text-[11px] uppercase font-bold tracking-widest">No events found in ledger</div>
                </TD>
              </TR>
            )}
            {entries.map((entry) => (
              <TR key={entry.id}>
                <TD variant="date">{new Date(entry.date).toLocaleDateString()}</TD>
                <TD>{entry.description}</TD>
                <TD>
                  <Badge variant={entry.type === 'DEBIT' ? 'danger' : 'success'}>
                    {entry.type}
                  </Badge>
                </TD>
                <TD className={`text-right font-finance ${entry.type === 'DEBIT' ? 'text-rose-400' : 'text-clinical-muted'}`}>
                  {entry.type === 'DEBIT' ? `$${Number(entry.amount).toFixed(2)}` : '-'}
                </TD>
                <TD className={`text-right font-finance ${entry.type === 'CREDIT' ? 'text-mercury-green' : 'text-clinical-muted'}`}>
                  {entry.type === 'CREDIT' ? `$${Number(entry.amount).toFixed(2)}` : '-'}
                </TD>
              </TR>
            ))}
          </TBody>
        </MercuryTable>
      </div>
    </Card>
  );
}

function ChargeEntryForm({ tenant, isPending, startTransition }: any) {
  const [electric, setElectric] = useState('');
  const [water, setWater] = useState('');
  const [waiver, setWaiver] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('leaseId', tenant.leaseId);
        formData.append('unitId', tenant.unitId);
        formData.append('electric', electric);
        formData.append('water', water);
        formData.append('waiver', waiver);
        
        const res = await generateUtilityAccrualAction(formData);
        if (res.success) {
          toast.success("Billing generation initiated.");
        } else {
          toast.error("Billing generation failed.");
        }
      } catch (err: any) {
        toast.error("Runtime exception.");
      }
    });
  };

  return (
    <Card variant="muted" className="p-0 border-white/10">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-clinical">Utility & Billing Orchestrator</h2>
        <p className="text-[11px] text-clinical-muted mt-1 uppercase font-bold tracking-widest">Enter meter readings to calculate delta</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] uppercase tracking-widest"><Zap className="w-3 h-3 text-amber-500" /> Electric (Current)</Label>
              <Input type="number" placeholder="e.g. 14205" value={electric} onChange={(e) => setElectric(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] uppercase tracking-widest"><Droplets className="w-3 h-3 text-blue-500" /> Water (Current)</Label>
              <Input type="number" placeholder="e.g. 543" value={water} onChange={(e) => setWater(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[11px] uppercase tracking-widest"><MinusCircle className="w-3 h-3 text-rose-500" /> Waiver Option</Label>
            <Input type="number" placeholder="$0.00" value={waiver} onChange={(e) => setWaiver(e.target.value)} />
            <p className="text-[9px] text-clinical-muted mt-1 font-bold tracking-widest uppercase">Generates a negative adjustment against base rent.</p>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-4" disabled={isPending}>
            {isPending ? 'Processing Matrix...' : 'Preview & Bill Ledger'}
            {!isPending && <FileText className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}

function PaymentForm({ tenant, isPending, startTransition }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    startTransition(async () => {
      try {
        const payload = {
          tenantId: tenant.id,
          amountPaid: Number(formData.get('amount')),
          transactionDate: formData.get('date') as string,
          paymentMode: formData.get('mode') as any, // bypassing enum issue
          referenceText: formData.get('reference') as string,
        };
        
        const res = await processPayment(payload);
        if (res.success) {
          toast.success("Payment Received.");
        } else {
          toast.error("Payment Failure.");
        }
      } catch (err: any) {
        toast.error("System Exception.");
      }
    });
  };

  return (
    <Card variant="muted" className="p-0 border-white/10">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-clinical">Receive Payment</h2>
        <p className="text-[11px] text-clinical-muted mt-1 uppercase font-bold tracking-widest">Log a tenant payment to offset Accounts Receivable.</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Amount ($)</Label>
              <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Date</Label>
              <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Mode</Label>
              <Select name="mode" required>
                <option value="BANK">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="MPESA">M-Pesa / Mobile</option>
                <option value="CHEQUE">Cheque</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Reference</Label>
              <Input name="reference" placeholder="TRX-..." required />
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-4" disabled={isPending}>
            {isPending ? 'Securing Tranche...' : 'Log & Reconcile Payment'}
          </Button>
        </form>
      </div>
    </Card>
  );
}
