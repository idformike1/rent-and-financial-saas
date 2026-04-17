'use client';

import { useActionState, useEffect } from 'react';
import { logExpense, processPayment } from '@/actions/finance.actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { Plus } from 'lucide-react';

const inputClass = "w-full bg-gray-800/50 border border-gray-700 rounded-md h-10 px-3 text-[13px] text-[#E5E7EB] outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent font-mono transition-all placeholder:text-gray-500";

const submitLedgerArtifact = async (prevState: any, formData: FormData) => {
  const type = formData.get('type') as string;
  const amount = Number(formData.get('amount'));
  const transactionDate = formData.get('date') as string;
  const paymentMode = formData.get('mode') as 'CASH' | 'BANK';
  
  const propertyId = formData.get('propertyId') as string;
  const tenantId = formData.get('tenantId') as string;
  // unitId is not required by processPayment, but we might pass it as reference text

  try {
    if (type === 'REVENUE' && tenantId) {
      // TENANT-DIRECT FLOW: Maps to tenant credit waterfall
      const res = await processPayment({
        tenantId,
        amountPaid: amount,
        transactionDate,
        paymentMode,
        referenceText: `DIRECT_INJECTION: ${propertyId}`
      });
      return { success: res.success, message: res.message, ts: Date.now() };
    } else {
      // ANONYMOUS/OFF-LEASE FLOW: Routes through unified ingestion
      const expenseData = new FormData();
      expenseData.append('amount', String(amount));
      expenseData.append('payee', tenantId ? 'ACTIVE_OCCUPANT' : 'VACANT_NODE_INJECTION');
      expenseData.append('description', type === 'REVENUE' ? 'VACANT_REVENUE_ARTIFACT' : 'DIRECT_EXPENSE_ARTIFACT');
      expenseData.append('scope', 'PROPERTY');
      expenseData.append('propertyId', propertyId);
      expenseData.append('type', type === 'REVENUE' ? 'INCOME' : 'EXPENSE');
      expenseData.append('paymentMode', paymentMode);
      expenseData.append('date', transactionDate);

      const res = await logExpense(expenseData);
      return { success: res?.success !== false, message: "Fiscal artifact synchronized.", ts: Date.now() };
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
        className="px-6 h-10 bg-[#E5E7EB] text-[#12121A] rounded-[6px] text-[11px] font-bold tracking-widest hover:bg-white transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center gap-2 uppercase"
      >
        <Plus size={14} />
        {isPending ? 'Syncing...' : 'Inject Row'}
      </button>
    </form>
  );
}
