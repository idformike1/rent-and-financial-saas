'use client'

import { useState } from 'react'
import { Plus, Settings, CheckCircle2, AlertTriangle, Hammer, Hash, LayoutGrid, Building2, Store, MoveHorizontal } from 'lucide-react'
import { createUnit, updateUnitStatus } from '@/actions/asset.actions'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MaintenanceStatus } from '@/src/schema/enums'
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
               className={`text-[10px] transition-all  tracking-[0.2em] px-6 py-3 rounded-xl border-2 ${
                 filter === cat 
                   ? 'bg-card text-foreground border-foreground' 
                   : 'bg-card text-muted-foreground border-border hover:border-border'
               }`}
             >
                {cat}
             </button>
           ))}
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[var(--primary)] text-foreground text-xs px-8 py-4 rounded-[8px] flex items-center hover:bg-[var(--primary-dark,#E64A19)] active:scale-95 transition-all "
        >
          <Plus className="w-5 h-5 mr-4" /> Materialize New Asset
        </button>
      </div>

      <div className="bg-card border-2 border-foreground rounded-[8px] shadow-none overflow-hidden flex-1 overflow-y-auto">
        <table className="min-w-full divide-y-2 divide-slate-900">
          <thead className="bg-card text-muted-foreground text-[10px]  tracking-[0.2em] sticky top-0 z-10 border-b-2 border-foreground">
            <tr>
              <th className="px-8 py-6 text-left border-r border-border">Asset Label</th>
              <th className="px-8 py-6 text-left border-r border-border">Category</th>
              <th className="px-8 py-6 text-left border-r border-border">Integrity State</th>
              <th className="px-8 py-6 text-left border-r border-border">Mapping</th>
              <th className="px-8 py-6 text-right">Overrides</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-card font-mono text-sm leading-none">
            {filteredUnits.map((u, i) => (
              <tr key={u.id} className={`${i % 2 === 0 ? 'bg-card' : 'bg-muted'} hover:bg-muted transition-colors group cursor-default`}>
                <td className="px-8 py-6 whitespace-nowrap border-r border-border/30">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-[var(--primary)] opacity-30" />
                    <div className="text-xl text-foreground">{u.unitNumber}</div>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap border-r border-border/30">
                   <div className="flex items-center bg-card border border-border px-3 py-1.5 rounded-xl">
                      {u.category === 'STORE' ? <Store className="w-3.5 h-3.5 mr-2 text-amber-500" /> : 
                       u.category === 'SHUTTER' ? <MoveHorizontal className="w-3.5 h-3.5 mr-2 text-[var(--primary)]" /> :
                       <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />}
                      <span className="text-[10px] text-muted-foreground ">{u.category}</span>
                   </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap border-r border-border/30">
                  <div className="flex items-center">
                    {u.maintenanceStatus === 'OPERATIONAL' ? (
                      <CheckCircle2 className="w-4 h-4 text-[var(--primary)] mr-2" />
                    ) : u.maintenanceStatus === 'UNDER_REPAIR' ? (
                      <Hammer className="w-4 h-4 text-amber-500 mr-2" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={`text-[10px]  ${u.maintenanceStatus === 'OPERATIONAL' ? 'text-[var(--primary)]' : 'text-muted-foreground'}`}>
                      {u.maintenanceStatus}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap border-r border-border/30">
                   <div className="flex items-center space-x-2">
                     <span className={`text-sm font-bold ${u.isOccupied ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {u.activeTenant || 'Material Vacuum (Vacant)'}
                     </span>
                   </div>
                </td>
                <td className="px-8 py-6 whitespace-nowrap text-right">
                  <button 
                    onClick={() => setEditingUnit(u)}
                    className="p-3 text-muted-foreground hover:text-foreground bg-muted hover:bg-card border-2 border-transparent hover:border-foreground rounded-xl transition-all"
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
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-card border-2 border-foreground rounded-[8px] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6 bg-card text-foreground flex justify-between items-center">
               <h2 className="text-xl  tracking-tight">Resource Materialization</h2>
               <button onClick={() => setIsAddModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                 <Plus className="w-6 h-6 rotate-45" />
               </button>
             </div>
             <form onSubmit={handleSubmit(onAddUnit)} className="p-6 space-y-8">
                <div>
                   <label className="text-[10px] text-muted-foreground  block mb-2 px-1">Structural Index Mapping</label>
                   <input {...register('unitNumber')} className="w-full bg-muted border-2 border-border rounded-[8px] p-5 text-lg outline-none focus:border-foreground focus:bg-card transition-all placeholder:font-bold placeholder:text-foreground" placeholder="e.g. N-101" />
                </div>
                <div>
                   <label className="text-[10px] text-muted-foreground  block mb-2 px-1">Hardware Classification</label>
                   <input {...register('type')} className="w-full bg-muted border-2 border-border rounded-[8px] p-5 text-lg outline-none focus:border-foreground focus:bg-card transition-all placeholder:font-bold placeholder:text-foreground" placeholder="e.g. Penthouse Apartment" />
                </div>
                <div>
                   <label className="text-[10px] text-muted-foreground  block mb-2 px-1">Atomic Category</label>
                   <select {...register('category')} className="w-full bg-muted border-2 border-border rounded-[8px] p-5 text-lg outline-none focus:border-foreground focus:bg-card transition-all appearance-none cursor-pointer">
                     <option value="FLAT">FLAT (RESIDENTIAL)</option>
                     <option value="STORE">STORE (COMMERCIAL)</option>
                     <option value="SHUTTER">SHUTTER (RETAIL)</option>
                     <option value="PARKING">PARKING (SERVICE)</option>
                   </select>
                </div>
                <button disabled={isSubmitting} className="w-full bg-card text-foreground py-6 rounded-[8px] shadow-border  tracking-[0.34em] text-xs hover:bg-card disabled:opacity-50 active:scale-[0.98] transition-all">
                   {isSubmitting ? 'Syncing...' : 'Initiate Deployment'}
                </button>
             </form>
           </div>
        </div>
      )}

      {/* Edit/Status Modal */}
      {editingUnit && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-card border-2 border-foreground rounded-[8px] w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
               <div className="p-6 bg-card text-foreground flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl">Asset {editingUnit.unitNumber}</h2>
                    <p className="text-muted-foreground text-[10px] font-bold ">Protocol Overrides</p>
                  </div>
                  <button onClick={() => setEditingUnit(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
               </div>
               <div className="p-6 space-y-3">
                  <p className="text-xs font-bold text-muted-foreground  mb-6">Integrity Override:</p>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, MaintenanceStatus.OPERATIONAL)}
                    className="w-full flex items-center justify-between p-5 bg-muted border-2 border-border hover:border-green-500 rounded-[8px] transition-all"
                  >
                    <div className="flex items-center text-foreground  text-xs">
                       <CheckCircle2 className="w-5 h-5 text-[var(--primary)] mr-4" /> OPERATIONAL
                    </div>
                  </button>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, MaintenanceStatus.UNDER_REPAIR)}
                    className="w-full flex items-center justify-between p-5 bg-muted border-2 border-border hover:border-amber-500 rounded-[8px] transition-all"
                  >
                    <div className="flex items-center text-foreground  text-xs">
                       <Hammer className="w-5 h-5 text-amber-500 mr-4" /> REPAIR PHASE
                    </div>
                  </button>
                  <button 
                    onClick={() => onStatusChange(editingUnit.id, MaintenanceStatus.DECOMMISSIONED)}
                    className="w-full flex items-center justify-between p-5 bg-muted border-2 border-border hover:border-red-500 rounded-[8px] transition-all"
                  >
                    <div className="flex items-center text-foreground  text-xs text-red-600">
                       <AlertTriangle className="w-5 h-5 text-red-500 mr-4" /> VOID RESOURCE
                    </div>
                  </button>
               </div>
               <div className="p-6 bg-muted border-t border-border text-center">
                  <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">CHRONO-LOGGED AUDIT TRAIL WILL BE UPDATED IMMEDIATELY.</p>
               </div>
            </div>
        </div>
      )}
    </div>
  )
}
