'use client'

import { useState } from 'react'
import { Plus, Settings, CheckCircle2, AlertTriangle, Hammer, Trash2 } from 'lucide-react'
import { createUnit, updateUnitStatus } from '@/actions/unit-mgmt.actions'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MaintenanceStatus } from '@prisma/client'

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Required"),
  type: z.string().min(2, "e.g. Apartment, Storage, Studio")
})

type UnitForm = z.infer<typeof unitSchema>

export default function PropertiesClient({ initialUnits }: { initialUnits: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm<UnitForm>({
    resolver: zodResolver(unitSchema)
  });

  const onAddUnit = async (data: UnitForm) => {
    setIsSubmitting(true);
    const result = await createUnit({ ...data, propertyId: 'PROP-MASTER-001' });
    setIsSubmitting(false);
    if (result.success) {
      reset();
      setIsAddModalOpen(false);
    } else {
      alert(result.message);
    }
  };

  const onStatusChange = async (unitId: string, status: MaintenanceStatus) => {
    setIsSubmitting(true);
    const result = await updateUnitStatus(unitId, status);
    setIsSubmitting(false);
    if (result.success) {
      setEditingUnit(null);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col px-4 sm:px-0">
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-100 flex items-center hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5 mr-4" /> Materialize New Unit
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 overflow-y-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Unit Mapping</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Classification</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Deployment State</th>
              <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Occupancy Mapping</th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Integrity Control</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {initialUnits.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-6 whitespace-nowrap">
                  <div className="text-xl font-black text-slate-900 tracking-tighter">{u.unitNumber}</div>
                </td>
                <td className="px-6 py-6 whitespace-nowrap">
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{u.type}</span>
                </td>
                <td className="px-6 py-6 whitespace-nowrap">
                  <div className="flex items-center">
                    {u.maintenanceStatus === 'OPERATIONAL' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    ) : u.maintenanceStatus === 'UNDER_REPAIR' ? (
                      <Hammer className="w-4 h-4 text-amber-500 mr-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${u.maintenanceStatus === 'OPERATIONAL' ? 'text-green-600' : 'text-slate-600'}`}>
                      {u.maintenanceStatus}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-6 whitespace-nowrap">
                   <div className="flex items-center space-x-2">
                     <div className={`w-2 h-2 rounded-full ${u.isOccupied ? 'bg-indigo-600 animate-pulse' : 'bg-slate-200'}`} />
                     <span className={`text-sm font-bold ${u.isOccupied ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {u.activeTenant || 'Material Vacuum (Vacant)'}
                     </span>
                   </div>
                </td>
                <td className="px-6 py-6 whitespace-nowrap text-right">
                  <button 
                    onClick={() => setEditingUnit(u)}
                    className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Unit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Materialize Unit</h2>
               <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <Plus className="w-6 h-6 rotate-45" />
               </button>
             </div>
             <form onSubmit={handleSubmit(onAddUnit)} className="p-8 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Unit Reference Number</label>
                  <input {...register('unitNumber')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-lg font-bold outline-none focus:border-slate-900 focus:bg-white transition-all" placeholder="e.g. A-42" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Asset Classification</label>
                  <input {...register('type')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl p-4 text-lg font-bold outline-none focus:border-slate-900 focus:bg-white transition-all" placeholder="e.g. Standard Apartment" />
                </div>
                <button disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-slate-200 uppercase tracking-widest text-sm hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98] transition-all">
                   {isSubmitting ? 'Syncing...' : 'Complete Materialization'}
                </button>
             </form>
           </div>
        </div>
      )}

      {/* Edit/Status Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter">Unit {editingUnit.unitNumber}</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Protocol Overrides</p>
                  </div>
                  <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-white transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
               </div>
               <div className="p-8 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Select New Hardware Status:</p>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, 'OPERATIONAL')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 border-2 border-transparent hover:border-green-500 rounded-2xl transition-all"
                  >
                    <div className="flex items-center text-slate-900 font-bold">
                       <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" /> OPERATIONAL
                    </div>
                  </button>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, 'UNDER_REPAIR')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 border-2 border-transparent hover:border-amber-500 rounded-2xl transition-all"
                  >
                    <div className="flex items-center text-slate-900 font-bold">
                       <Hammer className="w-5 h-5 text-amber-500 mr-3" /> UNDER REPAIR
                    </div>
                  </button>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, 'DECOMMISSIONED')}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 border-2 border-transparent hover:border-red-500 rounded-2xl transition-all"
                  >
                    <div className="flex items-center text-slate-900 font-bold text-red-600">
                       <AlertTriangle className="w-5 h-5 text-red-500 mr-3" /> DECOMMISSIONED
                    </div>
                  </button>
               </div>
               <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">STATE CHANGES WILL BE PERMANENTLY RECORDED IN THE ENGINE AUDIT TRAIL.</p>
               </div>
            </div>
        </div>
      )}
    </div>
  )
}
