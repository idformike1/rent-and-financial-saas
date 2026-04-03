'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { logExpense } from '@/actions/expense.actions'
import { Loader2, Landmark, CheckCircle, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from '@/lib/toast'

const treasurySchema = z.object({
  date: z.string().min(1, "Date is mandatory for treasury audit."),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive numerical figure.",
  }),
  payee: z.string().min(2, "Identification of payee/payer is mandatory for data governance."),
  description: z.string().min(3, "Substantive narrative required for fiscal reasoning."),
  scope: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  propertyId: z.string().optional(),
  parentCategoryId: z.string().min(1, "Core account category must be defined."),
  subCategoryId: z.string().optional(),
  paymentMode: z.enum(['CASH', 'BANK']),
});

type TreasuryFormData = z.infer<typeof treasurySchema>;

const DEFAULT_VALUES = {
  date: new Date().toISOString().split('T')[0],
  type: 'EXPENSE' as const,
  paymentMode: 'BANK' as const,
  amount: '',
  payee: '',
  description: '',
  parentCategoryId: '',
  subCategoryId: '',
  propertyId: '',
};

export default function ExpenseFormClient({ properties, allCategories, allLedgers }: { properties: any[], allCategories: any[], allLedgers: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastEntry, setLastEntry] = useState<{ payee: string; amount: string; type: string } | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<TreasuryFormData>({
    resolver: zodResolver(treasurySchema),
    defaultValues: { ...DEFAULT_VALUES, scope: allLedgers[0]?.id || '' },
  });

  const selectedScope = watch('scope');
  const selectedType = watch('type');
  const selectedParentId = watch('parentCategoryId');

  // TRIGGER: Filter categories by the dynamic Ledger (Scope) AND the stream type (INCOME/EXPENSE)
  const availableParents = allCategories.filter((c: any) => 
    c.ledgerId === selectedScope && 
    c.type === selectedType && 
    !c.parentId
  );
  
  const availableSubs = allCategories.filter((c: any) => c.parentId === selectedParentId);

  useEffect(() => {
    setValue('parentCategoryId', '');
    setValue('subCategoryId', '');
  }, [selectedScope, selectedType, setValue]);

  async function onSubmit(data: TreasuryFormData) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const result = await logExpense(formData); // Note: still calling logExpense but it will handle type
      if (result.success) {
        setLastEntry({ payee: data.payee, amount: data.amount, type: data.type });
        setSessionCount(prev => prev + 1);
        toast.success(`✓ ${data.type} Labeled: ${data.payee} — $${parseFloat(data.amount).toFixed(2)}`);
        reset({
          ...DEFAULT_VALUES,
          date: data.date,
          scope: data.scope,
          type: data.type,
          paymentMode: data.paymentMode,
          propertyId: data.propertyId,
        });
      } else {
        toast.error(result.error || "Operation failed.");
      }
    } catch (e: any) {
      toast.error(e.message || "Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass = "w-full bg-white border-4 border-slate-900 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-indigo-600 focus:shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] transition-all text-sm uppercase placeholder-slate-300";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block";

  return (
    <div className="space-y-6">
      {sessionCount > 0 && lastEntry && (
        <div className={`border-4 rounded-2xl px-6 py-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] ${
          lastEntry.type === 'INCOME' ? 'bg-green-50 border-green-600' : 'bg-red-50 border-red-600'
        }`}>
          <div className="flex items-center space-x-4">
            {lastEntry.type === 'INCOME' ? <ArrowUpCircle className="text-green-600" /> : <ArrowDownCircle className="text-red-600" />}
            <div>
              <p className="font-black uppercase tracking-tight text-sm">
                Treasury {lastEntry.type === 'INCOME' ? 'Inflow' : 'Outflow'} #{sessionCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                {lastEntry.payee} — ${parseFloat(lastEntry.amount).toFixed(2)} synchronized.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] rounded-3xl p-10 grid grid-cols-1 md:grid-cols-2 gap-8 ring-8 ring-slate-50 ring-inset">
          
          {/* FLOW TYPE SELECTOR */}
          <div className="md:col-span-2 grid grid-cols-2 gap-4">
             <button 
               type="button" 
               onClick={() => setValue('type', 'EXPENSE')}
               className={`py-4 rounded-xl border-4 font-black uppercase tracking-widest text-xs transition-all ${
                 selectedType === 'EXPENSE' ? 'bg-slate-900 text-white border-slate-900 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
               }`}
             >
                Outflow / Expense
             </button>
             <button 
               type="button" 
               onClick={() => setValue('type', 'INCOME')}
               className={`py-4 rounded-xl border-4 font-black uppercase tracking-widest text-xs transition-all ${
                 selectedType === 'INCOME' ? 'bg-green-600 text-white border-green-600 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
               }`}
             >
                Inflow / Revenue
             </button>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Materialization Date</label>
            <input type="date" {...register('date')} className={inputClass} />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Liquid Volume (Amount)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
              <input type="text" {...register('amount')} className={`${inputClass} pl-8`} placeholder="00.00" />
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Ledger Scope</label>
            <select {...register('scope')} className={inputClass}>
               {allLedgers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Asset Context (Property/Unit)</label>
            <select {...register('propertyId')} className={inputClass}>
              <option value="">GENERAL CORE</option>
              {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{selectedType === 'INCOME' ? 'Revenue Stream' : 'Expenditure Account'} (Parent)</label>
            <select {...register('parentCategoryId')} className={inputClass}>
              <option value="">SELECT SOURCE/ACCOUNT</option>
              {availableParents.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Granular Allocation (Sub-Node)</label>
            <select {...register('subCategoryId')} className={inputClass} disabled={!selectedParentId}>
              <option value="">NO SUB-ALLOCATION</option>
              {availableSubs.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClass}>{selectedType === 'INCOME' ? 'Payer Identity' : 'Payee Identity'} (Counterparty)</label>
            <input {...register('payee')} className={inputClass} placeholder="Entity Name" />
          </div>

          <div className="space-y-1">
            <label className={labelClass}>Requisition Mode</label>
            <select {...register('paymentMode')} className={inputClass}>
              <option value="BANK">DIGITAL CLEARANCE</option>
              <option value="CASH">LIQUID ASSET (CASH)</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1 pt-4">
            <label className={labelClass}>Substantive Narrative (Description)</label>
            <textarea rows={3} {...register('description')} className={`${inputClass} normal-case py-4`} placeholder="..." />
          </div>

          <div className="md:col-span-2 pt-8 flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 text-white font-black py-6 rounded-2xl transition-all flex items-center justify-center uppercase tracking-[0.4em] text-sm italic group ${
                selectedType === 'INCOME' ? 'bg-green-600 shadow-[0px_10px_0px_0px_rgba(15,23,42,1)]' : 'bg-slate-900 shadow-[0px_10px_0px_0px_rgba(79,70,229,1)]'
              } hover:shadow-none hover:translate-y-[4px]`}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Landmark className="w-5 h-5 mr-3" />}
              {isSubmitting ? "Processing Ledger..." : `Authorize Treasury ${selectedType === 'INCOME' ? 'Inflow' : 'Outflow'}`}
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}
