'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { processPayment } from '@/actions/finance.actions'
import { ChargeDTO, TenantDTO } from '@/types'
import { CreditCard, Banknote } from 'lucide-react'
import { toast } from '@/lib/toast'
import { signOut, useSession } from 'next-auth/react'
import { Button, Input, Select, Badge } from '@/src/components/finova/ui-finova'
import { cn } from '@/lib/utils'
import { SideSheet } from '@/src/components/system/SideSheet'

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
    let tempRemaining = amountPaid;
    const getPriority = (type: string) => {
      if (type === 'LATE_FEE') return 1;
      if (type === 'WATER_SUBMETER' || type === 'ELEC_SUBMETER') return 2;
      if (type === 'RENT') return 3;
      return 4;
    };
    const sortedCharges = [...activeCharges].sort((a, b) => {
      const p1 = getPriority(a.type);
      const p2 = getPriority(b.type);
      if (p1 !== p2) return p1 - p2;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    const data = sortedCharges.map((charge) => {
      const balanceOwed = Number(charge.amount) - Number(charge.amountPaid);
      let applied = 0;
      if (tempRemaining >= balanceOwed) {
        applied = balanceOwed;
        tempRemaining -= applied;
      } else if (tempRemaining > 0) {
        applied = tempRemaining;
        tempRemaining = 0;
      }
      return { ...charge, balanceOwed, applied };
    });
    return { previewData: data, overpayment: tempRemaining > 0 ? tempRemaining : 0 };
  }, [amountPaid, activeCharges]);

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

  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Liquidate Liabilities"
      size="md"
    >
      <div className="flex flex-col h-full">
        <p className="text-[11px] font-bold text-clinical-muted uppercase mb-8">Enterprise Ledger Entry</p>

        <div className="flex-1 space-y-8">
          {/* Target Identity Context */}
          <div className="bg-muted/50 border border-border rounded-[var(--radius-sm)] p-4 flex flex-col">
            <label className="text-[10px] font-bold text-clinical-muted uppercase mb-2">Posting To</label>
            <p className="text-xl font-bold text-foreground tracking-clinical">{tenant.name}</p>
          </div>

          <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-clinical-muted uppercase block">Recognition Amount ($)</label>
              <Input 
                type="number" 
                step="0.01"
                disabled={isViewer}
                {...register('amountPaid', { valueAsNumber: true })} 
                className="pl-4 pr-4 py-6 text-[32px] font-bold font-finance tracking-clinical h-16 border-border bg-muted/30 disabled:opacity-30" 
                placeholder="0.00"
              />
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
        <div className="mt-auto pt-10">
          <Button 
            variant="primary"
            type="submit" 
            form="payment-form"
            isLoading={isPending || isSubmitting}
            disabled={isPending || isSubmitting || isViewer}
            className="w-full h-12 uppercase font-bold disabled:opacity-50"
          >
            {isViewer ? 'Read-Only Locked' : 'Liquidate Liability'}
          </Button>
          {isViewer && (
            <p className="text-[9px] text-destructive/40 font-bold uppercase tracking-widest text-center mt-2 italic">Security Block: Viewer Restricted</p>
          )}
        </div>
      </div>
    </SideSheet>
  );
}
