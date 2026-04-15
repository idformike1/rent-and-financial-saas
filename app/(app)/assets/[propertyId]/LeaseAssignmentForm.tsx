'use client';

import { useActionState, useEffect, useState } from 'react';
import { submitOnboarding, addAdditionalLease, processMoveOut, getActiveTenants } from '@/actions/tenant.actions';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

const inputClass = "w-full bg-transparent border-b border-[#1F2937] rounded-none py-2 px-0 text-[13px] text-[#E5E7EB] outline-none focus:border-[#5D71F9] font-mono transition-colors placeholder:text-[#1F2937]";
const labelClass = "text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold mb-1 block";

const submitAction = async (prevState: any, formData: FormData) => {
  const isExisting = formData.get('flowType') === 'EXISTING';
  const unitId = formData.get('unitId') as string;
  
  const rentAmount = Number(formData.get('rentAmount'));
  const depositAmount = Number(formData.get('depositAmount'));
  const startDate = formData.get('startDate') as string;
  
  try {
    if (isExisting) {
      const tenantId = formData.get('tenantId') as string;
      const res = await addAdditionalLease({ tenantId, unitId, rentAmount, depositAmount, startDate });
      return { success: res.success, message: res.message, ts: Date.now() };
    } else {
      const tenantName = formData.get('tenantName') as string;
      const email = formData.get('email') as string;
      const phone = formData.get('phone') as string;
      const nationalId = formData.get('nationalId') as string;
      const res = await submitOnboarding({
        tenantName, email, phone, nationalId, unitId, baseRent: rentAmount, securityDeposit: depositAmount, moveInDate: startDate
      });
      return { success: res.success, message: res.message, ts: Date.now() };
    }
  } catch (e: any) {
    return { success: false, message: e.message || "Unknown error", ts: Date.now() };
  }
};

const moveOutAction = async (prevState: any, formData: FormData) => {
  const unitId = formData.get('unitId') as string;
  const leaseId = formData.get('leaseId') as string;
  const tenantId = formData.get('tenantId') as string;
  const res = await processMoveOut(tenantId, leaseId, unitId);
  return { success: res.success, message: res.message, ts: Date.now() };
}

export default function LeaseAssignmentForm({ activeUnit }: { activeUnit: any }) {
  const [state, formAction, isPending] = useActionState(submitAction, null);
  const [moveOutState, moveOutFormAction, isMoveOutPending] = useActionState(moveOutAction, null);
  
  const [flowType, setFlowType] = useState<'EXISTING' | 'NEW'>('NEW');
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    if (state?.ts) {
      if (state.success) toast.success("Occupant assimilation complete.");
      else toast.error(state.message || "Ingestion override failed.");
    }
  }, [state?.ts]);

  useEffect(() => {
    if (moveOutState?.ts) {
      if (moveOutState.success) toast.success("Tenure officially annulled.");
      else toast.error(moveOutState.message || "Failed to annul lease.");
    }
  }, [moveOutState?.ts]);

  useEffect(() => {
    if (flowType === 'EXISTING') {
      getActiveTenants().then(res => {
        if (res.success && res.data) setTenants(res.data);
      });
    }
  }, [flowType]);

  if (!activeUnit) return null;

  // Active Lease State Rendering
  if (activeUnit.leases && activeUnit.leases.length > 0) {
    const activeLease = activeUnit.leases[0];
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h4 className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold">Primary Registrant</h4>
          <p className="font-mono text-[14px] text-[#E5E7EB]">{activeLease.tenant?.name || 'UNKNOWN'}</p>
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold">Active Tenure</h4>
          <p className="font-mono text-[14px] text-[#E5E7EB] opacity-70">
            {new Date(activeLease.startDate).toLocaleDateString()}
          </p>
        </div>
        <div className="space-y-1">
          <h4 className="text-[10px] text-[#9CA3AF] uppercase tracking-widest font-bold">Baseline Fiscal Contract</h4>
          <p className="font-mono text-[14px] text-[#E5E7EB] tabular-nums">
            ${Number(activeLease.rentAmount || 0).toLocaleString(undefined, {minimumFractionDigits:2})}
          </p>
        </div>

        <form action={moveOutFormAction} className="pt-8 border-t border-[#1F2937]">
          <input type="hidden" name="unitId" value={activeUnit.id} />
          <input type="hidden" name="leaseId" value={activeLease.id} />
          <input type="hidden" name="tenantId" value={activeLease.tenantId} />
          <p className="text-[11px] text-destructive font-mono mb-4 opacity-50">// CRITICAL OPERATION</p>
          <button 
            type="submit"
            disabled={isMoveOutPending}
            className="w-full border border-destructive/20 text-destructive bg-destructive/5 h-12 text-[11px] font-bold uppercase tracking-widest hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            {isMoveOutPending ? '[ EXECUTING... ]' : '[ ANNUL LEASE ]'}
          </button>
        </form>
      </div>
    );
  }

  // Ingestion State Rendering
  return (
    <div className="space-y-8">
      <div className="flex bg-[#1A1A24] border border-[#1F2937] p-1">
         <button 
           onClick={() => setFlowType('NEW')}
           className={cn(
             "flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-all",
             flowType === 'NEW' ? "bg-white/10 text-white" : "text-[#9CA3AF] hover:text-[#E5E7EB]"
           )}
         >
           [ NEW ONBOARDING ]
         </button>
         <button 
           onClick={() => setFlowType('EXISTING')}
           className={cn(
             "flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-all",
             flowType === 'EXISTING' ? "bg-white/10 text-white" : "text-[#9CA3AF] hover:text-[#E5E7EB]"
           )}
         >
           [ EXISTING TENANT ]
         </button>
      </div>

      <form action={formAction} className="space-y-6">
        <input type="hidden" name="unitId" value={activeUnit.id} />
        <input type="hidden" name="flowType" value={flowType} />
        
        {flowType === 'EXISTING' ? (
          <div className="space-y-1">
            <label className={labelClass}>Registry Select</label>
            <select name="tenantId" required className={cn(inputClass, "appearance-none cursor-pointer")}>
              <option value="">SELECT OCCUPANT</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id} className="bg-[#12121A] text-white">
                  {t.name} [{t.nationalId || 'GUEST'}]
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <label className={labelClass}>Legal Entity Name</label>
              <input name="tenantName" required disabled={isPending} className={inputClass} placeholder="JOHN DOE" />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className={labelClass}>Electronic Mail</label>
                <input name="email" type="email" disabled={isPending} className={inputClass} placeholder="JD@DOMAIN.COM" />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Telephone Line</label>
                <input name="phone" disabled={isPending} className={inputClass} placeholder="000-000-0000" />
              </div>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>State Identifier (SSN/ID)</label>
              <input name="nationalId" required disabled={isPending} className={inputClass} placeholder="000-00-0000" />
            </div>
          </>
        )}

        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#1F2937]">
          <div className="space-y-1">
            <label className={labelClass}>Contractual Rent ($)</label>
            <input 
              name="rentAmount" 
              type="number" 
              required 
              defaultValue={Number(activeUnit.marketRent || 0)} 
              disabled={isPending}
              className={cn(inputClass, "tabular-nums")} 
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Collateral Payload ($)</label>
            <input 
              name="depositAmount" 
              type="number" 
              required 
              defaultValue={0} 
              disabled={isPending}
              className={cn(inputClass, "tabular-nums")} 
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass}>Initialization Date</label>
          <input 
            name="startDate" 
            type="date" 
            required 
            defaultValue={new Date().toISOString().split('T')[0]} 
            disabled={isPending}
            className={cn(inputClass, "uppercase [color-scheme:dark]")} 
          />
        </div>

        <div className="pt-8 flex flex-col gap-4">
          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#E5E7EB] text-[#12121A] h-12 text-[11px] font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50"
          >
            {isPending ? '[ PROCESSING INGESTION... ]' : '[ EXECUTE INGESTION ]'}
          </button>
        </div>
      </form>
    </div>
  );
}
