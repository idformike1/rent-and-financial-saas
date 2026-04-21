'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { processPayment } from '@/actions/finance.actions'
import { ChargeDTO, TenantDTO } from '@/types'
import { X, CreditCard, Banknote } from 'lucide-react'
import { toast } from '@/lib/toast'
import { signOut, useSession } from 'next-auth/react'
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
  const { data: session } = useSession();
  const isViewer = session?.user?.role === 'VIEWER';
  const [isPending, startTransition] = useTransition();
  
  // Stable Idempotency Key generated once per drawer session
  const idempotencyKey = useMemo(() => crypto.randomUUID(), [isOpen, tenant.id]);

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
    if (isViewer) {
      toast.error("Operation Denied: VIEWER role restricted.");
      return;
    }
    startTransition(async () => {
      try {
        const response = await processPayment({
          tenantId: tenant.id,
          amountPaid: data.amountPaid,
          transactionDate: data.transactionDate,
          paymentMode: data.paymentMode,
          referenceText: data.referenceText,
          idempotencyKey
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
        console.error('[PAYMENT_PROCESS_CRASH_GUARD]', error);
        toast.error("Network synchronization failure.");
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* ── BACKDROP ─────────────────────────────────────────── */}
      <div className="fixed inset-0  z-40" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[13px] font-bold text-foreground uppercase">Liquidate Liabilities</h2>
            <p className="text-[11px] font-bold text-clinical-muted uppercase mt-1">Enterprise Ledger Entry</p>
          </div>
          <Button type="button" variant="ghost" disabled={false} onClick={onClose} className="p-1.5 h-8 w-8 text-clinical-muted hover:text-foreground transition-none bg-transparent border-none">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
          
          {/* Target Identity Context */}
          <div className="bg-muted/50 border border-border rounded-[var(--radius-sm)] p-4 flex flex-col">
            <label className="text-[10px] font-bold text-clinical-muted uppercase  mb-2">Posting To</label>
            <p className="text-xl font-bold text-foreground tracking-clinical">{tenant.name}</p>
          </div>

          <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Amount Entry (Large Financial Input) */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-clinical-muted uppercase block">Recognition Amount ($)</label>
              <div className="relative group">
                <Input 
                  type="number" 
                  step="0.01"
                  disabled={isViewer}
                  {...register('amountPaid', { valueAsNumber: true })} 
                  className="pl-4 pr-4 py-6 text-display font-weight-display font-finance tracking-clinical h-16 border-border bg-muted/30 disabled:opacity-30" 
                  placeholder="0.00"
                />
              </div>
              {errors.amountPaid && <p className="text-destructive text-[10px] uppercase font-bold">{errors.amountPaid.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-clinical-muted uppercase block">Fiscal Mode</label>
                <div className="relative">
                  <Select {...register('paymentMode')} disabled={isViewer} className="pl-9 h-11 disabled:opacity-30">
                    <option value="CASH">CASH</option>
                    <option value="BANK">WIRE/EFT</option>
                  </Select>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-clinical-muted">
                    {watch('paymentMode') === 'CASH' ? <Banknote size={14} /> : <CreditCard size={14} />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-clinical-muted uppercase block">Value Date</label>
                <Input 
                  type="date"
                  disabled={isViewer}
                  {...register('transactionDate')}
                  className="h-11 border-border bg-muted/30 disabled:opacity-30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-clinical-muted uppercase block">Audit Reference</label>
              <textarea 
                {...register('referenceText')}
                disabled={isViewer}
                rows={2}
                placeholder="Reference for audit trail..."
                className="w-full bg-muted/30 border border-border rounded-[var(--radius-sm)] p-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-none resize-none placeholder:text-clinical-muted/50 font-bold disabled:opacity-30"
              />
              {errors.referenceText && <p className="text-destructive text-[10px] uppercase font-bold">{errors.referenceText.message}</p>}
            </div>

            {/* Waterfall Preview Area */}
            <div className="pt-6 border-t border-border">
              <h4 className="text-[11px] font-bold text-clinical-muted uppercase mb-4">Allocation Preview (Waterfall)</h4>
              <div className="space-y-0.5">
                {previewData.length === 0 ? (
                  <div className="p-6 border border-dashed border-border rounded-[var(--radius-sm)] text-center">
                    <p className="text-[10px] font-bold text-clinical-muted uppercase leading-relaxed">No outstanding liabilities available for liquidation.</p>
                  </div>
                ) : (
                  previewData.map((charge) => (
                    <div key={charge.id} className="flex justify-between items-center py-3 border-b border-border/50 px-1">
                      <div>
                        <p className="text-[11px] font-bold text-foreground uppercase">{charge.type}</p>
                        <p className="text-[10px] text-clinical-muted uppercase tracking-wide">Due: {new Date(charge.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-finance tracking-clinical",
                          charge.applied > 0 ? 'text-mercury-green' : 'text-clinical-muted/30'
                        )}>
                          {charge.applied > 0 ? `+ $${charge.applied.toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {overpayment > 0 && (
                  <div className="flex justify-between items-center py-4 bg-mercury-green/5 px-3 rounded-[var(--radius-sm)] mt-2 border border-mercury-green/10">
                    <div>
                      <p className="text-[11px] font-bold text-mercury-green uppercase">Automatic Credit</p>
                      <p className="text-[9px] text-mercury-green/60 dark:text-mercury-green/60 uppercase">Unapplied surplus materialized</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-finance text-mercury-green tracking-clinical">+ ${overpayment.toFixed(2)}</p>
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
            disabled={isPending || isSubmitting || isViewer}
            className="w-full h-12 uppercase font-bold disabled:opacity-50 disabled:grayscale"
          >
            {isViewer ? 'Read-Only Locked' : 'Liquidate Liability'}
          </Button>
          {isViewer && (
            <p className="text-[9px] text-destructive/40 font-bold uppercase tracking-widest text-center mt-2 italic">Security Block: Viewer Restricted</p>
          )}
        </div>
      </div>
    </>
  )
}
