'use client'

import { useState } from 'react'
import { Plus, Settings, CheckCircle2, AlertTriangle, Hammer, Hash, LayoutGrid, Building2, Store, MoveHorizontal } from 'lucide-react'
import { createUnit, updateUnitStatus } from '@/actions/unit-mgmt.actions'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MaintenanceStatus } from '@prisma/client'
import { toast } from '@/lib/toast'

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Required"),
  type: z.string().min(2, "e.g. Standard Apartment"),
  category: z.string().min(1, "Required")
})

type UnitForm = z.infer<typeof unitSchema>

export default function UnitManagementClient({ initialUnits, propertyId }: { initialUnits: any[], propertyId: string }) {
  const [units, setUnits] = useState(initialUnits);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset } = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      category: 'FLAT'
    }
  });

  const filteredUnits = units.filter(u => filter === 'ALL' || u.category === filter);

  const onAddUnit = async (data: UnitForm) => {
    setIsSubmitting(true);
    try {
      const result = await createUnit({ ...data, propertyId });
      if (result.success) {
        toast.success("Asset Materialized Successfully");
        if (result.data) {
          setUnits(prev => [...prev, result.data]);
        } else {
          window.location.reload();
        }
        reset();
        setIsAddModalOpen(false);
      } else {
        toast.error(result.message || "Failed to materialize asset");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onStatusChange = async (unitId: string, status: MaintenanceStatus) => {
    setIsSubmitting(true);
    try {
      const result = await updateUnitStatus(unitId, status);
      if (result.success) {
        toast.success(`Asset Status Updated to ${status}`);
        setUnits(prev => prev.map(u => u.id === unitId ? { ...u, maintenanceStatus: status } : u));
        setEditingUnit(null);
      } else {
        toast.error(result.message || "Status update failed");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <div className="flex gap-4">
           {['ALL', 'FLAT', 'STORE', 'SHUTTER', 'PARKING'].map((cat) => (
             <button 
               key={cat} 
               onClick={() => setFilter(cat)}
               className={`text-[10px] font-black transition-all uppercase tracking-[0.2em] px-6 py-3 rounded-xl border-2 ${
                 filter === cat 
                   ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                   : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
               }`}
             >
                {cat}
             </button>
           ))}
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white font-black text-xs px-8 py-4 rounded-2xl shadow-xl shadow-indigo-100 flex items-center hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest"
        >
          <Plus className="w-5 h-5 mr-4" /> Materialize New Asset
        </button>
      </div>

      <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] overflow-hidden flex-1 overflow-y-auto">
        <table className="min-w-full divide-y-2 divide-slate-900">
          <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] sticky top-0 z-10 shadow-sm border-b-2 border-slate-900">
            <tr>
              <th className="px-8 py-6 text-left border-r border-slate-800">Asset Label</th>
              <th className="px-8 py-6 text-left border-r border-slate-800">Category</th>
              <th className="px-8 py-6 text-left border-r border-slate-800">Integrity State</th>
              <th className="px-8 py-6 text-left border-r border-slate-800">Mapping</th>
              <th className="px-8 py-6 text-right">Overrides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white font-mono text-sm leading-none">
            {filteredUnits.map((u, i) => (
              <tr key={u.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100 transition-colors group cursor-default`}>
                <td className="px-8 py-6 whitespace-nowrap border-r border-slate-100/30">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-indigo-500 opacity-30" />
                    <div className="text-xl font-black text-slate-900 tracking-tighter">{u.unitNumber}</div>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap border-r border-slate-100/30">
                   <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
                      {u.category === 'STORE' ? <Store className="w-3.5 h-3.5 mr-2 text-amber-500" /> : 
                       u.category === 'SHUTTER' ? <MoveHorizontal className="w-3.5 h-3.5 mr-2 text-blue-500" /> :
                       <Building2 className="w-3.5 h-3.5 mr-2 text-slate-400" />}
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{u.category}</span>
                   </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap border-r border-slate-100/30">
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
                <td className="px-8 py-6 whitespace-nowrap border-r border-slate-100/30">
                   <div className="flex items-center space-x-2">
                     <span className={`text-sm font-bold ${u.isOccupied ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                        {u.activeTenant || 'Material Vacuum (Vacant)'}
                     </span>
                   </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <button 
                    onClick={() => setEditingUnit(u)}
                    className="p-3 text-slate-300 hover:text-slate-900 bg-slate-50 hover:bg-white border-2 border-transparent hover:border-slate-900 rounded-xl transition-all"
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
           <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <h2 className="text-xl font-black uppercase tracking-tight italic">Resource Materialization</h2>
               <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                 <Plus className="w-6 h-6 rotate-45" />
               </button>
             </div>
             <form onSubmit={handleSubmit(onAddUnit)} className="p-10 space-y-8">
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Structural Index Mapping</label>
                   <input {...register('unitNumber')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:font-bold placeholder:text-slate-200" placeholder="e.g. N-101" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Hardware Classification</label>
                   <input {...register('type')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:font-bold placeholder:text-slate-200" placeholder="e.g. Penthouse Apartment" />
                </div>
                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Atomic Category</label>
                   <select {...register('category')} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-slate-900 focus:bg-white transition-all appearance-none cursor-pointer">
                     <option value="FLAT">FLAT (RESIDENTIAL)</option>
                     <option value="STORE">STORE (COMMERCIAL)</option>
                     <option value="SHUTTER">SHUTTER (RETAIL)</option>
                     <option value="PARKING">PARKING (SERVICE)</option>
                   </select>
                </div>
                <button disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl shadow-slate-200 uppercase tracking-[0.34em] text-xs hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98] transition-all">
                   {isSubmitting ? 'Syncing...' : 'Initiate Deployment'}
                </button>
             </form>
           </div>
        </div>
      )}

      {/* Edit/Status Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
               <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter">Asset {editingUnit.unitNumber}</h2>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Protocol Overrides</p>
                  </div>
                  <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-white transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
               </div>
               <div className="p-8 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Integrity Override:</p>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, 'OPERATIONAL')}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-100 hover:border-green-500 rounded-3xl transition-all"
                  >
                    <div className="flex items-center text-slate-900 font-black uppercase text-xs tracking-widest">
                       <CheckCircle2 className="w-5 h-5 text-green-500 mr-4" /> OPERATIONAL
                    </div>
                  </button>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, 'UNDER_REPAIR')}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-100 hover:border-amber-500 rounded-3xl transition-all"
                  >
                    <div className="flex items-center text-slate-900 font-black uppercase text-xs tracking-widest">
                       <Hammer className="w-5 h-5 text-amber-500 mr-4" /> REPAIR PHASE
                    </div>
                  </button>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, 'DECOMMISSIONED')}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 border-2 border-slate-100 hover:border-red-500 rounded-3xl transition-all"
                  >
                    <div className="flex items-center text-slate-900 font-black uppercase text-xs tracking-widest text-red-600">
                       <AlertTriangle className="w-5 h-5 text-red-500 mr-4" /> VOID RESOURCE
                    </div>
                  </button>
               </div>
               <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">CHRONO-LOGGED AUDIT TRAIL WILL BE UPDATED IMMEDIATELY.</p>
               </div>
            </div>
        </div>
      )}
    </div>
  )
}
