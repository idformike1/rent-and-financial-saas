'use client'

import { useState } from 'react'
import { reverseLedgerTransaction } from '@/actions/finance.actions'
import { Button, Label } from '@/src/components/finova/ui-finova'
import { toast } from '@/lib/toast'
import { RotateCcw, MessageSquare, AlertTriangle } from 'lucide-react'
import { SideSheet } from '@/src/components/system/SideSheet'

interface ReverseTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  description: string;
  tenantId?: string;
  onSuccess?: () => void;
}

export default function ReverseTransactionModal({ isOpen, onClose, entryId, description, onSuccess }: ReverseTransactionModalProps) {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.length < 5) return toast.error("Please provide a valid reversal reason (min 5 chars).");

    setIsSubmitting(true);
    try {
      const res = await reverseLedgerTransaction({
        entryId,
        tenantId,
        reason
      });

      if (res.success) {
        toast.success(res.message);
        setReason('');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Reversal failed.");
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
      title="Ledger Reversal"
      size="md"
    >
        <div className="flex flex-col h-full">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-500/10 rounded-lg">
                        <RotateCcw className="w-5 h-5 text-rose-500" />
                    </div>
                    <p className="text-[11px] font-bold text-clinical-muted uppercase tracking-widest">Audit Integrity</p>
                </div>
                <h2 className="text-2xl font-bold text-white">Void Transaction</h2>
            </header>

            <div className="mb-6 p-4 bg-white/[0.02] border border-white/10 rounded-[var(--radius-sm)] flex gap-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted mb-1">Targeting Entry</p>
                    <p className="text-sm text-white/80 line-clamp-2 leading-relaxed">{description}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Reversal Reason / Justification</Label>
                    <div className="relative">
                        <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 text-foreground p-4 rounded-[var(--radius-sm)] text-sm placeholder:text-clinical-muted focus:outline-none focus:border-brand/30 transition-all min-h-[140px] resize-none"
                            placeholder="e.g. Data entry error, Payment bounced, Double recording..."
                            autoFocus
                        />
                        <MessageSquare className="absolute right-3 bottom-3 w-4 h-4 text-white/5" />
                    </div>
                </div>

                <div className="mt-auto pt-10 flex gap-3">
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
                        Confirm Reversal
                    </Button>
                </div>
            </form>
        </div>
    </SideSheet>
  )
}
