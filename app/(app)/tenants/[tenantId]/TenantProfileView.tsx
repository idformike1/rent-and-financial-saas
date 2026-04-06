'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PaymentDrawer from '@/components/PaymentDrawer'
import { Landmark, User, Calendar, Home, DollarSign, ArrowRight, ListChecks, Plus, Trash2, Mail, Phone, ShieldCheck, AlertTriangle, Layers, XCircle, Activity, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateTenantDetails, processMoveOut, softDeleteTenant, addAdditionalLease, liquidateTenantDebt } from '@/actions/tenant.actions'
import { getAvailableUnits } from '@/actions/asset.actions'
import { useForm } from 'react-hook-form'
import { Card, Badge, Button } from '@/components/ui-finova'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

const tenantSchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  nationalId: z.string().optional().or(z.literal(''))
})

const addLeaseSchema = z.object({
  unitId: z.string().min(1, "Select a unit"),
  rentAmount: z.number().positive(),
  depositAmount: z.number().min(0),
  startDate: z.string()
})

type TenantForm = z.infer<typeof tenantSchema>
type AddLeaseForm = z.infer<typeof addLeaseSchema>

import LedgerTerminal from './LedgerTerminal'

interface TenantProfileViewProps {
  tenant: { 
    id: string; 
    name: string; 
    email?: string; 
    phone?: string; 
    nationalId?: string;
    isDeleted: boolean;
    integrityScore: number;
    stripChart: { label: string; status: 'GREEN' | 'YELLOW' | 'RED' | 'EMPTY' }[];
  };
  activeLeases: {
    id: string;
    unitId: string;
    unitNumber: string;
    rentAmount: number;
    startDate: Date;
    endDate: Date;
    isPrimary: boolean;
  }[];
  charges: any[];
  ledgerEntries: any[];
}

export default function TenantProfileView({ tenant, activeLeases, charges, ledgerEntries }: TenantProfileViewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddLeaseModalOpen, setIsAddLeaseModalOpen] = useState(false);
  const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState<{leaseId: string, unitId: string, unitNumber: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);
  
  const router = useRouter();

  const { register, handleSubmit, formState: { errors: editErrors } } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { 
      name: tenant.name,
      email: tenant.email || '',
      phone: tenant.phone || '',
      nationalId: tenant.nationalId || ''
    }
  });

  const { register: regLease, handleSubmit: handleLeaseSubmit, formState: { errors: leaseErrors } } = useForm<AddLeaseForm>({
    resolver: zodResolver(addLeaseSchema),
    defaultValues: {
      rentAmount: 0,
      depositAmount: 0,
      startDate: new Date().toISOString().split('T')[0]
    }
  });

  useEffect(() => {
    if (isAddLeaseModalOpen) {
      getAvailableUnits().then(setAvailableUnits);
    }
  }, [isAddLeaseModalOpen]);

  const onEditTenant = async (data: TenantForm) => {
    setIsSubmitting(true);
    try {
      const result = await updateTenantDetails(tenant.id, data);
      if (result.success) {
        toast.success("Identity Mutation Successful");
        setIsEditModalOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Identity mutation failed");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteTenant = async () => {
    setIsSubmitting(true);
    try {
      const result = await softDeleteTenant(tenant.id);
      if (result.success) {
        toast.success("Record Purged from Active Registry");
        router.push('/tenants');
      } else {
        toast.error(result.message || "Purge protocol failed");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onAddLease = async (data: AddLeaseForm) => {
    setIsSubmitting(true);
    try {
      const result = await addAdditionalLease({ ...data, tenantId: tenant.id });
      if (result.success) {
        toast.success("Asset Expansion Matrix Provisioned");
        setIsAddLeaseModalOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Asset expansion failed");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onMoveOut = async () => {
    if (!isMoveOutModalOpen) return;
    setIsSubmitting(true);
    try {
      const result = await processMoveOut(tenant.id, isMoveOutModalOpen.leaseId, isMoveOutModalOpen.unitId);
      if (result.success) {
        toast.success("Unit Decommissioned Successfully");
        setIsMoveOutModalOpen(null);
        router.refresh();
      } else {
        toast.error(result.message || "Decommission protocol failed");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isReconciling, setIsReconciling] = useState(false);

  const onReconcileCredits = async () => {
    setIsReconciling(true);
    try {
      const result = await liquidateTenantDebt(tenant.id);
      if (result.success) {
        toast.success("FIFO Reconciliation Matrix Synchronized");
        router.refresh();
      } else {
        toast.error(result.message || "Reconciliation failed");
      }
    } catch (error) {
       toast.error("Network synchronization failure");
    } finally {
       setIsReconciling(false);
    }
  };

  const totalBalance = charges.reduce((acc, c) => acc + (Number(c.amount) - Number(c.amountPaid)), 0);

  return (
    <div className={cn("max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500", tenant.isDeleted && "opacity-60")}>
      
      {tenant.isDeleted && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-3xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
          <AlertCircle className="w-5 h-5" /> Protocol Notice: Record Decommissioned
        </div>
      )}

      {/* STEP 3.1: INTEGRITY HUD HEADER */}
      <div className="bg-background border border-border rounded-[3rem] overflow-hidden p-12 flex flex-col lg:flex-row justify-between items-center gap-12 relative shadow-2xl">
         <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-transparent pointer-events-none" />
         
         <div className="flex items-center gap-10 relative z-10">
            <div className="h-28 w-28 rounded-[2rem] bg-brand text-foreground flex items-center justify-center shadow-[0_0_40px_rgba(var(--brand-rgb),0.3)] border-4 border-border">
               <User className="w-12 h-12" />
            </div>
            <div>
               <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">{tenant.name}</h1>
               <div className="flex flex-wrap gap-4 mt-6">
                  <span className="text-[10px] font-black text-slate-500 flex items-center bg-white/3 border border-white/5 px-5 py-2 rounded-3xl uppercase tracking-widest"><Mail className="w-3.5 h-3.5 mr-3 text-brand" /> {tenant.email || 'N/A'}</span>
                  <span className="text-[10px] font-black text-slate-500 flex items-center bg-white/3 border border-white/5 px-5 py-2 rounded-3xl uppercase tracking-widest"><Phone className="w-3.5 h-3.5 mr-3 text-brand" /> {tenant.phone || 'N/A'}</span>
                  <span className="text-[10px] font-black text-slate-500 flex items-center bg-white/3 border border-white/5 px-5 py-2 rounded-3xl uppercase tracking-[0.2em]"><ShieldCheck className="w-3.5 h-3.5 mr-3 text-brand" /> ID::{tenant.nationalId || 'UNVERIFIED'}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-12 relative z-10">
            <div className="text-center space-y-2">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Integrity Index</p>
               <div className={cn(
                 "text-6xl font-black italic tracking-tighter font-finance tabular-nums leading-none",
                 tenant.integrityScore >= 90 ? "text-[var(--primary)]" : tenant.integrityScore >= 70 ? "text-amber-500" : "text-rose-500"
               )}>
                 {tenant.integrityScore || 0}%
               </div>
            </div>
            <div className="h-20 w-px bg-white/5 hidden lg:block" />
            <div className="flex flex-col gap-6">
               {!tenant.isDeleted && (
                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={onReconcileCredits}
                      disabled={isReconciling}
                      className="bg-[var(--primary)] text-foreground font-black px-12 py-5 rounded-3xl shadow-[0_20px_40px_rgba(255,87,51,0.2)] hover:bg-[var(--primary)] active:scale-95 transition-all flex items-center uppercase italic tracking-widest text-[11px] h-20 min-w-[300px] justify-center disabled:opacity-50 font-mono"
                    >
                      {isReconciling ? '[ RECONCILING... ]' : (
                        <span className="flex items-center uppercase tracking-[0.2em] font-black">SETTLE BALANCE <ArrowRight className="w-5 h-5 ml-4" /></span>
                      )}
                    </button>
                    <button 
                      onClick={() => setIsDrawerOpen(true)}
                      className="bg-white/3 text-foreground border border-border px-8 py-4 rounded-xl hover:bg-white/5 transition-all flex items-center justify-center gap-3 uppercase font-black tracking-widest text-[9px] font-mono h-14"
                    >
                      <Plus className="w-4 h-4 text-[var(--primary)]" /> RECORD PAYMENT
                    </button>
                 </div>
               )}
               
               {!tenant.isDeleted && (
                 <button 
                    onClick={() => setIsEditModalOpen(true)} 
                    className="bg-transparent text-slate-500 border border-white/5 px-8 py-3 rounded-xl hover:text-foreground hover:border-border transition-all text-[9px] uppercase font-black tracking-[0.4em] font-mono h-12"
                 >
                    EDIT PROFILE
                 </button>
               )}
            </div>
         </div>
      </div>

      {/* STEP 3.2: THE STRIP-CHART */}
      <div className="space-y-6">
         <div className="flex justify-between items-end">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3 italic">
               <Activity className="w-4 h-4 text-brand" /> 12-Month Behavioral Payment DNA
            </h3>
            <div className="flex gap-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--primary)]" /> Compliant</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Arrears</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500" /> Defaults</div>
            </div>
         </div>
         <div className="bg-background border border-border p-10 rounded-[3rem] grid grid-cols-6 lg:grid-cols-12 gap-4">
            {tenant.stripChart.map((m, idx) => (
               <div key={idx} className="space-y-4 text-center">
                  <div className={cn(
                    "h-20 rounded-3xl border transition-all flex items-center justify-center relative overflow-hidden group",
                    m.status === 'GREEN' ? "bg-[var(--primary)]/10 border-[var(--primary)]/30" :
                    m.status === 'YELLOW' ? "bg-amber-500/10 border-amber-500/30" :
                    m.status === 'RED' ? "bg-rose-500/10 border-rose-500/30" :
                    "bg-white/3 border-white/5 opacity-20"
                  )}>
                     {m.status === 'GREEN' && <CheckCircle2 className="w-5 h-5 text-[var(--primary)] opacity-40" />}
                     {m.status === 'YELLOW' && <Activity className="w-5 h-5 text-amber-500 opacity-40" />}
                     {m.status === 'RED' && <XCircle className="w-5 h-5 text-rose-500 opacity-40" />}
                     <div className="absolute inset-0 bg-white/3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</p>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* CORE PORTFOLIO */}
        <div className="md:col-span-4 space-y-8">
           <div className="bg-slate-900 border border-border rounded-[3rem] p-10 relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-40 h-40 bg-brand/10 rounded-full blur-[60px] group-hover:bg-brand/20 transition-all duration-700" />
              <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-[10px] mb-6">Aggregate Liability</p>
              <div className="text-5xl font-black text-foreground tracking-tighter italic font-finance tabular-nums leading-none">
                 ${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="mt-12 pt-8 border-t border-white/5 flex justify-between items-center">
                 <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">System Status</span>
                 <span className={cn(
                   "px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase border transition-colors",
                   totalBalance > 0 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
                 )}>
                   {totalBalance > 0 ? 'DELINQUENT_RECAP' : 'FULLY_COLLATERIZED'}
                 </span>
              </div>
           </div>

           <div className="bg-background border border-border rounded-[3rem] p-10">
              <div className="flex justify-between items-center mb-10">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center italic">
                    <Layers className="w-4 h-4 mr-4 text-brand" /> Active Assets
                 </h4>
                 {!tenant.isDeleted && (
                    <button onClick={() => setIsAddLeaseModalOpen(true)} className="bg-white/3 text-foreground p-3 rounded-3xl hover:bg-white/5 transition-all border border-border shadow-lg">
                       <Plus className="w-5 h-5 font-black" />
                    </button>
                 )}
              </div>
              
              <div className="space-y-6">
                 {activeLeases.length === 0 ? (
                    <div className="py-12 text-center bg-card/[0.02] rounded-[2rem] border border-dashed border-border">
                       <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest leading-relaxed px-10">NO OPERATIONAL TENURE DETECTED IN CURRENT REALM</p>
                    </div>
                 ) : (
                    activeLeases.map(lease => (
                       <div key={lease.id} className="p-8 bg-white/3 rounded-[2rem] border border-white/5 relative group hover:border-brand/40 transition-all">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter leading-none">{lease.unitNumber}</p>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-3">
                                   {lease.isPrimary ? 'PRIMARY_TENURE' : 'EXTENSION_NODE'}
                                </p>
                             </div>
                             {!tenant.isDeleted && (
                                <button 
                                   onClick={() => setIsMoveOutModalOpen({ leaseId: lease.id, unitId: lease.unitId, unitNumber: lease.unitNumber })}
                                   className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-500 transition-all active:scale-90"
                                >
                                   <XCircle className="w-5 h-5" />
                                </button>
                             )}
                          </div>
                          <div className="flex justify-between items-end">
                             <p className="text-2xl font-black text-foreground tracking-tighter font-finance tabular-nums italic">${lease.rentAmount.toLocaleString()}<span className="text-[10px] text-slate-500 lowercase ml-1">/fisc</span></p>
                             <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Expiry_Window</p>
                                <p className="text-[9px] font-black text-foreground uppercase tracking-tighter mt-1">{new Date(lease.endDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* STEP 3.3: DUAL-LENS LEDGER TERMINAL */}
        <div className="md:col-span-8 space-y-8">
           <LedgerTerminal charges={charges} ledgerEntries={ledgerEntries} />
        </div>
      </div>

      {/* Protocols (Modals) */}
      
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/5 relative">
              <button onClick={() => setIsEditModalOpen(false)} className="absolute top-12 right-12 text-slate-500 hover:text-foreground transition-colors z-10"><XCircle className="w-10 h-10" /></button>
              <div className="p-12 border-b border-white/5 bg-card/[0.02]">
                  <h2 className="text-4xl font-black text-foreground uppercase italic tracking-tighter underline decoration-brand/50 decoration-4 underline-offset-8 font-mono">Override Identity</h2>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-6">Master Registry Forensic Mutation</p>
              </div>
              <form onSubmit={handleSubmit(onEditTenant)} className="p-16 space-y-10">
                 <div className="space-y-8">
                   <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 ml-6">Legal Aggregate Name</label>
                     <input {...register('name')} className="w-full bg-background border border-white/5 rounded-[2rem] p-8 text-2xl font-black italic outline-none focus:border-brand transition-all text-foreground font-mono" />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                     <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 ml-6">Electronic Mail</label>
                       <input {...register('email')} className="w-full bg-background border border-white/5 rounded-3xl p-6 text-sm font-bold outline-none focus:border-brand transition-all text-foreground" />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 ml-6">Telephonic Line</label>
                       <input {...register('phone')} className="w-full bg-background border border-white/5 rounded-3xl p-6 text-sm font-bold outline-none focus:border-brand transition-all text-foreground" />
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 ml-6">Structural Verification ID (SSN/Gov)</label>
                     <input {...register('nationalId')} className="w-full bg-background border border-white/5 rounded-3xl p-8 text-xl font-black outline-none focus:border-brand transition-all text-foreground uppercase tracking-widest font-mono" />
                   </div>
                 </div>
                 <button disabled={isSubmitting} className="w-full h-24 bg-brand text-foreground font-black rounded-3xl shadow-[0_30px_60px_rgba(var(--brand-rgb),0.2)] hover:scale-[1.02] active:scale-98 disabled:opacity-50 transition-all uppercase tracking-[0.3em] text-[12px]">
                    {isSubmitting ? 'SYNCING_RECON...' : 'Commit Protocol Changes'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {isAddLeaseModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-slate-900 rounded-[3.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-white/5 relative">
              <button onClick={() => setIsAddLeaseModalOpen(false)} className="absolute top-12 right-12 text-slate-500 hover:text-foreground transition-colors z-10"><XCircle className="w-10 h-10" /></button>
              <div className="p-12 border-b border-brand/20 bg-brand/5">
                  <h2 className="text-4xl font-black text-foreground uppercase italic tracking-tighter font-mono leading-none">Asset Expansion</h2>
                  <p className="text-[11px] font-black text-brand uppercase tracking-[0.4em] mt-6">Multi-Unit Logical Bridge Protocol</p>
              </div>
              <form onSubmit={handleLeaseSubmit(onAddLease)} className="p-16 space-y-10">
                 <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 ml-6">Target Deployment Asset</label>
                    <select {...regLease('unitId')} className="w-full bg-background border border-white/5 rounded-[2rem] p-8 text-xl font-black outline-none focus:border-brand transition-all appearance-none cursor-pointer text-foreground font-mono">
                      <option value="">-- Deploy to Node --</option>
                      {availableUnits.map(u => (<option key={u.id} value={u.id}>Unit {u.unitNumber} ({u.type})</option>))}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 ml-6">Monthly Fisc ($)</label>
                      <input type="number" {...regLease('rentAmount', {valueAsNumber: true})} className="w-full bg-background border border-white/5 rounded-3xl p-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 ml-6">Collateral ($)</label>
                      <input type="number" {...regLease('depositAmount', {valueAsNumber: true})} className="w-full bg-background border border-white/5 rounded-3xl p-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all" />
                    </div>
                 </div>
                 <button disabled={isSubmitting} className="w-full h-24 bg-brand text-foreground font-black rounded-3xl shadow-[0_30px_60px_rgba(var(--brand-rgb),0.2)] hover:scale-[1.02] active:scale-98 disabled:opacity-50 transition-all uppercase tracking-[0.3em] text-[12px]">
                    Provision Expansion Unit
                 </button>
              </form>
           </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-[4rem] shadow-2xl w-full max-w-lg overflow-hidden border border-rose-500/20 relative">
               <div className="p-16 text-center">
                  <div className="bg-rose-500/10 text-rose-500 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-10 border border-rose-500/20 shadow-2xl">
                    <Trash2 className="w-14 h-14" />
                  </div>
                  <h2 className="text-4xl font-black text-foreground mb-6 tracking-tighter uppercase italic font-mono decoration-rose-500 decoration-4 underline underline-offset-8">Critical Purge Protocol</h2>
                  <p className="text-slate-400 font-medium mb-12 leading-relaxed px-10 text-sm">
                    Initiating <span className="font-black text-rose-500 uppercase">Soft-Delete Phase 4</span>. This registry node will be sequestered into the immutable archive. Active unit occupancy will be terminated.
                  </p>
                  <div className="flex flex-col gap-4">
                    <button onClick={onDeleteTenant} disabled={isSubmitting} className="w-full h-24 bg-rose-600 text-foreground font-black rounded-[2.5rem] shadow-[0_30px_60px_rgba(244,63,94,0.3)] hover:bg-rose-700 transition-all disabled:opacity-50 uppercase tracking-[0.4em] text-[11px] scale-105">
                      Confirm Final Purge
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="w-full text-slate-500 font-black uppercase tracking-[0.5em] text-[8px] py-10 hover:text-foreground transition-colors">
                      [Abort_Protocol]
                    </button>
                  </div>
               </div>
            </div>
        </div>
      )}

      {isMoveOutModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-slate-900 rounded-[4rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/5 relative">
               <div className="p-16 text-center">
                  <div className="bg-amber-500/10 text-amber-500 rounded-full w-28 h-28 flex items-center justify-center mx-auto mb-10 border border-amber-500/20">
                    <Home className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black text-foreground mb-6 tracking-tighter uppercase italic leading-none">Decommission Unit {isMoveOutModalOpen.unitNumber}?</h2>
                  <p className="text-slate-500 font-medium mb-12 leading-relaxed px-10 text-sm">
                    Terminate lease specific to <span className="font-black text-foreground uppercase italic">Unit {isMoveOutModalOpen.unitNumber}</span>. Multi-unit nodes will remain operational.
                  </p>
                  <div className="flex flex-col gap-4">
                    <button onClick={onMoveOut} disabled={isSubmitting} className="w-full h-24 bg-card text-foreground font-black rounded-[2.5rem] shadow-[0_30px_60px_rgba(255,255,255,0.1)] hover:bg-slate-100 transition-all active:scale-95 uppercase tracking-[0.4em] text-[11px]">
                      Execute Decommission
                    </button>
                    <button onClick={() => setIsMoveOutModalOpen(null)} className="w-full text-slate-400 font-black uppercase tracking-[0.5em] text-[8px] py-8 hover:text-foreground transition-colors">
                      Maintain Assignment
                    </button>
                  </div>
               </div>
            </div>
        </div>
      )}

      <PaymentDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        tenant={tenant}
        activeCharges={charges}
        onSuccess={() => {
          setIsDrawerOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function ForensicBadge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border-2", className)}>
      {children}
    </span>
  )
}
