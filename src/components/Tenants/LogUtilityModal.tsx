'use client'

import { useState } from 'react'
import { logUtilityConsumption } from '@/actions/finance.actions'
import { Card, Button, Input, Select, Label, cn } from '@/components/ui-finova'
import { toast } from '@/lib/toast'
import { Activity, Calendar, Zap, Droplets, X } from 'lucide-react'

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

  if (!isOpen) return null;

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
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Consumption Intake</h2>
            <p className="text-xs text-clinical-muted">Log meter reading for unit reconciliation.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Utility Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUtilityType('ELECTRIC')}
                className={cn(
                  "flex items-center justify-center gap-2 h-10 rounded-[var(--radius-sm)] border transition-all",
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
                  "flex items-center justify-center gap-2 h-10 rounded-[var(--radius-sm)] border transition-all",
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

          <div>
            <Label>Reading Date</Label>
            <div className="relative">
              <Input 
                type="date" 
                value={readingDate}
                onChange={(e) => setReadingDate(e.target.value)}
                className="pl-10"
              />
              <Calendar className="absolute left-3 top-2 w-4 h-4 text-clinical-muted" />
            </div>
          </div>

          <div>
            <Label>Current Reading Value</Label>
            <Input 
              type="number" 
              step="0.01"
              placeholder="e.g. 1450.25"
              value={currentReading}
              onChange={(e) => setCurrentReading(e.target.value)}
              autoFocus
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1" 
              isLoading={isSubmitting}
            >
              Log Reading
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
