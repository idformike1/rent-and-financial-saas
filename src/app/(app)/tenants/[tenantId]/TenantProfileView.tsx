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
    <div className={cn("max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500", tenant.isDeleted && "opacity-60")}>
      
      {tenant.isDeleted && (
        <Badge variant="danger" className="w-full text-center py-2 h-10 flex justify-center">
          <AlertCircle className="w-4 h-4 mr-2" /> RECORD DECOMMISSIONED
        </Badge>
      )}

      {/* UNIVERSAL MERCURY HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-[28px] font-[380] text-foreground tracking-tight leading-none">
            {tenant.name}
          </h1>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-[13px] text-muted-foreground flex items-center bg-muted/30 border border-border px-3 py-1 rounded-[4px]"><Mail className="w-3 h-3 mr-2" /> {tenant.email || 'N/A'}</span>
            <span className="text-[13px] text-muted-foreground flex items-center bg-muted/30 border border-border px-3 py-1 rounded-[4px]"><Phone className="w-3 h-3 mr-2" /> {tenant.phone || 'N/A'}</span>
            <Badge variant="default" className="bg-muted/30">ID: {tenant.nationalId || 'UNVERIFIED'}</Badge>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {!tenant.isDeleted && (
             <>
               <Button type="button" variant="primary" onClick={onReconcileCredits} disabled={isReconciling}>
                  {isReconciling ? 'RECONCILING...' : 'Settle Balance'}
               </Button>
               <Button type="button" variant="secondary" disabled={false} onClick={() => setIsDrawerOpen(true)}>
                  Record Payment
               </Button>
               <Button type="button" variant="ghost" disabled={false} onClick={() => setIsEditModalOpen(true)}>
                  Edit Profile
               </Button>
             </>
           )}
        </div>
      </div>

      {/* STEP 3.2: THE STRIP-CHART */}
      <div className="space-y-6">
         <div className="flex justify-between items-end">
            <h3 className="text-[10px] text-muted-foreground   flex items-center gap-3">
               <Activity className="w-4 h-4 text-brand" /> 12-Month Behavioral Payment DNA
            </h3>
            <div className="flex gap-4 text-[8px] text-muted-foreground ">
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-[6px] bg-[var(--primary)]" /> Compliant</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-[6px] bg-amber-500" /> Arrears</div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-[6px] bg-rose-500" /> Defaults</div>
            </div>
         </div>
         <div className="bg-background border border-border p-6 rounded-[8px] grid grid-cols-6 lg:grid-cols-12 gap-4">
            {tenant.stripChart.map((m, idx) => (
               <div key={idx} className="space-y-4 text-center">
                  <div className={cn(
                    "h-20 rounded-[8px] border transition-all flex items-center justify-center relative overflow-hidden group",
                    m.status === 'GREEN' ? "bg-[var(--primary)]/10 border-[var(--primary)]/30" :
                    m.status === 'YELLOW' ? "bg-amber-500/10 border-amber-500/30" :
                    m.status === 'RED' ? "bg-rose-500/10 border-rose-500/30" :
                    "bg-muted/50 border-border opacity-20"
                  )}>
                     {m.status === 'GREEN' && <CheckCircle2 className="w-5 h-5 text-[var(--primary)] opacity-40" />}
                     {m.status === 'YELLOW' && <Activity className="w-5 h-5 text-amber-500 opacity-40" />}
                     {m.status === 'RED' && <XCircle className="w-5 h-5 text-rose-500 opacity-40" />}
                     <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-muted-foreground ">{m.label}</p>
               </div>
            ))}
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* CORE PORTFOLIO */}
        <div className="md:col-span-4 space-y-8">
           <div className="bg-card border border-border rounded-[8px] p-6 relative overflow-hidden group">
              <div className="absolute -right-12 -top-6 w-40 h-40 bg-brand/10 rounded-[6px] blur-[60px] group-hover:bg-brand/20 transition-all duration-700" />
              <p className="text-muted-foreground   text-[10px] mb-6">Aggregate Liability</p>
              <div className="text-display font-weight-display text-foreground font-finance tabular-nums leading-none">
                 ${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
              </div>
              <div className="mt-12 pt-8 border-t border-border flex justify-between items-center">
                 <span className="text-muted-foreground text-[10px]  ">System Status</span>
                 <span className={cn(
                   "px-6 py-2 rounded-[6px] text-[10px]   border transition-colors",
                   totalBalance > 0 ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
                 )}>
                   {totalBalance > 0 ? 'DELINQUENT_RECAP' : 'FULLY_COLLATERIZED'}
                 </span>
              </div>
           </div>

           <div className="bg-background border border-border rounded-[8px] p-6">
              <div className="flex justify-between items-center mb-10">
                 <h4 className="text-[10px] text-muted-foreground   flex items-center">
                    <Layers className="w-4 h-4 mr-4 text-brand" /> Active Assets
                 </h4>
                 {!tenant.isDeleted && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setIsAddLeaseModalOpen(true)} 
                      className="p-3 bg-muted/50 border border-border"
                    >
                       <Plus className="w-5 h-5" />
                    </Button>
                 )}
              </div>
              
              <div className="space-y-6">
                 {activeLeases.length === 0 ? (
                    <div className="py-12 text-center bg-card/[0.02] rounded-[8px] border border-dashed border-border">
                       <p className="text-[10px] text-muted-foreground  leading-relaxed px-10">NO OPERATIONAL TENURE DETECTED IN CURRENT REALM</p>
                    </div>
                 ) : (
                    activeLeases.map(lease => (
                       <div key={lease.id} className="p-6 bg-muted/50 rounded-[8px] border border-border relative group hover:border-brand/40 transition-all">
                          <div className="flex justify-between items-start mb-6">
                             <div>
                                <p className="text-2xl text-foreground leading-none">{lease.unitNumber}</p>
                                <p className="text-[9px] text-muted-foreground  mt-3">
                                   {lease.isPrimary ? 'PRIMARY_TENURE' : 'EXTENSION_NODE'}
                                </p>
                             </div>
                             {!tenant.isDeleted && (
                                <Button 
                                   type="button"
                                   variant="ghost"
                                   onClick={() => setIsMoveOutModalOpen({ leaseId: lease.id, unitId: lease.unitId, unitNumber: lease.unitNumber })}
                                   className="h-auto p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 hover:bg-transparent"
                                >
                                   <XCircle className="w-5 h-5" />
                                </Button>
                             )}
                          </div>
                          <div className="flex justify-between items-end">
                             <p className="text-2xl text-foreground font-finance tabular-nums">${lease.rentAmount.toLocaleString()}<span className="text-[10px] text-muted-foreground lowercase ml-1">/fisc</span></p>
                             <div className="text-right">
                                <p className="text-[8px] text-muted-foreground ">Expiry_Window</p>
                                <p className="text-[9px] text-foreground  mt-1">{new Date(lease.endDate).toLocaleDateString()}</p>
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card rounded-[8px] w-full max-w-xl overflow-hidden border border-border relative">
               <Button 
                 type="button"
                 variant="ghost"
                 onClick={() => setIsEditModalOpen(false)} 
                 className="absolute top-6 right-12 text-muted-foreground hover:text-foreground h-10 w-10 p-0"
               >
                 <XCircle className="w-10 h-10" />
               </Button>
              <div className="p-6 border-b border-border bg-card/[0.02]">
                  <h2 className="text-display font-weight-display text-foreground  underline decoration-brand/50 decoration-4 underline-offset-8">Override Identity</h2>
                  <p className="text-[11px] text-muted-foreground   mt-6">Master Registry Forensic Mutation</p>
              </div>
              <form onSubmit={handleSubmit(onEditTenant)} className="p-6 space-y-10">
                 <div className="space-y-8">
                   <div>
                     <label className="text-[10px] text-muted-foreground   block mb-4 ml-6">Legal Aggregate Name</label>
                     <input {...register('name')} className="w-full bg-background border border-border rounded-[8px] p-6 text-2xl outline-none focus:border-brand transition-all text-foreground" />
                   </div>
                   <div className="grid grid-cols-2 gap-8">
                     <div>
                       <label className="text-[10px] text-muted-foreground   block mb-4 ml-6">Electronic Mail</label>
                       <input {...register('email')} className="w-full bg-background border border-border rounded-[8px] p-6 text-sm font-bold outline-none focus:border-brand transition-all text-foreground" />
                     </div>
                     <div>
                       <label className="text-[10px] text-muted-foreground   block mb-4 ml-6">Telephonic Line</label>
                       <input {...register('phone')} className="w-full bg-background border border-border rounded-[8px] p-6 text-sm font-bold outline-none focus:border-brand transition-all text-foreground" />
                     </div>
                   </div>
                   <div>
                     <label className="text-[10px] text-muted-foreground   block mb-4 ml-6">Structural Verification ID (SSN/Gov)</label>
                     <input {...register('nationalId')} className="w-full bg-background border border-border rounded-[8px] p-6 text-xl outline-none focus:border-brand transition-all text-foreground " />
                   </div>
                 </div>
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    className="w-full h-24 bg-brand text-foreground text-[12px]"
                  >
                     Commit Protocol Changes
                  </Button>
              </form>
           </div>
        </div>
      )}

      {isAddLeaseModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card rounded-[8px] w-full max-w-xl overflow-hidden border border-border relative">
               <Button 
                 type="button"
                 variant="ghost"
                 onClick={() => setIsAddLeaseModalOpen(false)} 
                 className="absolute top-6 right-12 text-muted-foreground hover:text-foreground h-10 w-10 p-0"
               >
                 <XCircle className="w-10 h-10" />
               </Button>
              <div className="p-6 border-b border-brand/20 bg-brand/5">
                  <h2 className="text-display font-weight-display text-foreground  leading-none">Asset Expansion</h2>
                  <p className="text-[11px] text-brand   mt-6">Multi-Unit Logical Bridge Protocol</p>
              </div>
              <form onSubmit={handleLeaseSubmit(onAddLease)} className="p-6 space-y-10">
                 <div>
                    <label className="text-[10px] text-muted-foreground   block mb-4 ml-6">Target Deployment Asset</label>
                    <select {...regLease('unitId')} className="w-full bg-background border border-border rounded-[8px] p-6 text-xl outline-none focus:border-brand transition-all appearance-none cursor-pointer text-foreground">
                      <option value="">-- Deploy to Node --</option>
                      {availableUnits.map(u => (<option key={u.id} value={u.id}>Unit {u.unitNumber} ({u.type})</option>))}
                    </select>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                      <label className="text-[10px] text-muted-foreground   block mb-4 ml-6">Monthly Fisc ($)</label>
                      <input type="number" {...regLease('rentAmount', {valueAsNumber: true})} className="w-full bg-background border border-border rounded-[8px] p-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground   block mb-4 ml-6">Collateral ($)</label>
                      <input type="number" {...regLease('depositAmount', {valueAsNumber: true})} className="w-full bg-background border border-border rounded-[8px] p-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all" />
                    </div>
                 </div>
                  <Button 
                    type="submit" 
                    isLoading={isSubmitting}
                    className="w-full h-24 bg-brand text-foreground text-[12px]"
                  >
                     Provision Expansion Unit
                  </Button>
              </form>
           </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card rounded-[8px] w-full max-w-lg overflow-hidden border border-rose-500/20 relative">
               <div className="p-6 text-center">
                  <div className="bg-rose-500/10 text-rose-500 rounded-[6px] w-32 h-32 flex items-center justify-center mx-auto mb-10 border border-rose-500/20">
                    <Trash2 className="w-14 h-14" />
                  </div>
                  <h2 className="text-display font-weight-display text-foreground mb-6  decoration-rose-500 decoration-4 underline underline-offset-8">Critical Purge Protocol</h2>
                  <p className="text-muted-foreground font-medium mb-12 leading-relaxed px-10 text-sm">
                    Initiating <span className="text-rose-500 ">Soft-Delete Phase 4</span>. This registry node will be sequestered into the immutable archive. Active unit occupancy will be terminated.
                  </p>
                   <div className="flex flex-col gap-4">
                    <Button 
                      type="button"
                      variant="danger"
                      onClick={onDeleteTenant} 
                      isLoading={isSubmitting}
                      className="w-full h-24 text-[11px] scale-105"
                    >
                      Confirm Final Purge
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setIsDeleteModalOpen(false)} 
                      className="w-full text-muted-foreground text-[8px] py-10 hover:text-foreground"
                    >
                      [Abort_Protocol]
                    </Button>
                  </div>
               </div>
            </div>
        </div>
      )}

      {isMoveOutModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-card rounded-[8px] w-full max-w-lg overflow-hidden border border-border relative">
               <div className="p-6 text-center">
                  <div className="bg-amber-500/10 text-amber-500 rounded-[6px] w-28 h-28 flex items-center justify-center mx-auto mb-10 border border-amber-500/20">
                    <Home className="w-12 h-12" />
                  </div>
                  <h2 className="text-display font-weight-display text-foreground mb-6 leading-none">Decommission Unit {isMoveOutModalOpen.unitNumber}?</h2>
                  <p className="text-muted-foreground font-medium mb-12 leading-relaxed px-10 text-sm">
                    Terminate lease specific to <span className="text-foreground ">Unit {isMoveOutModalOpen.unitNumber}</span>. Multi-unit nodes will remain operational.
                  </p>
                   <div className="flex flex-col gap-4">
                    <Button 
                      type="button"
                      variant="secondary"
                      onClick={onMoveOut} 
                      isLoading={isSubmitting}
                      className="w-full h-24 text-[11px]"
                    >
                      Execute Decommission
                    </Button>
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => setIsMoveOutModalOpen(null)} 
                      className="w-full text-muted-foreground text-[8px] py-8 hover:text-foreground"
                    >
                      Maintain Assignment
                    </Button>
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
    <span className={cn("px-4 py-1.5 rounded-[6px] text-[10px]  border-2", className)}>
      {children}
    </span>
  )
}
