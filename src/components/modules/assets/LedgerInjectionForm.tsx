'use client';

import React, { useActionState, useEffect, useState } from "react";
import { logExpense, processPayment } from '@/actions/finance.actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { Plus } from 'lucide-react';

const inputClass = "w-full bg-gray-800/50 border border-gray-700 rounded-[var(--radius-sm)] h-12 px-4 text-[14px] text-[#E5E7EB] outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent font-mono transition-all placeholder:text-gray-500";

const submitLedgerArtifact = async (prevState: any, formData: FormData) => {
  const type = formData.get('type') as string;
  const amount = Number(formData.get('amount'));
  const transactionDate = formData.get('date') as string;
  const paymentMode = formData.get('mode') as 'CASH' | 'BANK';
  const idempotencyKey = formData.get('idempotencyKey') as string;
  
  const propertyId = formData.get('propertyId') as string;
  const tenantId = formData.get('tenantId') as string;

  try {
    const res: any = type === 'REVENUE' && tenantId 
      ? await processPayment({
          tenantId,
          unitId: formData.get('unitId') as string,
          amountPaid: amount,
          transactionDate,
          paymentMode,
          referenceText: `DIRECT_INJECTION: ${propertyId}`,
          idempotencyKey
        })
      : await (async () => {
          const expenseData = new FormData();
          expenseData.append('amount', String(amount));
          expenseData.append('payee', tenantId ? 'ACTIVE_OCCUPANT' : 'VACANT_NODE_INJECTION');
          expenseData.append('description', type === 'REVENUE' ? 'VACANT_REVENUE_ARTIFACT' : 'DIRECT_EXPENSE_ARTIFACT');
          expenseData.append('scope', 'PROPERTY');
          expenseData.append('propertyId', propertyId);
          expenseData.append('unitId', formData.get('unitId') as string);
          expenseData.append('type', type === 'REVENUE' ? 'INCOME' : 'EXPENSE');
          expenseData.append('paymentMode', paymentMode);
          expenseData.append('date', transactionDate);
          expenseData.append('idempotencyKey', idempotencyKey);
          return await logExpense(expenseData);
        })();

    // Robust success normalization for inconsistent action APIs
    const isSuccess = res.success === true || (res.data && !res.error && !res.message?.includes('failure'));
    const message = res.message || res.error || (isSuccess ? "Fiscal artifact synchronized." : "Injection failure.");
    
    return { success: isSuccess, message, ts: Date.now() };
  } catch (e: any) {
    return { success: false, message: e.message || 'Injection failure.', ts: Date.now() };
  }
};

export default function LedgerInjectionForm({ 
  activeUnit, 
  onOptimisticEntry,
  onSuccess 
}: { 
  activeUnit: any, 
  onOptimisticEntry?: (entry: any) => void,
  onSuccess?: () => void
}) {
  const [state, formAction, isPending] = useActionState(submitLedgerArtifact, null);
  const [idempotencyKey, setIdempotencyKey] = useState(crypto.randomUUID());

  const activeLease = activeUnit?.leases?.[0];
  const tenantId = activeLease?.tenantId || '';
  const propertyId = activeUnit?.propertyId || '';
  const isDecommissioned = activeUnit?.maintenanceStatus === 'DECOMMISSIONED' || activeUnit?.property?.status === 'DECOMMISSIONED';

  const handleAction = async (formData: FormData) => {
    if (onOptimisticEntry) {
      onOptimisticEntry({
        id: `opt-${Date.now()}`,
        transactionDate: formData.get('date') as string,
        description: formData.get('type') === 'REVENUE' ? 'Optimistic Payment' : 'Optimistic Expense',
        amount: formData.get('amount') as string,
        paymentMode: formData.get('mode') as string,
        status: 'ACTIVE',
        account: { category: formData.get('type') === 'REVENUE' ? 'INCOME' : 'EXPENSE' },
        isOptimistic: true
      });
    }
    return formAction(formData);
  };

  useEffect(() => {
    if (state?.ts) {
      if (state.success) {
        toast.success(state.message);
        setIdempotencyKey(crypto.randomUUID());
        if (onSuccess) onSuccess();
      } else {
        toast.error(state.message);
      }
    }
  }, [state?.ts]);

  return (
    <form action={handleAction} className="w-full grid grid-cols-2 gap-4 border-b border-[#1F2937] pb-8 mb-8">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="unitId" value={activeUnit.id} />
      <input type="hidden" name="tenantId" value={tenantId} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold ml-1">Entry Date</label>
        <input 
          name="date" 
          type="date" 
          required 
          defaultValue={new Date().toISOString().split('T')[0]} 
          disabled={isPending || isDecommissioned}
          className={cn(inputClass, "uppercase [color-scheme:dark]")} 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold ml-1">Amount ($)</label>
        <input 
          name="amount" 
          type="number" 
          step="0.01"
          required 
          placeholder="0.00"
          disabled={isPending || isDecommissioned}
          className={cn(inputClass, "tabular-nums")} 
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold ml-1">Classification</label>
        <select name="type" disabled={isPending || isDecommissioned} className={cn(inputClass, "appearance-none cursor-pointer")}>
          <option value="REVENUE">REVENUE</option>
          <option value="EXPENSE">EXPENSE</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold ml-1">Payment Mode</label>
        <select name="mode" disabled={isPending || isDecommissioned} className={cn(inputClass, "appearance-none cursor-pointer")}>
          <option value="BANK">BANK</option>
          <option value="CASH">CASH</option>
        </select>
      </div>

      {isDecommissioned && (
        <div className="col-span-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest text-center">
            GOVERNANCE HALT: Ledger access is frozen for decommissioned assets.
          </p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={isPending || isDecommissioned}
        className="col-span-2 h-12 bg-[#E5E7EB] text-[#12121A] rounded-[var(--radius-sm)] text-[12px] font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 uppercase mt-2"
      >
        <Plus size={16} />
        {isPending ? 'Synchronizing...' : 'Commit Ledger Entry'}
      </button>
    </form>
  );
}
