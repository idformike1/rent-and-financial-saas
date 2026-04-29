'use client';

import React, { useState } from 'react';
import { generateUtilityAccrualAction } from '@/actions/billing.actions';
import { Input, Button, Label } from '@/src/components/finova/ui-finova'
import { Card } from '@/src/components/system/Card';
import { toast } from '@/lib/toast';
import { FileText, Zap, Droplets, MinusCircle } from 'lucide-react';

/**
 * UTILITY FORM (COMMAND CENTER COMPONENT)
 * 
 * Clinical orchestrator for meter readings and financial waivers.
 */

export function UtilityForm({ tenant, isPending, startTransition }: any) {
  const [electric, setElectric] = useState('');
  const [water, setWater] = useState('');
  const [waiver, setWaiver] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('leaseId', tenant.leaseId);
        formData.append('unitId', tenant.unitId);
        formData.append('electric', electric);
        formData.append('water', water);
        formData.append('waiver', waiver);
        
        const res = await generateUtilityAccrualAction(formData);
        if (res.success) {
          toast.success("Billing generation initiated.");
        } else {
          toast.error("Billing generation failed.");
        }
      } catch (err: any) {
        toast.error("Runtime exception.");
      }
    });
  };

  return (
    <Card variant="muted" className="p-0 border-white/10">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-[13px] font-bold text-white uppercase tracking-clinical">Utility & Billing Orchestrator</h2>
        <p className="text-[11px] text-clinical-muted mt-1 uppercase font-bold tracking-widest">Enter meter readings to calculate delta</p>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] uppercase tracking-widest"><Zap className="w-3 h-3 text-amber-500" /> Electric (Current)</Label>
              <Input type="number" placeholder="e.g. 14205" value={electric} onChange={(e) => setElectric(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-[11px] uppercase tracking-widest"><Droplets className="w-3 h-3 text-blue-500" /> Water (Current)</Label>
              <Input type="number" placeholder="e.g. 543" value={water} onChange={(e) => setWater(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[11px] uppercase tracking-widest"><MinusCircle className="w-3 h-3 text-rose-500" /> Waiver Option</Label>
            <Input type="number" placeholder="$0.00" value={waiver} onChange={(e) => setWaiver(e.target.value)} />
            <p className="text-[9px] text-clinical-muted mt-1 font-bold tracking-widest uppercase">Generates a negative adjustment against base rent.</p>
          </div>
          <Button type="submit" variant="primary" className="w-full mt-4" disabled={isPending}>
            {isPending ? 'Processing Matrix...' : 'Preview & Bill Ledger'}
            {!isPending && <FileText className="w-4 h-4 ml-2" />}
          </Button>
        </form>
      </div>
    </Card>
  );
}
