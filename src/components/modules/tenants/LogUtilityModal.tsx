'use client'

import { useState } from 'react'
import { logUtilityConsumption } from '@/actions/finance.actions'
import { Button, Input, Label, cn } from '@/src/components/finova/ui-finova'
import { toast } from '@/lib/toast'
import { Activity, Calendar, Zap, Droplets } from 'lucide-react'
import { SideSheet } from '@/src/components/system/SideSheet'

interface LogUtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  unitId: string;
  onSuccess?: () => void;
}

export default function LogUtilityModal({ isOpen, onClose, tenantId, unitId, onSuccess }: LogUtilityModalProps) {
  const [utilityType, setUtilityType] = useState<'ELECTRIC' | 'WATER'>('ELECTRIC');
  const [readingDate, setReadingDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentReading, setCurrentReading] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReading) return toast.error("Reading value is required.");

    setIsSubmitting(true);
    try {
      const res = await logUtilityConsumption({
        tenantId,
        unitId,
        utilityType,
        currentReading: parseFloat(currentReading),
        date: readingDate
      });

      if (res.success) {
        toast.success(res.message || "Utility consumption logged.");
        setCurrentReading(''); // RESET FORM STATE
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to log utility.");
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
      title="Consumption Intake"
      size="md"
    >
        <div className="flex flex-col h-full">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand/10 rounded-lg">
                        <Activity className="w-5 h-5 text-brand" />
                    </div>
                    <p className="text-[11px] font-bold text-clinical-muted uppercase tracking-widest">Reconciliation Layer</p>
                </div>
                <h2 className="text-2xl font-bold text-white">Log Utility Meter</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Utility Type</Label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setUtilityType('ELECTRIC')}
                            className={cn(
                            "flex items-center justify-center gap-3 h-12 rounded-[var(--radius-sm)] border transition-all",
                            utilityType === 'ELECTRIC' 
                                ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                                : "bg-white/[0.02] border-white/10 text-clinical-muted hover:bg-white/[0.05]"
                            )}
                        >
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Electric</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setUtilityType('WATER')}
                            className={cn(
                            "flex items-center justify-center gap-3 h-12 rounded-[var(--radius-sm)] border transition-all",
                            utilityType === 'WATER' 
                                ? "bg-blue-500/10 border-blue-500/50 text-blue-500" 
                                : "bg-white/[0.02] border-white/10 text-clinical-muted hover:bg-white/[0.05]"
                            )}
                        >
                            <Droplets className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Water</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Reading Date</Label>
                    <div className="relative">
                        <Input 
                            type="date" 
                            value={readingDate}
                            onChange={(e) => setReadingDate(e.target.value)}
                            className="pl-10 h-12 bg-white/[0.02] border-white/10"
                        />
                        <Calendar className="absolute left-3 top-4 w-4 h-4 text-clinical-muted" />
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Current Reading Value</Label>
                    <Input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g. 1450.25"
                        value={currentReading}
                        onChange={(e) => setCurrentReading(e.target.value)}
                        className="h-12 bg-white/[0.02] border-white/10 text-lg font-mono"
                        autoFocus
                    />
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
                        className="flex-1 h-12 uppercase font-bold" 
                        isLoading={isSubmitting}
                    >
                        Log Reading
                    </Button>
                </div>
            </form>
        </div>
    </SideSheet>
  )
}
