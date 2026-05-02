'use client'

import { useState } from 'react'
import { processMoveOut } from '@/actions/tenant.actions'
import { Button, Label } from '@/src/components/finova/ui-finova'
import { toast } from '@/lib/toast'
import { Trash2, AlertTriangle, Info } from 'lucide-react'
import { SideSheet } from '@/src/components/system/SideSheet'

interface TerminateLeaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  leaseId: string;
  unitNumber: string;
  onSuccess?: () => void;
}

export default function TerminateLeaseModal({ isOpen, onClose, tenantId, leaseId, unitNumber, onSuccess }: TerminateLeaseModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const res = await processMoveOut(tenantId, leaseId, ''); // unitId not strictly needed if we have leaseId in service, but I'll pass empty or adjust service
      
      if (res.success) {
        toast.success("Tenure officially annulled.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to terminate lease.");
      }
    } catch (error: any) {
      toast.error(error.message || "Internal engine failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Tenure Decommissioning"
      size="md"
    >
        <div className="flex flex-col h-full">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                        <Trash2 className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-[11px] font-bold text-clinical-muted uppercase tracking-widest">Move-Out Protocol</p>
                </div>
                <h2 className="text-2xl font-bold text-white">Terminate Lease</h2>
            </header>

            <div className="space-y-6 flex-1">
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-[var(--radius-sm)] flex gap-4">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-amber-500 uppercase tracking-widest">Critical Operation</p>
                        <p className="text-sm text-white/70 leading-relaxed">
                            You are about to terminate the active lease for **Unit {unitNumber}**. This will mark the unit as vacant and stop all future automated billing for this occupant.
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-[var(--radius-sm)] flex gap-4">
                    <Info className="w-5 h-5 text-clinical-muted shrink-0" />
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-clinical-muted uppercase tracking-widest">Financial Notice</p>
                        <p className="text-sm text-white/50 leading-relaxed italic">
                            This action does not delete the tenant's historical ledger. Any outstanding balances will remain on their profile for final settlement.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-auto pt-10 flex gap-3">
                <Button 
                    type="button" 
                    variant="secondary" 
                    className="flex-1 h-12 uppercase font-bold" 
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="primary" 
                    className="flex-1 h-12 uppercase font-bold bg-rose-600 hover:bg-rose-500"
                    isLoading={isSubmitting}
                >
                    Confirm Termination
                </Button>
            </form>
        </div>
    </SideSheet>
  )
}
