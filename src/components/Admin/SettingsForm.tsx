'use client'

import { useState } from 'react'
import { updateSystemSettings } from '@/actions/management.actions'
import { Button, cn } from '@/src/components/finova/ui-finova'
import { Card } from '@/src/components/system/Card'
import { toast } from '@/lib/toast'
import { Settings, Zap, Droplets, Clock, Percent, ShieldCheck } from 'lucide-react'

interface SettingsFormProps {
  initialData: {
    electricTariff: number;
    waterTariff: number;
    lateFeePercentage: number;
    gracePeriodDays: number;
  }
}

export default function SettingsForm({ initialData }: SettingsFormProps) {
  const [data, setData] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await updateSystemSettings(data);
      if (res.success) {
        toast.success((res as any).message);
      } else {
        toast.error((res as any).error || "Update failed.");
      }
    } catch (error: any) {
      toast.error(error.message || "Internal engine failure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({ label, icon: Icon, value, onChange, type = "number", step = "0.01", description }: any) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase font-bold tracking-widest text-clinical-muted flex items-center gap-2">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </label>
      </div>
      <div className="relative group">
        <input 
          type={type}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/[0.08] text-foreground p-3 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
        />
        <div className="absolute inset-0 rounded-[var(--radius-sm)] bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
      <p className="text-[10px] text-clinical-muted italic">{description}</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UTILITY TARIFFS */}
        <Card className="p-8 border border-white/[0.08] bg-zinc-950/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Settings className="w-24 h-24 rotate-12" />
          </div>
          
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Utility Tariffs</h3>
              <p className="text-xs text-clinical-muted">Configure consumption-based billing rates.</p>
            </div>
          </div>

          <div className="space-y-6">
            <InputField 
              label="Electric Rate (Per kWh)"
              icon={Zap}
              value={data.electricTariff}
              onChange={(v: string) => setData({ ...data, electricTariff: parseFloat(v) })}
              description="Standard rate applied to electricity submeter deltas."
            />
            <InputField 
              label="Water Rate (Per Unit)"
              icon={Droplets}
              value={data.waterTariff}
              onChange={(v: string) => setData({ ...data, waterTariff: parseFloat(v) })}
              description="Standard rate applied to water meter consumption."
            />
          </div>
        </Card>

        {/* BILLING PROTOCOLS */}
        <Card className="p-8 border border-white/[0.08] bg-zinc-950/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-24 h-24 -rotate-12" />
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Billing Protocols</h3>
              <p className="text-xs text-clinical-muted">Governance for arrears and late penalties.</p>
            </div>
          </div>

          <div className="space-y-6">
            <InputField 
              label="Late Fee Percentage (%)"
              icon={Percent}
              value={data.lateFeePercentage}
              onChange={(v: string) => setData({ ...data, lateFeePercentage: parseFloat(v) })}
              description="Automated penalty applied to overdue balances."
            />
            <InputField 
              label="Grace Period (Days)"
              icon={Clock}
              value={data.gracePeriodDays}
              onChange={(v: string) => setData({ ...data, gracePeriodDays: parseInt(v) })}
              description="Window after due date before penalties activate."
              step="1"
            />
          </div>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          variant="primary" 
          className="px-10 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-xl shadow-primary/20"
          isLoading={isSubmitting}
        >
          <ShieldCheck className="w-4 h-4 mr-2" />
          Synchronize Configuration
        </Button>
      </div>
    </form>
  )
}
