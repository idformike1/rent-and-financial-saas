'use client';

import { useActionState, useEffect } from 'react';
import { updateUnit } from '@/actions/asset.actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { MaintenanceStatus } from '@/src/schema/enums';

import { Check, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

const inputClass = "w-full bg-gray-800/50 border border-gray-700 rounded-[var(--radius-sm)] h-12 px-4 text-[14px] text-[#E5E7EB] outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent font-mono transition-all disabled:opacity-30";
const labelClass = "text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold mb-1 block";

const updateUnitAction = async (prevState: any, formData: FormData) => {
  try {
    const unitId = formData.get('unitId') as string;
    const isDecommission = formData.get('decommission') === 'true';
    const isRecommission = formData.get('recommission') === 'true';

    if (isDecommission) {
      return await updateUnit(unitId, { maintenanceStatus: MaintenanceStatus.DECOMMISSIONED });
    }

    if (isRecommission) {
      return await updateUnit(unitId, { maintenanceStatus: MaintenanceStatus.OPERATIONAL });
    }

    const data = {
      unitNumber: formData.get('unitNumber') as string,
      type: formData.get('type') as string,
      category: formData.get('category') as string,
      marketRent: Number(formData.get('marketRent')),
    };
    
    return await updateUnit(unitId, data);
  } catch (error: any) {
    console.error('[UNIT_CONFIG_MUTATION_CRASH_GUARD]', error);
    return { success: false, error: error.message || "Mutation execution failed." };
  }
};

export default function UnitConfigForm({ activeUnit }: { activeUnit: any }) {
  const { data: session } = useSession();
  const isViewer = session?.user?.role === 'VIEWER';
  const isDecommissioned = activeUnit?.maintenanceStatus === 'DECOMMISSIONED' || activeUnit?.property?.status === 'DECOMMISSIONED';
  const [state, formAction, isPending] = useActionState(updateUnitAction, null);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success("Unit configuration synchronized.");
      } else {
        toast.error(state.error || "Protocol violation in payload.");
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
          disabled={isPending || isViewer || isDecommissioned}
          className={inputClass} 
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={labelClass}>Taxonomy Category</label>
          <input 
            name="category" 
            defaultValue={activeUnit.category} 
            disabled={isPending || isViewer}
            className={inputClass} 
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Taxonomy Type</label>
          <input 
            name="type" 
            defaultValue={activeUnit.type} 
            disabled={isPending || isViewer || isDecommissioned}
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
          disabled={isPending || isViewer || isDecommissioned}
          className={cn(inputClass, "tabular-nums")} 
        />
      </div>

      {isDecommissioned && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
          <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">!</div>
          <p className="text-[10px] font-bold text-amber-500 leading-normal">
            GOVERNANCE HALT: This asset node is DECOMMISSIONED. Configurations are locked until the asset is recommissioned.
          </p>
        </div>
      )}

      <div className="pt-8 space-y-6 border-t border-[#1F2937]">
        {activeUnit.leases?.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
             <div className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center text-[10px] font-bold text-white mt-0.5">!</div>
             <p className="text-[10px] font-bold text-destructive leading-normal">
                GOVERNANCE LOCK: Decommissioning is restricted while an occupant is active. Terminate the lease before purging this inventory node.
             </p>
          </div>
        )}

        <div className="flex gap-4">
          <button 
            type="submit" 
            disabled={isPending || isViewer || isDecommissioned}
            className="flex-1 flex items-center justify-center gap-2 bg-brand text-white rounded-[var(--radius-sm)] h-12 text-[12px] font-bold tracking-clinical hover:bg-brand/90 transition-colors disabled:opacity-20 disabled:grayscale cursor-pointer disabled:cursor-not-allowed"
          >
            <Check size={14} />
            {isPending ? 'Executing...' : 'Commit Configuration'}
          </button>

          {isDecommissioned && activeUnit?.maintenanceStatus === 'DECOMMISSIONED' ? (
            <button 
              type="submit" 
              name="recommission" 
              value="true"
              disabled={isPending || isViewer || (activeUnit?.property?.status === 'DECOMMISSIONED')}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white rounded-[var(--radius-sm)] h-12 text-[12px] font-bold tracking-clinical hover:bg-emerald-600 transition-colors disabled:opacity-20 disabled:grayscale cursor-pointer"
            >
              <Check size={14} />
              {isPending ? 'Executing...' : 'Recommission Asset'}
            </button>
          ) : (
            <button 
              type="submit" 
              name="decommission" 
              value="true"
              disabled={isPending || isViewer || isDecommissioned || activeUnit.leases?.length > 0}
              className="flex-1 flex items-center justify-center gap-2 border border-destructive/20 text-destructive bg-destructive/5 rounded-[var(--radius-sm)] h-12 text-[12px] font-bold tracking-clinical hover:bg-destructive/10 transition-colors disabled:opacity-20 disabled:grayscale cursor-pointer disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              {isPending ? 'Executing...' : 'Decommission Asset'}
            </button>
          )}
        </div>
      </div>
      
      {isViewer && (
        <p className="text-[10px] text-destructive/60 font-medium italic text-center mt-2">
          Read-Only Clearance: Mutations restricted for VIEWER identity.
        </p>
      )}
    </form>
  );
}
