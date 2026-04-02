'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { logExpense } from '@/actions/expense.actions'
import { useRouter } from 'next/navigation'
import { Loader2, Landmark, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from '@/lib/toast'

const expenseSchema = z.object({
  date: z.string().min(1, "Date is mandatory for treasury audit."),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive numerical figure.",
  }),
  payee: z.string().min(2, "Identification of payee is mandatory for data governance."),
  description: z.string().min(3, "Substantive narrative required for fiscal reasoning."),
  scope: z.enum(['PROPERTY', 'HOME', 'PERSONAL']),
  propertyId: z.string().optional(),
  parentCategoryId: z.string().min(1, "Core account category must be defined."),
  subCategoryId: z.string().optional(),
  paymentMode: z.enum(['CASH', 'BANK']),
}).refine((data) => {
  if (data.scope === 'PROPERTY' && !data.propertyId) return false;
  return true;
}, {
  message: "Property identification is mandatory for PROPERTY scope expenditures.",
  path: ['propertyId']
});

type ExpenseFormData = {
  date: string;
  amount: string;
  payee: string;
  description: string;
  scope: 'PROPERTY' | 'HOME' | 'PERSONAL';
  propertyId?: string;
  parentCategoryId: string;
  subCategoryId?: string;
  paymentMode: 'CASH' | 'BANK';
};

export default function ExpenseFormClient({ properties, allCategories }: { properties: any[], allCategories: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      scope: 'PROPERTY',
      paymentMode: 'BANK'
    }
  });

  const selectedScope = watch('scope');
  const selectedParentId = watch('parentCategoryId');

  const availableParents = allCategories.filter(c => c.scope === selectedScope && !c.parentId);
  const availableSubs = allCategories.filter(c => c.parentId === selectedParentId);

  async function onSubmit(data: ExpenseFormData) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      
      const result = await logExpense(formData);
      if (result.success) {
        toast.success("Expenditure materialization successful. Ledger entries synchronized.");
        reset();
        setTimeout(() => router.push('/expenses'), 1500);
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

      <div className="bg-white border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] rounded-3xl p-10 grid grid-cols-1 md:grid-cols-2 gap-8 ring-8 ring-slate-50 ring-inset">
        
        <div className="space-y-1">
          <label className={labelClass}>Materialization Date</label>
          <input type="date" {...register('date')} className={inputClass} />
          {errors.date && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.date.message}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Liquid Expenditure (Amount)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
            <input type="text" {...register('amount')} className={`${inputClass} pl-8`} placeholder="00.00" />
          </div>
          {errors.amount && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Target Expenditure Scope</label>
          <select {...register('scope')} className={inputClass}>
            <option value="PROPERTY">PROPERTY MANAGEMENT</option>
            <option value="HOME">HOME / RESIDENCE</option>
            <option value="PERSONAL">PERSONAL / INDIVIDUAL</option>
          </select>
          {errors.scope && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.scope.message}</p>}
        </div>

        {selectedScope === 'PROPERTY' && (
          <div className="space-y-1">
            <label className={labelClass}>Asset Identification (Building)</label>
            <select {...register('propertyId')} className={inputClass}>
              <option value="">SELECT PROPERTY</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.propertyId && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.propertyId.message}</p>}
          </div>
        )}

        <div className="space-y-1">
          <label className={labelClass}>Chart of Account Group (Parent)</label>
          <select {...register('parentCategoryId')} className={inputClass} onChange={(e) => {
            setValue('parentCategoryId', e.target.value);
            setValue('subCategoryId', ''); // Clear sub when parent changes
          }}>
            <option value="">SELECT PARENT ACCOUNT</option>
            {availableParents.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.parentCategoryId && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.parentCategoryId.message}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Specific Allocation (Sub-Category)</label>
          <select {...register('subCategoryId')} className={inputClass} disabled={!selectedParentId}>
            <option value="">SELECT SUB-CATEGORY</option>
            {availableSubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.subCategoryId && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.subCategoryId.message}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Payee Identity (Recipient)</label>
          <input {...register('payee')} className={inputClass} placeholder="e.g. City Water Corp" />
          {errors.payee && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.payee.message}</p>}
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Engagement Strategy (Mode)</label>
          <select {...register('paymentMode')} className={inputClass}>
            <option value="BANK">BANKING REQUISITION</option>
            <option value="CASH">PETTY CASH DISBURSEMENT</option>
          </select>
        </div>

        <div className="md:col-span-2 space-y-1 pt-4">
          <label className={labelClass}>Fiscal Substantive Narrative (Description)</label>
          <textarea 
            rows={3} 
            {...register('description')} 
            className={`${inputClass} normal-case py-4`} 
            placeholder="Substantive reasoning for this outflow..." 
          />
          {errors.description && <p className="text-red-500 text-[10px] uppercase font-black tracking-widest">{errors.description.message}</p>}
        </div>

        <div className="md:col-span-2 pt-8">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-[0px_10px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-y-[4px] transition-all flex items-center justify-center uppercase tracking-[0.4em] text-sm italic group"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-3 animate-spin text-indigo-400" />
            ) : (
              <Landmark className="w-5 h-5 mr-3 text-indigo-400 group-hover:rotate-12 transition-transform" />
            )}
            {isSubmitting ? "Anchoring To Ledger..." : "Activate Treasury Outflow"}
          </button>
        </div>

      </div>

    </form>
  )
}
