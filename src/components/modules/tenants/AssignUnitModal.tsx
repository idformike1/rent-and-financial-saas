'use client'

import { useState, useEffect } from 'react'
import { getVacantUnits, addAdditionalLease } from '@/actions/tenant.actions'
import { Button, Input, Label, cn } from '@/src/components/finova/ui-finova'
import { toast } from '@/lib/toast'
import { Home, Landmark, Calendar, Check } from 'lucide-react'
import { SideSheet } from '@/src/components/system/SideSheet'

interface AssignUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantId: string;
  onSuccess?: () => void;
}

export default function AssignUnitModal({ isOpen, onClose, tenantId, onSuccess }: AssignUnitModalProps) {
  const [units, setUnits] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [rentAmount, setRentAmount] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getVacantUnits().then(res => {
        if (res.success) {
          setUnits(res.data);
        } else {
          toast.error(res.message || "Failed to materialize vacant unit registry.");
        }
      });
    }
  }, [isOpen]);

  const handleUnitChange = (unitId: string) => {
    setSelectedUnitId(unitId);
    const unit = units.find(u => u.id === unitId);
    if (unit) {
      setRentAmount(unit.marketRent.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitId) return toast.error("Please select a unit.");
    if (!rentAmount || parseFloat(rentAmount) < 0) return toast.error("Valid rent amount required.");

    setIsSubmitting(true);
    try {
      const res = await addAdditionalLease({
        tenantId,
        unitId: selectedUnitId,
        rentAmount: parseFloat(rentAmount),
        depositAmount: parseFloat(depositAmount),
        startDate
      });

      if (res.success) {
        toast.success("Lease protocol established.");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to assign unit.");
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
      title="Asset Allocation"
      size="md"
    >
        <div className="flex flex-col h-full">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand/10 rounded-lg">
                        <Home className="w-5 h-5 text-brand" />
                    </div>
                    <p className="text-[11px] font-bold text-clinical-muted uppercase tracking-widest">Tenure Initialization</p>
                </div>
                <h2 className="text-2xl font-bold text-white">Assign Unit</h2>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Select Vacant Unit</Label>
                    <select 
                        value={selectedUnitId}
                        onChange={(e) => handleUnitChange(e.target.value)}
                        className="w-full h-12 bg-white/[0.02] border border-white/10 text-foreground px-4 rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-brand/30 transition-all appearance-none cursor-pointer"
                        required
                    >
                        <option value="" className="bg-[#12121A]">-- SELECT AVAILABLE UNIT --</option>
                        {units.map(u => (
                            <option key={u.id} value={u.id} className="bg-[#12121A]">
                                {u.unitNumber} - {u.property?.name} (${u.marketRent}/mo)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-white/40">Contractual Rent</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-clinical-muted text-sm">$</span>
                            <Input 
                                type="number" 
                                value={rentAmount}
                                onChange={(e) => setRentAmount(e.target.value)}
                                className="pl-8 h-12 bg-white/[0.02] border-white/10"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Label className="text-xs uppercase tracking-widest text-white/40">Security Deposit</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-clinical-muted text-sm">$</span>
                            <Input 
                                type="number" 
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="pl-8 h-12 bg-white/[0.02] border-white/10"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest text-white/40">Move-In Date</Label>
                    <div className="relative">
                        <Input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-12 bg-white/[0.02] border-white/10 uppercase [color-scheme:dark]"
                            required
                        />
                        <Calendar className="absolute right-3 top-4 w-4 h-4 text-white/5" />
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
                        className="flex-1 h-12 uppercase font-bold bg-brand hover:bg-brand/90"
                        isLoading={isSubmitting}
                    >
                        <Check className="w-4 h-4 mr-2" />
                        Execute Assignment
                    </Button>
                </div>
            </form>
        </div>
    </SideSheet>
  )
}
