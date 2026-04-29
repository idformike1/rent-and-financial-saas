'use client';

import React from 'react';
import { processPayment } from '@/actions/finance.actions';
import { Input, Button, Label, Select } from '@/src/components/finova/ui-finova'
import { Card } from '@/src/components/system/Card';
import { toast } from '@/lib/toast';

/**
 * PAYMENT FORM (COMMAND CENTER COMPONENT)
 * 
 * Secure entry point for logging occupant payments and credit reconciliations.
 */

export function PaymentForm({ tenant, isPending, startTransition }: any) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    startTransition(async () => {
      try {
        const payload = {
          tenantId: tenant.id,
          amountPaid: Number(formData.get('amount')),
          transactionDate: formData.get('date') as string,
          paymentMode: formData.get('mode') as any,
          referenceText: formData.get('reference') as string,
        };
        
        const res = await processPayment(payload);
        if (res.success) {
          toast.success("Payment Received.");
        } else {
          toast.error("Payment Failure.");
        }
      } catch (err: any) {
        toast.error("System Exception.");
      }
    });
  };

  return (
    <Card variant="muted" className="p-0 border-white/10">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-clinical">Receive Payment</h2>
        <p className="text-[11px] text-clinical-muted mt-1 uppercase font-bold tracking-widest">Log a tenant payment to offset Accounts Receivable.</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Amount ($)</Label>
              <Input name="amount" type="number" step="0.01" required placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Date</Label>
              <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Mode</Label>
              <Select name="mode" required>
                <option value="BANK">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="MPESA">M-Pesa / Mobile</option>
                <option value="CHEQUE">Cheque</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase tracking-widest">Reference</Label>
              <Input name="reference" placeholder="TRX-..." required />
            </div>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-4" disabled={isPending}>
            {isPending ? 'Securing Tranche...' : 'Log & Reconcile Payment'}
          </Button>
        </form>
      </div>
    </Card>
  );
}
