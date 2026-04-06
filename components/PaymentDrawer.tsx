'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { processPayment } from '@/actions/finance.actions'
import { ChargeDTO, TenantDTO } from '@/types'
import { X, CreditCard, Banknote } from 'lucide-react'
import { toast } from '@/lib/toast'
import { signOut } from 'next-auth/react'
import { Button, Input, Select, Badge } from '@/components/ui-finova'
import { cn } from '@/lib/utils'

interface PaymentDrawerProps {
  tenant: TenantDTO;
  activeCharges: ChargeDTO[]; 
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

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset, watch } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { 
      amountPaid: 0,
      paymentMode: 'CASH',
      referenceText: '',
      transactionDate: new Date().toISOString().split('T')[0]
    }
  })

  const amountPaidRaw = useWatch({ control, name: 'amountPaid' })
  const amountPaid = isNaN(amountPaidRaw) ? 0 : Number(amountPaidRaw)

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
          onSuccess();
        } else {
          if (response.errorCode === "ORPHANED_SESSION") {
            toast.error("SECURITY ALERT: Session Desynchronized.");
            setTimeout(() => signOut({ callbackUrl: '/login' }), 2000);
          } else {
            toast.error(response.message || "Operation failed.");
          }
        }
      } catch (error: any) {
        toast.error("Network synchronization failure.");
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* ── STEP 10: SOLID BACKDROP ─────────────────────────────────────────── */}
      <div className="fixed inset-0 bg-[#0B0D10]/90 z-40" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#14161A] border-l border-[#23252A] shadow-none z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#23252A] flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Liquidate Liabilities</h2>
            <p className="text-[11px] text-[#8A919E] uppercase tracking-widest mt-1">Enterprise Ledger Entry</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#8A919E] hover:text-white transition-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          {/* Target Identity Context */}
          <div className="bg-[#0B0D10] border border-[#23252A] rounded-[6px] p-4 flex flex-col">
            <label className="text-[10px] font-medium text-[#8A919E] uppercase tracking-[0.2em] mb-2">Posting To</label>
            <p className="text-xl font-bold text-white tracking-tight italic">{tenant.name}</p>
          </div>

          <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Amount Entry (Large Financial Input) */}
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#8A919E] uppercase tracking-wider block">Recognition Amount ($)</label>
              <div className="relative group">
                <Input 
                  type="number" 
                  step="0.01"
                  {...register('amountPaid', { valueAsNumber: true })} 
                  className="pl-4 pr-4 py-6 text-3xl font-finance italic tracking-tight h-16 border-[#23252A] bg-[#0B0D10]" 
                  placeholder="0.00"
                />
              </div>
              {errors.amountPaid && <p className="text-rose-500 text-[10px] uppercase font-bold">{errors.amountPaid.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[#8A919E] uppercase tracking-wider block">Fiscal Mode</label>
                <div className="relative">
                  <Select {...register('paymentMode')} className="pl-9 h-11">
                    <option value="CASH">CASH</option>
                    <option value="BANK">WIRE/EFT</option>
                  </Select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A919E]">
                    {watch('paymentMode') === 'CASH' ? <Banknote size={14} /> : <CreditCard size={14} />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[#8A919E] uppercase tracking-wider block">Value Date</label>
                <Input 
                  type="date"
                  {...register('transactionDate')}
                  className="h-11 border-[#23252A] bg-[#0B0D10]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-[#8A919E] uppercase tracking-wider block">Audit Reference</label>
              <textarea 
                {...register('referenceText')}
                rows={2}
                placeholder="Reference for audit trail..."
                className="w-full bg-[#0B0D10] border border-[#23252A] rounded-[6px] p-3 text-sm text-white focus:outline-none focus:border-white transition-none resize-none placeholder-[#8A919E]/50"
              />
              {errors.referenceText && <p className="text-rose-500 text-[10px] uppercase font-bold">{errors.referenceText.message}</p>}
            </div>

            {/* Waterfall Preview Area */}
            <div className="pt-6 border-t border-[#23252A]">
              <h4 className="text-[11px] font-medium text-[#8A919E] uppercase tracking-widest mb-4">Allocation Preview (Waterfall)</h4>
              <div className="space-y-0.5">
                {previewData.length === 0 ? (
                  <div className="p-8 border border-dashed border-[#23252A] rounded-[6px] text-center">
                    <p className="text-[10px] font-medium text-[#8A919E] uppercase tracking-widest leading-relaxed">No outstanding liabilities available for liquidation.</p>
                  </div>
                ) : (
                  previewData.map((charge) => (
                    <div key={charge.id} className="flex justify-between items-center py-3 border-b border-[#23252A]/50 px-1">
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase tracking-wider">{charge.type}</p>
                        <p className="text-[10px] text-[#8A919E] uppercase">Due: {new Date(charge.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-finance tracking-tight italic",
                          charge.applied > 0 ? 'text-emerald-400' : 'text-[#8A919E]/30'
                        )}>
                          {charge.applied > 0 ? `+ $${charge.applied.toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {overpayment > 0 && (
                  <div className="flex justify-between items-center py-4 bg-emerald-500/5 px-3 rounded-[4px] mt-2 border border-emerald-500/10">
                    <div>
                      <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Automatic Credit</p>
                      <p className="text-[9px] text-emerald-400/60 uppercase">Unapplied surplus materialized</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-finance text-emerald-400 italic tracking-tight">+ ${overpayment.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-[#23252A] bg-[#14161A]">
          <Button 
            variant="primary"
            type="submit" 
            form="payment-form"
            isLoading={isPending || isSubmitting}
            className="w-full h-12 uppercase tracking-[0.2em] font-bold"
          >
            Liquidate Liability
          </Button>
        </div>
      </div>
    </>
  )
}
