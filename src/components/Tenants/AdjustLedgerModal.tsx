'use client'

import { useState } from 'react'
import { applyLedgerAdjustment } from '@/actions/finance.actions'
import { Card, Button, Input, Label, cn } from '@/components/ui-finova'
import { toast } from '@/lib/toast'
import { Scale, Receipt, Sparkles, X, MessageSquare } from 'lucide-react'

interface AdjustLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess?: () => void;
}

export default function AdjustLedgerModal({ isOpen, onClose, tenantId, onSuccess }: AdjustLedgerModalProps) {
  const [type, setType] = useState<'FEE' | 'WAIVER'>('FEE');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error("Amount must be greater than 0.");
    if (!reason || reason.length < 5) return toast.error("Please provide a valid reason (min 5 chars).");

    setIsSubmitting(true);
    try {
      const res = await applyLedgerAdjustment({
        tenantId,
        amount: parseFloat(amount),
        type,
        reason
      });

      if (res.success) {
        toast.success(res.message);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Adjustment failed.");
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

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Ledger Adjustment</h2>
            <p className="text-xs text-clinical-muted">Apply manual fees or concessions to the occupant's ledger.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('FEE')}
                className={cn(
                  "flex items-center justify-center gap-2 h-12 rounded-[var(--radius-sm)] border transition-all",
                  type === 'FEE' 
                    ? "bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.1)]" 
                    : "bg-white/[0.02] border-white/10 text-clinical-muted hover:bg-white/[0.05]"
                )}
              >
                <Receipt className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Custom Fee</span>
              </button>
              <button
                type="button"
                onClick={() => setType('WAIVER')}
                className={cn(
                  "flex items-center justify-center gap-2 h-12 rounded-[var(--radius-sm)] border transition-all",
                  type === 'WAIVER' 
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                    : "bg-white/[0.02] border-white/10 text-clinical-muted hover:bg-white/[0.05]"
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Waiver</span>
              </button>
            </div>
          </div>

          <div>
            <Label>Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-clinical-muted text-sm">$</span>
              <Input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 h-10"
                autoFocus
              />
            </div>
          </div>

          <div>
            <Label>Reason / Justification</Label>
            <div className="relative">
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/[0.08] text-foreground p-3 rounded-[var(--radius-sm)] text-sm placeholder:text-clinical-muted focus:outline-none focus:border-white/10 transition-all min-h-[100px]"
                placeholder="e.g. Late fee for April, Appliance repair concession..."
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
              className={cn(
                "flex-1 h-10",
                type === 'FEE' ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
              )}
              isLoading={isSubmitting}
            >
              Confirm Adjustment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
