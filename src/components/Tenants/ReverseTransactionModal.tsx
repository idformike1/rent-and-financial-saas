'use client'

import { useState } from 'react'
import { reverseLedgerTransaction } from '@/actions/finance.actions'
import { Card, Button, Label, cn } from '@/components/ui-finova'
import { toast } from '@/lib/toast'
import { RotateCcw, MessageSquare, X, AlertTriangle } from 'lucide-react'

interface ReverseTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  description: string;
  onSuccess?: () => void;
}

export default function ReverseTransactionModal({ isOpen, onClose, entryId, description, onSuccess }: ReverseTransactionModalProps) {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || reason.length < 5) return toast.error("Please provide a valid reversal reason (min 5 chars).");

    setIsSubmitting(true);
    try {
      const res = await reverseLedgerTransaction({
        entryId,
        reason
      });

      if (res.success) {
        toast.success(res.message);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <Card className="w-full max-w-md p-6 bg-zinc-950 border border-white/10 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-clinical-muted hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-rose-500/10 rounded-lg">
            <RotateCcw className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Ledger Reversal</h2>
            <p className="text-xs text-clinical-muted">Append an offsetting entry to void this transaction.</p>
          </div>
        </div>

        <div className="mb-6 p-3 bg-white/[0.02] border border-white/[0.05] rounded-[var(--radius-sm)] flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted">Targeting Entry</p>
            <p className="text-xs text-white/80 line-clamp-2">{description}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Reversal Reason / Justification</Label>
            <div className="relative">
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] text-foreground p-3 rounded-[var(--radius-sm)] text-sm placeholder:text-clinical-muted focus:outline-none focus:border-white/10 transition-all min-h-[100px]"
                placeholder="e.g. Data entry error, Payment bounced, Double recording..."
                autoFocus
              />
              <MessageSquare className="absolute right-3 bottom-3 w-4 h-4 text-white/5" />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1 h-10" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 h-10 bg-rose-600 hover:bg-rose-500"
              isLoading={isSubmitting}
            >
              Confirm Reversal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
