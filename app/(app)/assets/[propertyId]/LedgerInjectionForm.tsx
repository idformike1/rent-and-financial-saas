'use client';

import { useActionState, useEffect } from 'react';
import { logExpense, processPayment } from '@/actions/finance.actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

const inputClass = "w-full bg-transparent border-b border-[#1F2937] rounded-none py-2 px-0 text-[13px] text-[#E5E7EB] outline-none focus:border-[#5D71F9] font-mono transition-colors placeholder:text-[#1F2937]";

const submitLedgerArtifact = async (prevState: any, formData: FormData) => {
  const type = formData.get('type') as string;
  const amount = Number(formData.get('amount'));
  const transactionDate = formData.get('date') as string;
  const paymentMode = formData.get('mode') as 'CASH' | 'BANK';
  
  const propertyId = formData.get('propertyId') as string;
  const tenantId = formData.get('tenantId') as string;
  // unitId is not required by processPayment, but we might pass it as reference text

  try {
    if (type === 'REVENUE') {
      if (!tenantId) throw new Error("A Revenue log requires an active occupant registry.");
      const res = await processPayment({
        tenantId,
        amountPaid: amount,
        transactionDate: new Date(transactionDate),
        paymentMode,
        referenceText: `DIRECT_INJECTION: ${propertyId}`
      });
      return { success: res.success, message: res.message, ts: Date.now() };
    } else {
      // EXPENSE -> call logExpense (which takes FormData generally, so we can wrap a new FormData)
      const expenseData = new FormData();
      expenseData.append('amount', String(amount));
      expenseData.append('payee', tenantId ? 'ACTIVE_OCCUPANT' : 'SYSTEM_VENDOR');
      expenseData.append('description', 'DIRECT_INJECTION_EXPENSE');
      expenseData.append('scope', 'PROPERTY'); // Generic
      expenseData.append('propertyId', propertyId);
      expenseData.append('type', 'EXPENSE');
      expenseData.append('paymentMode', paymentMode);
      expenseData.append('date', transactionDate);

      const res = await logExpense(expenseData);
      return { success: res?.success !== false, message: "Artifact logged", ts: Date.now() };
    }
  } catch (e: any) {
    return { success: false, message: e.message || 'Injection failure.', ts: Date.now() };
  }
};

export default function LedgerInjectionForm({ activeUnit }: { activeUnit: any }) {
  const [state, formAction, isPending] = useActionState(submitLedgerArtifact, null);

  const activeLease = activeUnit?.leases?.[0];
  const tenantId = activeLease?.tenantId || '';
  const propertyId = activeUnit?.propertyId || '';

  useEffect(() => {
    if (state?.ts) {
      if (state.success) {
        toast.success("Fiscal artifact locally synchronized.");
        // We do not have direct access to reset the form easily without ref, but typical useActionState forces a re-render
      } else {
        toast.error(state.message);
      }
    }
  }, [state?.ts]);

  return (
    <form action={formAction} className="w-full flex items-center gap-4 border-b border-[#1F2937] pb-6 mb-6">
      <input type="hidden" name="propertyId" value={propertyId} />
      <input type="hidden" name="tenantId" value={tenantId} />

      <div className="flex-1">
        <input 
          name="date" 
          type="date" 
          required 
          defaultValue={new Date().toISOString().split('T')[0]} 
          disabled={isPending}
          className={cn(inputClass, "uppercase [color-scheme:dark]")} 
        />
      </div>

      <div className="flex-1">
        <input 
          name="amount" 
          type="number" 
          step="0.01"
          required 
          placeholder="AMT ($)"
          disabled={isPending}
          className={cn(inputClass, "tabular-nums")} 
        />
      </div>

      <div className="flex-1">
        <select name="type" disabled={isPending} className={cn(inputClass, "appearance-none cursor-pointer")}>
          <option value="REVENUE">REVENUE</option>
          <option value="EXPENSE">EXPENSE</option>
        </select>
      </div>

      <div className="flex-1">
        <select name="mode" disabled={isPending} className={cn(inputClass, "appearance-none cursor-pointer")}>
          <option value="BANK">BANK</option>
          <option value="CASH">CASH</option>
        </select>
      </div>

      <button 
        type="submit" 
        disabled={isPending}
        className="px-6 h-[33px] bg-[#E5E7EB] text-[#12121A] text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 shrink-0"
      >
        {isPending ? '[ SYNCING... ]' : '[ INJECT ROW ]'}
      </button>
    </form>
  );
}
