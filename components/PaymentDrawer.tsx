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
      {/* ── BACKDROP ─────────────────────────────────────────── */}
      <div className="fixed inset-0 bg-background/80 z-40" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[13px] font-bold text-foreground uppercase tracking-widest">Liquidate Liabilities</h2>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Enterprise Ledger Entry</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          {/* Target Identity Context */}
          <div className="bg-muted/50 border border-border rounded-[8px] p-4 flex flex-col">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Posting To</label>
            <p className="text-xl font-bold text-foreground tracking-tight">{tenant.name}</p>
          </div>

          <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Amount Entry (Large Financial Input) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">Recognition Amount ($)</label>
              <div className="relative group">
                <Input 
                  type="number" 
                  step="0.01"
                  {...register('amountPaid', { valueAsNumber: true })} 
                  className="pl-4 pr-4 py-6 text-3xl font-finance tracking-tight h-16 border-border bg-muted/30" 
                  placeholder="0.00"
                />
              </div>
              {errors.amountPaid && <p className="text-rose-500 text-[10px] uppercase font-bold">{errors.amountPaid.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">Fiscal Mode</label>
                <div className="relative">
                  <Select {...register('paymentMode')} className="pl-9 h-11">
                    <option value="CASH">CASH</option>
                    <option value="BANK">WIRE/EFT</option>
                  </Select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {watch('paymentMode') === 'CASH' ? <Banknote size={14} /> : <CreditCard size={14} />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">Value Date</label>
                <Input 
                  type="date"
                  {...register('transactionDate')}
                  className="h-11 border-border bg-muted/30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest block">Audit Reference</label>
              <textarea 
                {...register('referenceText')}
                rows={2}
                placeholder="Reference for audit trail..."
                className="w-full bg-muted/30 border border-border rounded-[8px] p-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-none resize-none placeholder:text-muted-foreground/50 font-bold"
              />
              {errors.referenceText && <p className="text-rose-500 text-[10px] uppercase font-bold">{errors.referenceText.message}</p>}
            </div>

            {/* Waterfall Preview Area */}
            <div className="pt-6 border-t border-border">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Allocation Preview (Waterfall)</h4>
              <div className="space-y-0.5">
                {previewData.length === 0 ? (
                  <div className="p-8 border border-dashed border-border rounded-[8px] text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">No outstanding liabilities available for liquidation.</p>
                  </div>
                ) : (
                  previewData.map((charge) => (
                    <div key={charge.id} className="flex justify-between items-center py-3 border-b border-border/50 px-1">
                      <div>
                        <p className="text-[11px] font-bold text-foreground uppercase tracking-widest">{charge.type}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Due: {new Date(charge.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-finance tracking-tight",
                          charge.applied > 0 ? 'text-emerald-500 dark:text-emerald-400' : 'text-muted-foreground/30'
                        )}>
                          {charge.applied > 0 ? `+ $${charge.applied.toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {overpayment > 0 && (
                  <div className="flex justify-between items-center py-4 bg-emerald-500/5 px-3 rounded-[6px] mt-2 border border-emerald-500/10">
                    <div>
                      <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Automatic Credit</p>
                      <p className="text-[9px] text-emerald-600/60 dark:text-emerald-400/60 uppercase">Unapplied surplus materialized</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-finance text-emerald-600 dark:text-emerald-400 tracking-tight">+ ${overpayment.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Action Bar */}
        <div className="p-6 border-t border-border bg-card">
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
