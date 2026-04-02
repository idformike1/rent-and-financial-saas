'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PaymentDrawer from '@/components/PaymentDrawer'
import { Landmark, User, Calendar, Home, DollarSign, ArrowRight, ListChecks, Plus, Trash2, Mail, Phone, ShieldCheck, AlertTriangle, Layers, XCircle } from 'lucide-react'
import { updateTenantDetails, processMoveOut, softDeleteTenant, addAdditionalLease } from '@/actions/tenant-lifecycle.actions'
import { getAvailableUnits } from '@/actions/unit.actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from '@/lib/toast'

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

interface TenantProfileViewProps {
  tenant: { 
    id: string; 
    name: string; 
    email?: string; 
    phone?: string; 
    nationalId?: string;
    isDeleted: boolean;
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
}

export default function TenantProfileView({ tenant, activeLeases, charges }: TenantProfileViewProps) {
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
      rentAmount: 1200,
      depositAmount: 1200,
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
      setIsSubmitting(true);
      setIsSubmitting(false);
    }
  };

  const totalBalance = charges.reduce((acc, c) => acc + (Number(c.amount) - Number(c.amountPaid)), 0);

  return (
    <div className={`max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 ${tenant.isDeleted ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      
      {tenant.isDeleted && (
        <div className="bg-red-900 text-white p-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs border-4 border-red-950 shadow-2xl">
          <XCircle className="w-5 h-5 animate-pulse" /> Protocol Notice: This record has been Soft-Deleted (LOCKED)
        </div>
      )}

      {/* Enterprise Header Card */}
      <div className="bg-white border-4 border-slate-900 rounded-3xl shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center relative shadow-xl">
             <User className="w-10 h-10" />
             {tenant.isDeleted && <div className="absolute -top-2 -right-2 bg-red-600 text-[8px] font-black p-1 rounded border-2 border-white">DELETED</div>}
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{tenant.name}</h1>
            <div className="flex flex-wrap gap-4 mt-3">
              {tenant.email && <span className="text-[10px] font-bold text-slate-500 flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100"><Mail className="w-3 h-3 mr-1" /> {tenant.email}</span>}
              {tenant.phone && <span className="text-[10px] font-bold text-slate-500 flex items-center bg-slate-50 px-2 py-1 rounded border border-slate-100"><Phone className="w-3 h-3 mr-1" /> {tenant.phone}</span>}
              {tenant.nationalId && <span className="text-[10px] font-bold text-indigo-600 flex items-center bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase tracking-widest"><ShieldCheck className="w-3 h-3 mr-1" /> ID: {tenant.nationalId}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
           {!tenant.isDeleted && (
             <>
               <button onClick={() => setIsEditModalOpen(true)} className="bg-white text-slate-900 border-2 border-slate-900 font-black px-6 py-3 rounded-xl hover:bg-slate-50 transition-all text-sm uppercase tracking-tighter shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                 Edit Identity
               </button>
               <button onClick={() => setIsDeleteModalOpen(true)} className="bg-red-50 text-red-700 border-2 border-red-700 font-black px-6 py-3 rounded-xl hover:bg-red-100 transition-all text-sm uppercase tracking-tighter">
                 Purge Record
               </button>
             </>
           )}
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="group bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-4 rounded-2xl shadow-[6px_6px_0px_0px_rgba(49,46,129,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center uppercase italic tracking-tighter text-lg"
          >
            Liquidate Debt <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Balanced Ledger Card */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
             <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/40 transition-all duration-700" />
             <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-[10px] mb-4">Cumulative Liability</p>
             <p className="text-5xl font-black tracking-tighter italic">${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
             <div className="mt-10 pt-6 border-t border-slate-800 flex justify-between items-center">
               <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Master Ledger State</span>
               <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border-2 shadow-sm ${totalBalance > 0 ? 'bg-amber-900/20 text-amber-500 border-amber-900' : 'bg-green-900/20 text-green-500 border-green-900'}`}>
                 {totalBalance > 0 ? 'Delinquent' : 'Fully Cleared'}
               </span>
             </div>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center">
                <Layers className="w-4 h-4 mr-2 text-indigo-500" /> Asset Portfolio
              </h4>
              {!tenant.isDeleted && (
                <button onClick={() => setIsAddLeaseModalOpen(true)} className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {activeLeases.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase italic">No Active Assets</p>
                </div>
              ) : (
                activeLeases.map(lease => (
                  <div key={lease.id} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-100 relative group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-lg font-black text-slate-900 italic uppercase">Unit {lease.unitNumber}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {lease.isPrimary ? 'Primary Subscription' : 'Secondary Expansion'}
                        </p>
                      </div>
                      {!tenant.isDeleted && (
                        <button 
                          onClick={() => setIsMoveOutModalOpen({ leaseId: lease.id, unitId: lease.unitId, unitNumber: lease.unitNumber })}
                          className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="text-xl font-black text-slate-900 tracking-tighter">${lease.rentAmount.toLocaleString()}<span className="text-[10px] text-slate-400 lowercase ml-1">/mo</span></p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Until {new Date(lease.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Engagement Ledger */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-8 py-7 border-b-2 border-slate-50 flex justify-between items-center bg-slate-50/50">
               <h3 className="text-lg font-black text-slate-900 flex items-center tracking-tighter uppercase italic">
                 <ListChecks className="w-6 h-6 mr-3 text-indigo-600" /> Fiscal Engagements
               </h3>
               <div className="flex items-center gap-2">
                 <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Audited Record</span>
               </div>
            </div>
            <div className="divide-y-2 divide-slate-50">
               {charges.length === 0 ? (
                 <div className="p-20 text-center">
                    <AlertTriangle className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-300 font-bold uppercase italic tracking-widest">Master Ledger is currently balanced.</p>
                 </div>
               ) : (
                 charges.map((c) => (
                   <div key={c.id} className="p-8 flex justify-between items-center hover:bg-slate-50/50 transition-all group">
                     <div className="flex items-center gap-6">
                       <div className="bg-slate-900 h-14 w-14 rounded-2xl flex items-center justify-center text-indigo-400 shadow-lg group-hover:scale-110 transition-transform">
                         <DollarSign className="w-7 h-7" />
                       </div>
                       <div>
                         <p className="font-black text-slate-900 text-lg uppercase italic tracking-tighter">{c.type}</p>
                         <div className="flex items-center text-[10px] text-slate-400 font-black uppercase mt-1 tracking-widest">
                           <Calendar className="w-4 h-4 mr-1.5 text-indigo-400" /> Maturity: {new Date(c.dueDate).toLocaleDateString()}
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-3xl font-black text-slate-900 tracking-tighter italic">${(Number(c.amount) - Number(c.amountPaid)).toLocaleString()}</p>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Audit Residual</p>
                     </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Protocols (Modals) */}
      
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border-4 border-slate-900 animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b-2 border-slate-100 bg-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Override Identity</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Registry Mutation</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="bg-slate-900 text-white p-2 rounded-full hover:rotate-90 transition-all">
                  <Plus className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onEditTenant)} className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Legal Aggregate Name</label>
                     <input {...register('name')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-xl font-black italic outline-none focus:border-slate-900 transition-all" />
                     {editErrors.name && <p className="text-red-500 text-[10px] mt-2 font-black uppercase">{editErrors.name.message}</p>}
                   </div>
                   <div className="col-span-2 md:col-span-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Electronic Mail</label>
                     <input {...register('email')} placeholder="tenant@enterprise.com" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-slate-900 transition-all" />
                   </div>
                   <div className="col-span-2 md:col-span-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Telephonic Contact</label>
                     <input {...register('phone')} placeholder="+1 (555) 000-0000" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-slate-900 transition-all" />
                   </div>
                   <div className="col-span-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Government/National Identifier</label>
                     <input {...register('nationalId')} placeholder="SSN / Passport / ID" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-slate-900 transition-all uppercase" />
                   </div>
                 </div>
                 <button disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                    {isSubmitting ? 'Mutating Database...' : 'Commit Changes to Registry'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {isAddLeaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border-4 border-indigo-600 animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b-2 border-slate-100 bg-indigo-50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-indigo-900 uppercase italic tracking-tighter">Asset Expansion</h2>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Multi-Unit Logical Bridge</p>
                </div>
                <button onClick={() => setIsAddLeaseModalOpen(false)} className="bg-indigo-600 text-white p-2 rounded-full hover:rotate-90 transition-all">
                  <Plus className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleLeaseSubmit(onAddLease)} className="p-10 space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Target Asset (Vacant/Operational)</label>
                    <select {...regLease('unitId')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer">
                      <option value="">-- Deploy to Unit --</option>
                      {availableUnits.map(u => (
                        <option key={u.id} value={u.id}>Unit {u.unitNumber} ({u.type})</option>
                      ))}
                    </select>
                    {leaseErrors.unitId && <p className="text-red-500 text-[10px] mt-2 font-black uppercase">{leaseErrors.unitId.message}</p>}
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Expansion Monthly Rent</label>
                      <input type="number" {...regLease('rentAmount', {valueAsNumber: true})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Expansion Security Deposit</label>
                      <input type="number" {...regLease('depositAmount', {valueAsNumber: true})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all" />
                    </div>
                    <div className="col-span-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Expansion Commencement Date</label>
                       <input type="date" {...regLease('startDate')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold outline-none focus:border-indigo-600 transition-all" />
                    </div>
                 </div>
                 <button disabled={isSubmitting} className="w-full bg-indigo-600 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-indigo-700 disabled:opacity-50 transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                    {isSubmitting ? 'Deploying...' : 'Provision Additional Unit'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border-4 border-red-900">
               <div className="p-12 text-center">
                  <div className="bg-red-50 text-red-600 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border-4 border-red-100 shadow-xl">
                    <Trash2 className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Protocol Breach Warning</h2>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
                    Executing <span className="font-bold text-red-600">SOFT-DELETE Protocol #4</span>. This record will be archived for fiscal eternity. All active expansion units will be terminated immediately. <br/> <span className="text-xs font-black text-red-500 mt-4 block">THIS ACTION IS IRREVERSIBLE.</span>
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={onDeleteTenant}
                      disabled={isSubmitting}
                      className="w-full bg-red-600 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-red-700 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                      {isSubmitting ? 'Archiving...' : 'Execute Purge Protocol'}
                    </button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="w-full text-slate-400 font-black uppercase tracking-widest text-[10px] py-4 hover:text-slate-900 transition-colors">
                      Abort Protocol
                    </button>
                  </div>
               </div>
            </div>
        </div>
      )}

      {isMoveOutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border-4 border-slate-900">
               <div className="p-10 text-center">
                  <div className="bg-amber-50 text-amber-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8 border-2 border-amber-100">
                    <Home className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter uppercase italic">Decommission Unit {isMoveOutModalOpen.unitNumber}?</h2>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4 text-sm">
                    This protocol will terminate the lease specific to <span className="font-bold text-slate-900">Unit {isMoveOutModalOpen.unitNumber}</span>. Any other expansion units held by the tenant will remain active.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={onMoveOut}
                      disabled={isSubmitting}
                      className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                      {isSubmitting ? 'Resetting Asset...' : 'Initiate Unit Vacancy'}
                    </button>
                    <button onClick={() => setIsMoveOutModalOpen(null)} className="w-full text-slate-400 font-bold uppercase tracking-widest text-[10px] py-4">
                      Maintain Occupation
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
