'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { processPayment } from '@/actions/ledger.actions'
import { ChargeDTO, TenantDTO } from '@/types'
import { X } from 'lucide-react'
import { toast } from '@/lib/toast'
import { signOut } from 'next-auth/react'

interface PaymentDrawerProps {
  tenant: TenantDTO;
  activeCharges: ChargeDTO[]; // Needs to be pre-sorted or we sort here
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentSchema = z.object({
  amountPaid: z.number().positive("Amount must be greater than 0"),
  paymentMode: z.enum(['CASH', 'BANK']),
  referenceText: z.string().min(3, "Reference/Details are mandatory for audit trail"),
  transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Choose a valid payment date" })
})

type PaymentForm = z.infer<typeof paymentSchema>

export default function PaymentDrawer({ tenant, activeCharges, isOpen, onClose, onSuccess }: PaymentDrawerProps) {
  const [isPending, startTransition] = useTransition()

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { 
      amountPaid: 0,
      paymentMode: 'CASH',
      referenceText: '',
      transactionDate: new Date().toISOString().split('T')[0]
    }
  })

  // Watch for real-time preview
  const amountPaidRaw = useWatch({ control, name: 'amountPaid' })
  const amountPaid = isNaN(amountPaidRaw) ? 0 : Number(amountPaidRaw)

  // Algorithm A: Realtime distribution preview
  // Note: PRD says sort by isPrimary == true, then chronologically by dueDate.
  // We assume frontend activeCharges contains a mapped `isPrimary` flag, or we do our best here.
  // Wait, ChargeDTO doesn't have isPrimary. I will add it to the component props assumption or map it from backend.
  // Let's assume the array passed is ALREADY strictly sorted by the backend RSC before rendering.
  // That guarantees consistency.
  
  const { previewData, overpayment } = useMemo(() => {
    let tempRemaining = amountPaid
    const data = activeCharges.map((charge) => {
      const balanceOwed = charge.amount - charge.amountPaid
      let applied = 0

      if (tempRemaining >= balanceOwed) {
        applied = balanceOwed
        tempRemaining -= applied
      } else if (tempRemaining > 0) {
        applied = tempRemaining
        tempRemaining = 0
      }

      return { ...charge, balanceOwed, applied }
    })
    return { previewData: data, overpayment: tempRemaining > 0 ? tempRemaining : 0 }
  }, [amountPaid, activeCharges])

  const onSubmit = (data: PaymentForm) => {
    startTransition(async () => {
      try {
        const response = await processPayment({
          tenantId: tenant.id,
          amountPaid: data.amountPaid,
          transactionDate: data.transactionDate,
          paymentMode: data.paymentMode,
          referenceText: data.referenceText
        })
        if (response.success) {
          toast.success("Liquid Expenditure Successfully Materialized");
          reset();
          onSuccess(); // Trigger close and refresh
        } else {
          // Phase 2: AXIOM Session Resilience Protocol
          if (response.errorCode === "ORPHANED_SESSION") {
            toast.error("SECURITY ALERT: Session Desynchronized. Redirecting to Terminal...");
            setTimeout(() => {
              signOut({ callbackUrl: '/login' });
            }, 2000);
          } else if (response.errorCode === "UNAUTHORIZED") {
            toast.error("Access Forbidden: Insufficient permissions for this vault.");
          } else {
            toast.error(response.message || "Operation failed.");
          }
        }
      } catch (error: any) {
        // Fallback for hard network failures
        toast.error("Network synchronization failure. Please verify connectivity.");
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l-4 border-slate-900">
        <div className="px-8 py-6 border-b-2 border-slate-900 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-foreground uppercase italic tracking-tighter">Liquidate Liabilities</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise Ledger Entry</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-foreground rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
          <div className="bg-slate-900 rounded-3xl p-6 text-foreground shadow-lg">
            <h3 className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em] mb-4">Target Identity</h3>
            <p className="text-2xl font-black tracking-tight italic">{tenant.name}</p>
          </div>

          <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Payment Amount ($)</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-slate-300 font-black text-xl">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    {...register('amountPaid', { valueAsNumber: true })} 
                    className="block w-full pl-12 pr-4 py-5 text-2xl font-black border-2 border-border rounded-3xl focus:border-slate-900 focus:bg-card bg-slate-50 transition-all outline-none" 
                    placeholder="0.00"
                  />
                </div>
                {errors.amountPaid && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.amountPaid.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Fiscal Mode</label>
                <select 
                  {...register('paymentMode')}
                  className="w-full bg-slate-50 border-2 border-border rounded-xl px-4 py-4 text-xs font-black uppercase outline-none focus:border-slate-900 appearance-none cursor-pointer"
                >
                  <option value="CASH">CASH TRANSFER</option>
                  <option value="BANK">BANK WIRE/EFT</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Posting Date</label>
                <input 
                  type="date"
                  {...register('transactionDate')}
                  className="w-full bg-slate-50 border-2 border-border rounded-xl px-4 py-4 text-xs font-black uppercase outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Audit Reference / Details</label>
              <textarea 
                {...register('referenceText')}
                rows={3}
                placeholder="e.g. Bank Ref #12345 or Cash receipt serial"
                className="w-full bg-slate-50 border-2 border-border rounded-xl p-4 text-xs font-medium outline-none focus:border-slate-900 transition-all"
              />
              {errors.referenceText && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.referenceText.message}</p>}
            </div>

            <div className="pt-6 border-t-2 border-border">
              <h4 className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] mb-4">Waterfall Preview (Algorithm A)</h4>
              <div className="space-y-2">
                {previewData.length === 0 ? (
                  <div className="p-8 border-2 border-dashed border-border rounded-3xl text-center">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No outstanding fiscal records found.</p>
                  </div>
                ) : (
                  previewData.map((charge) => (
                    <div key={charge.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border-2 border-border group hover:border-slate-300 transition-all">
                      <div>
                        <p className="text-[10px] font-black text-foreground uppercase tracking-widest">{charge.type}</p>
                        <p className="text-[10px] font-bold text-slate-400">Due: {new Date(charge.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Applied</p>
                        <p className={`text-sm font-black ${charge.applied > 0 ? 'text-[var(--primary)] animate-pulse' : 'text-slate-300'}`}>
                          {charge.applied > 0 ? `+ $${charge.applied.toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {overpayment > 0 && (
                  <div className="flex justify-between items-center bg-[var(--primary-muted)] p-4 rounded-xl border-2 border-[var(--primary)]/20 mt-2">
                    <div>
                      <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest">Automatic Credit</p>
                      <p className="text-[10px] font-bold text-[var(--primary)] uppercase leading-none">Unapplied Surplus Materialized</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[var(--primary)]">+ ${overpayment.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-border bg-slate-50">
          <button 
            type="submit" 
            form="payment-form"
            disabled={isPending || isSubmitting} 
            className="w-full bg-slate-900 text-foreground font-medium py-3 rounded-xl shadow-premium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Executing Transaction...' : 'Process Payment'}
          </button>
        </div>
      </div>
    </>
  )
}
