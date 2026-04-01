'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { logExpenseAction, getExpenseAccounts } from '@/actions/expense.actions'
import { DollarSign, Calendar, FileText, Landmark, Loader2, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const expenseSchema = z.object({
  amount: z.number().positive("Must be a positive amount"),
  date: z.string().refine((val) => !isNaN(Date.parse(val))),
  description: z.string().min(5, "Minimum 5 characters required"),
  expenseAccountId: z.string().min(1, "Please select an account")
})

type ExpenseForm = z.infer<typeof expenseSchema>

export default function ExpensesPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverMsg, setServerMsg] = useState({ success: false, text: '' });
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      expenseAccountId: ''
    }
  });

  useEffect(() => {
    getExpenseAccounts().then(setAccounts);
  }, []);

  const onSubmit = async (data: ExpenseForm) => {
    setIsSubmitting(true);
    setServerMsg({ success: false, text: '' });
    
    const result = await logExpenseAction(data);
    setIsSubmitting(false);
    
    if (result.success) {
      setServerMsg({ success: true, text: result.message || '' });
      reset();
      setTimeout(() => router.push('/expenses'), 2000);
    } else {
      setServerMsg({ success: false, text: result.message || '' });
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <Link href="/expenses" className="text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] mb-8 flex items-center group transition-colors">
        <ChevronLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Expense Dashboard
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tighter italic text-slate-900 uppercase">Operational Expense Registry</h1>
        <p className="text-slate-500 font-medium tracking-tight">Manual fiscal entry for structural costs & maintenance.</p>
      </div>

      <div className="bg-white border-2 border-slate-900 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] rounded-3xl overflow-hidden p-8 animate-in slide-in-from-bottom-4 duration-500">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Asset Withdrawal Account</label>
               <div className="bg-slate-100 border-2 border-slate-100 rounded-2xl p-4 flex items-center text-slate-500 font-bold opacity-70">
                 <Landmark className="w-4 h-4 mr-3" /> Chase Bank Checking (Primary)
               </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Transaction Date</label>
              <div className="relative group">
                 <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                 <input type="date" {...register('date')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 font-bold focus:border-slate-900 transition-all outline-none" />
              </div>
            </div>

            <div className="col-span-2 md:col-span-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Fiscal Amount ($)</label>
              <div className="relative group">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 font-bold">$</div>
                 <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-4 font-bold focus:border-slate-900 transition-all outline-none" placeholder="0.00" />
              </div>
              {errors.amount && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.amount.message}</p>}
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Categorization</label>
              <select {...register('expenseAccountId')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-slate-900 transition-all outline-none appearance-none cursor-pointer">
                 <option value="">-- Select Expense Account --</option>
                 {accounts.map(a => (
                   <option key={a.id} value={a.id}>{a.name}</option>
                 ))}
              </select>
              {errors.expenseAccountId && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.expenseAccountId.message}</p>}
            </div>

            <div className="col-span-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Transaction Narrative</label>
               <textarea {...register('description')} rows={3} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold focus:border-slate-900 transition-all outline-none resize-none" placeholder="Enter purpose of expenditure..." />
               {errors.description && <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2">{errors.description.message}</p>}
            </div>
          </div>

          {serverMsg.text && (
            <div className={`p-4 rounded-2xl text-sm font-bold flex items-center ${serverMsg.success ? 'bg-green-50 text-green-700 border-2 border-green-100' : 'bg-red-50 text-red-600 border-2 border-red-100'}`}>
              {serverMsg.success ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
              {serverMsg.text}
            </div>
          )}

          <button disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-[0.2em] text-sm flex items-center justify-center">
             {isSubmitting ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Materializing Entry...</> : 'Execute Expenditure Entry'}
          </button>
        </form>
      </div>

      <p className="text-center text-[10px] text-slate-300 font-bold tracking-[0.3em] uppercase mt-12">Fiscal Integrity Module v1 // Secure Double-Entry Registry</p>
    </div>
  )
}
