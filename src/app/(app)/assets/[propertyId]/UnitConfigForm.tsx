'use client';

import { useActionState, useEffect } from 'react';
import { updateUnit } from '@/actions/asset.actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { MaintenanceStatus } from '@/src/schema/enums';

import { Check, Trash2 } from 'lucide-react';

const inputClass = "w-full bg-gray-800/50 border border-gray-700 rounded-md h-10 px-3 text-[13px] text-[#E5E7EB] outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent font-mono transition-all";
const labelClass = "text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold mb-1 block";

const updateUnitAction = async (prevState: any, formData: FormData) => {
  const unitId = formData.get('unitId') as string;
  const isDecommission = formData.get('decommission') === 'true';

  if (isDecommission) {
    return await updateUnit(unitId, { maintenanceStatus: MaintenanceStatus.DECOMMISSIONED });
  }

  const data = {
    unitNumber: formData.get('unitNumber') as string,
    type: formData.get('type') as string,
    category: formData.get('category') as string,
    marketRent: Number(formData.get('marketRent')),
  };
  
  return await updateUnit(unitId, data);
};

export default function UnitConfigForm({ activeUnit }: { activeUnit: any }) {
  const [state, formAction, isPending] = useActionState(updateUnitAction, null);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success("Unit configuration synchronized.");
      } else {
        toast.error(state.message || "Protocol violation in payload.");
      }
    }
  }, [state]);

  if (!activeUnit) return null;

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="unitId" value={activeUnit.id} />
      
      <div className="space-y-1">
        <label className={labelClass}>Unit Number</label>
        <input 
          name="unitNumber" 
          defaultValue={activeUnit.unitNumber} 
          disabled={isPending}
          className={inputClass} 
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={labelClass}>Taxonomy Category</label>
          <input 
            name="category" 
            defaultValue={activeUnit.category} 
            disabled={isPending}
            className={inputClass} 
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Taxonomy Type</label>
          <input 
            name="type" 
            defaultValue={activeUnit.type} 
            disabled={isPending}
            className={inputClass} 
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Market Rent Baseline ($)</label>
        <input 
          name="marketRent" 
          type="number" 
          defaultValue={Number(activeUnit.marketRent || 0)} 
          disabled={isPending}
          className={cn(inputClass, "tabular-nums")} 
        />
      </div>

      <div className="pt-8 flex gap-4 border-t border-[#1F2937]">
        <button 
          type="submit" 
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-brand text-white rounded-[6px] h-10 text-[12px] font-bold tracking-tight hover:bg-brand/90 transition-colors disabled:opacity-50 "
        >
          <Check size={14} />
          {isPending ? 'Executing...' : 'Commit Configuration'}
        </button>

        <button 
          type="submit" 
          name="decommission" 
          value="true"
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 border border-destructive/20 text-destructive bg-destructive/5 rounded-[6px] h-10 text-[12px] font-bold tracking-tight hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          <Trash2 size={14} />
          {isPending ? 'Executing...' : 'Decommission Asset'}
        </button>
      </div>
    </form>
  );
}
