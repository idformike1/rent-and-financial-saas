'use client'

import { useState, useTransition, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { processPayment } from '@/actions/ledger.actions'
import { ChargeDTO, TenantDTO } from '@/types'
import { X } from 'lucide-react'

interface PaymentDrawerProps {
  tenant: TenantDTO;
  activeCharges: ChargeDTO[]; // Needs to be pre-sorted or we sort here
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const paymentSchema = z.object({
  amountPaid: z.number().positive("Amount must be greater than 0")
})

type PaymentForm = z.infer<typeof paymentSchema>

export default function PaymentDrawer({ tenant, activeCharges, isOpen, onClose, onSuccess }: PaymentDrawerProps) {
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amountPaid: 0 }
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
    setServerError('')
    startTransition(async () => {
      const response = await processPayment({
        tenantId: tenant.id,
        amountPaid: data.amountPaid
      })
      if (response.success) {
        reset()
        onSuccess() // Trigger close and refresh
      } else {
        setServerError(response.message || 'Payment failed')
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/40 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Receive Payment</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-6">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Tenant</h3>
            <p className="text-lg font-medium text-slate-900">{tenant.name}</p>
          </div>

          <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Payment Amount ($)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-medium">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  {...register('amountPaid', { valueAsNumber: true })} 
                  className="block w-full pl-8 pr-3 py-3 text-lg border-2 border-slate-200 rounded-md focus:border-indigo-600 focus:ring-0 transition-colors font-medium text-slate-900 placeholder-slate-300" 
                  placeholder="0.00"
                />
              </div>
              {errors.amountPaid && <p className="text-red-500 text-sm mt-2 font-medium">{errors.amountPaid.message}</p>}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Distribution Preview (Waterfall)</h4>
              <div className="space-y-3">
                {previewData.length === 0 ? (
                  <p className="text-sm text-slate-500 italic">No outstanding charges.</p>
                ) : (
                  previewData.map((charge) => (
                    <div key={charge.id} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-100">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{charge.type}</p>
                        <p className="text-xs text-slate-500">Due: {new Date(charge.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Owes: ${charge.balanceOwed.toFixed(2)}</p>
                        <p className="text-sm font-semibold text-green-600">
                          {charge.applied > 0 ? `+ $${charge.applied.toFixed(2)}` : '$0.00'}
                        </p>
                      </div>
                    </div>
                  ))
                )}

                {overpayment > 0 && (
                  <div className="flex justify-between items-center bg-indigo-50 p-3 rounded border border-indigo-100 mt-2">
                    <div>
                      <p className="text-sm font-medium text-indigo-900">Credit to Ledger</p>
                      <p className="text-xs text-indigo-700">Excess funds unapplied</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-indigo-600">+ ${overpayment.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {serverError && <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded">{serverError}</p>}
          </form>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button 
            type="submit" 
            form="payment-form"
            disabled={isPending || isSubmitting} 
            className="w-full bg-slate-900 text-white font-medium py-3 rounded-md shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Executing Transaction...' : 'Process Payment'}
          </button>
        </div>
      </div>
    </>
  )
}
