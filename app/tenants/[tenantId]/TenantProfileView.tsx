'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PaymentDrawer from '@/components/PaymentDrawer'
import { Landmark, User, Calendar, Home, DollarSign, ArrowRight, ListChecks, Plus, Trash2 } from 'lucide-react'
import { updateTenantDetails, processMoveOut } from '@/actions/tenant-lifecycle.actions'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const tenantSchema = z.object({
  name: z.string().min(2, "Required")
})

type TenantForm = z.infer<typeof tenantSchema>

interface TenantProfileViewProps {
  tenant: { id: string; name: string };
  activeLease: {
    id: string;
    unitId: string;
    unitNumber: string;
    rentAmount: number;
    startDate: Date;
    endDate: Date;
  } | null;
  charges: any[];
}

export default function TenantProfileView({ tenant, activeLease, charges }: TenantProfileViewProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMoveOutModalOpen, setIsMoveOutModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { register, handleSubmit } = useForm<TenantForm>({
    resolver: zodResolver(tenantSchema),
    defaultValues: { name: tenant.name }
  });

  const onEditTenant = async (data: TenantForm) => {
    setIsSubmitting(true);
    const result = await updateTenantDetails(tenant.id, data);
    setIsSubmitting(false);
    if (result.success) {
      setIsEditModalOpen(false);
    } else {
      alert(result.message);
    }
  };

  const onMoveOut = async () => {
    if (!activeLease) return;
    setIsSubmitting(true);
    const result = await processMoveOut(tenant.id, activeLease.id, activeLease.unitId);
    setIsSubmitting(false);
    if (result.success) {
      setIsMoveOutModalOpen(false);
      router.refresh();
    } else {
      alert(result.message);
    }
  };

  const totalBalance = charges.reduce((acc, c) => acc + (Number(c.amount) - Number(c.amountPaid)), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{tenant.name}</h1>
            <p className="text-slate-500 font-medium flex items-center mt-1">
              <Landmark className="w-4 h-4 mr-1.5 text-slate-400" /> Standard Tenancy Record
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="bg-white text-slate-600 border border-slate-200 font-bold px-5 py-3 rounded-xl hover:bg-slate-50 transition-all text-sm"
          >
            Edit Profile
          </button>
          {activeLease && (
            <button 
              onClick={() => setIsMoveOutModalOpen(true)}
              className="bg-red-50 text-red-600 border border-red-100 font-bold px-5 py-3 rounded-xl hover:bg-red-100 transition-all text-sm"
            >
              Move-Out Protocol
            </button>
          )}
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="group bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-100 transition-all flex items-center"
          >
            Receive Payment <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
             <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Portfolio Balance</p>
             <p className="text-4xl font-black tracking-tighter">${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
             <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center">
               <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Master Status</span>
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${totalBalance > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                 {totalBalance > 0 ? 'Delinquent' : 'Current'}
               </span>
             </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 mb-6 flex items-center tracking-tight">
              <Home className="w-4 h-4 mr-2 text-slate-400" /> Active Lease Details
            </h4>
            {activeLease ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Unit Reference</span>
                  <span className="font-bold text-slate-900">{activeLease.unitNumber}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Monthly Rent</span>
                  <span className="font-bold text-slate-900">${activeLease.rentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-50 border-dashed">
                  <span className="text-slate-500">Commencement</span>
                  <span className="font-medium text-slate-900">{new Date(activeLease.startDate).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm italic text-slate-400">No active leases recorded.</p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-900 flex items-center tracking-tight">
                 <ListChecks className="w-5 h-5 mr-2 text-indigo-600" /> Outstanding Fiscal Engagements
               </h3>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Counts: {charges.length}</span>
            </div>
            <div className="divide-y divide-slate-100">
               {charges.length === 0 ? (
                 <div className="p-12 text-center">
                    <p className="text-slate-400 italic">No charges awaiting liquidation.</p>
                 </div>
               ) : (
                 charges.map((c) => (
                   <div key={c.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                       <div className="bg-slate-100 h-10 w-10 rounded-lg flex items-center justify-center text-slate-500">
                         <DollarSign className="w-5 h-5" />
                       </div>
                       <div>
                         <p className="font-bold text-slate-900 text-sm uppercase tracking-tight">{c.type}</p>
                         <div className="flex items-center text-xs text-slate-400 mt-0.5">
                           <Calendar className="w-3.5 h-3.5 mr-1" /> Due {new Date(c.dueDate).toLocaleDateString()}
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-black text-slate-900 tracking-tighter">${(Number(c.amount) - Number(c.amountPaid)).toLocaleString()}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Residual Debt</p>
                     </div>
                   </div>
                 ))
               )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">Override Identity</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors focus:outline-none">
                  <Plus className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onEditTenant)} className="p-8 space-y-6">
                 <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Official Full Name</label>
                   <input {...register('name')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-lg font-bold outline-none focus:border-slate-900 transition-all" />
                 </div>
                 <button disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-slate-800 disabled:opacity-50 transition-all uppercase tracking-widest text-sm">
                    {isSubmitting ? 'Syncing...' : 'Update Registry entry'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {isMoveOutModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
               <div className="p-10 text-center">
                  <div className="bg-red-50 text-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <Trash2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tighter">Decommission Tenancy?</h2>
                  <p className="text-slate-500 font-medium mb-10 leading-relaxed px-4">
                    This protocol will terminate the active lease for <span className="font-bold text-slate-900">{tenant.name}</span> and return Unit {activeLease?.unitNumber} to the vacancy registry.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={onMoveOut}
                      disabled={isSubmitting}
                      className="w-full bg-red-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-red-700 transition-all disabled:opacity-50 uppercase tracking-widest text-sm"
                    >
                      {isSubmitting ? 'Syncing...' : 'Initiate Move-Out Protocol'}
                    </button>
                    <button onClick={() => setIsMoveOutModalOpen(false)} className="w-full text-slate-400 font-bold uppercase tracking-widest text-[10px] py-4">
                      Abort Protocol
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
