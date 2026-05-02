'use client'

import { useState } from 'react'
import { applyLedgerAdjustment } from '@/actions/finance.actions'
import { Button, Input, Label, cn } from '@/src/components/finova/ui-finova'
import { toast } from '@/lib/toast'
import { Scale, Receipt, Sparkles, MessageSquare } from 'lucide-react'
import { SideSheet } from '@/src/components/system/SideSheet'

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
        setAmount('');
        setReason('');
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
    <SideSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Ledger Adjustment"
      size="md"
    >
        <div className="flex flex-col h-full">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand/10 rounded-lg">
                        <Scale className="w-5 h-5 text-brand" />
                    </div>
                    <p className="text-[11px] font-bold text-clinical-muted uppercase tracking-widest">Fiscal Correction</p>
                </div>
                <h2 className="text-2xl font-bold text-white">Manual Entry</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Adjustment Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setType('FEE')}
                            className={cn(
                            "flex items-center justify-center gap-3 h-12 rounded-[var(--radius-sm)] border transition-all",
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
                            "flex items-center justify-center gap-3 h-12 rounded-[var(--radius-sm)] border transition-all",
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

                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Amount (USD)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-4 text-clinical-muted text-sm">$</span>
                        <Input 
                            type="number" 
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-8 h-12 bg-white/[0.02] border-white/10 text-lg font-mono"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Reason / Justification</Label>
                    <div className="relative">
                        <textarea 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 text-foreground p-4 rounded-[var(--radius-sm)] text-sm placeholder:text-clinical-muted focus:outline-none focus:border-brand/30 transition-all min-h-[120px] resize-none"
                            placeholder="e.g. Late fee for April, Appliance repair concession..."
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
                        className={cn(
                            "flex-1 h-12 uppercase font-bold",
                            type === 'FEE' ? "bg-rose-600 hover:bg-rose-500" : "bg-emerald-600 hover:bg-emerald-500"
                        )}
                        isLoading={isSubmitting}
                    >
                        Confirm Adjustment
                    </Button>
                </div>
            </form>
        </div>
    </SideSheet>
  )
}
