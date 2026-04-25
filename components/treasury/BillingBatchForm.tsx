'use client';

import { useState } from 'react';
import { toast } from '@/lib/toast';
import { runMonthlyBillingCycle } from '@/actions/finance.actions';

export default function BillingBatchForm() {
  const [isPending, setIsPending] = useState(false);

  async function handleBatchAction(formData: FormData) {
    setIsPending(true);
    try {
      const period = formData.get('period') as string;
      const date = formData.get('date') as string;

      const response = await runMonthlyBillingCycle({ 
        servicePeriod: period, 
        postingDate: date 
      });

      if (response.success) {
        toast.success(response.message || "Payroll Batch Complete");
      } else {
        toast.error(response.message || "Batch Execution Aborted");
      }
    } catch (error: any) {
      console.error('[BATCH_UI_FATAL]', error);
      toast.error(error.message || "Network Synchronization Failure");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={handleBatchAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold ml-1">Period</label>
          <input 
            name="period" 
            defaultValue="2026-05" 
            disabled={isPending}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs font-mono text-zinc-100 outline-none focus:border-emerald-500/50 disabled:opacity-50" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold ml-1">Posting Date</label>
          <input 
            name="date" 
            type="date" 
            defaultValue="2026-05-15" 
            disabled={isPending}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-xs font-mono text-zinc-100 outline-none focus:border-emerald-500/50 invert disabled:opacity-50" 
          />
        </div>
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full py-4 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Executing...' : 'Execute Billing Batch ✓'}
      </button>
    </form>
  );
}
