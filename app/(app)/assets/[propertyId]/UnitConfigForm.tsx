'use client';

import { useActionState, useEffect } from 'react';
import { updateUnit } from '@/actions/asset.actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

const inputClass = "w-full bg-transparent border-b border-[#1F2937] rounded-none py-2 px-0 text-[13px] text-[#E5E7EB] outline-none focus:border-[#5D71F9] font-mono transition-colors";
const labelClass = "text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold mb-1 block";

const updateUnitAction = async (prevState: any, formData: FormData) => {
  const unitId = formData.get('unitId') as string;
  const isDecommission = formData.get('decommission') === 'true';

  if (isDecommission) {
    return await updateUnit(unitId, { maintenanceStatus: 'DECOMMISSIONED' });
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

      <div className="pt-8 flex flex-col gap-4 border-t border-[#1F2937]">
        <button 
          type="submit" 
          disabled={isPending}
          className="w-full bg-[#E5E7EB] text-[#12121A] h-12 text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
        >
          {isPending ? '[ EXECUTING... ]' : '[ COMMIT CONFIGURATION ]'}
        </button>

        <button 
          type="submit" 
          name="decommission" 
          value="true"
          disabled={isPending}
          className="w-full border border-destructive/20 text-destructive bg-destructive/5 h-12 text-[11px] font-bold uppercase tracking-widest hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          {isPending ? '[ EXECUTING... ]' : '[ DECOMMISSION ASSET ]'}
        </button>
      </div>
    </form>
  );
}
