'use client'

import { useState } from 'react'
import { Plus, Settings, CheckCircle2, AlertTriangle, Hammer, Hash, LayoutGrid, Building2, Store, MoveHorizontal, Loader2, ShieldCheck, X, Search } from 'lucide-react'
import { createUnit, updateUnitStatus } from '@/actions/asset.actions'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MaintenanceStatus } from '@/src/schema/enums'
import { toast } from '@/lib/toast'
import { Card, Badge, Button, Input, MercuryTable, THead, TBody, TR, TD } from '@/components/ui-finova'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Required"),
  type: z.string().min(2, "e.g. Standard Apartment"),
  category: z.string().min(1, "Required"),
  marketRent: z.number().min(0, "Rent must be positive")
})

type UnitForm = z.infer<typeof unitSchema>

export default function UnitManagementClient({ initialUnits, propertyId }: { initialUnits: any[], propertyId: string }) {
  const [units, setUnits] = useState(initialUnits);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      category: 'FLAT',
      marketRent: 0
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
    <div className="flex-1 flex flex-col space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center bg-card border border-border p-2 rounded-full">
        <div className="flex gap-1">
           {['ALL', 'FLAT', 'STORE', 'SHUTTER', 'PARKING'].map((cat) => (
             <button 
               key={cat} 
               onClick={() => setFilter(cat)}
               className={cn(
                 "text-[10px] font-bold uppercase tracking-widest px-6 py-2 rounded-full transition-all",
                 filter === cat 
                   ? 'bg-vibrant-blue text-white shadow-sm' 
                   : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
               )}
             >
                {cat}
             </button>
           ))}
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-vibrant-blue text-white text-[12px] font-bold h-9 px-6 rounded-full flex items-center hover:bg-vibrant-blue/90 active:scale-95 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" /> Provision New Asset
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden flex-1 shadow-sm">
        <MercuryTable>
          <THead>
            <TR isHeader>
              <TD isHeader className="pl-8">Asset Label</TD>
              <TD isHeader>Category</TD>
              <TD isHeader>Integrity State</TD>
              <TD isHeader>Tenant Mapping</TD>
              <TD isHeader className="pr-8 text-right">Protocol</TD>
            </TR>
          </THead>
          <TBody>
            {filteredUnits.length === 0 ? (
              <TR>
                <TD colSpan={5} className="h-32 text-center text-muted-foreground/30 uppercase text-[10px] tracking-[0.2em]">No hardware resources found in buffer</TD>
              </TR>
            ) : (
              filteredUnits.map((u) => (
                <TR key={u.id}>
                  <TD className="pl-8 font-display">
                    <div className="flex items-center gap-3">
                      <Hash className="w-4 h-4 text-vibrant-blue/20" />
                      <span className="text-[17px] font-medium text-foreground tracking-tight">{u.unitNumber}</span>
                    </div>
                  </TD>
                  <TD>
                     <div className="flex items-center gap-2">
                        {u.category === 'STORE' ? <Store className="w-3.5 h-3.5 text-amber-500/50" /> : 
                         u.category === 'SHUTTER' ? <MoveHorizontal className="w-3.5 h-3.5 text-vibrant-blue/50" /> :
                         <Building2 className="w-3.5 h-3.5 text-muted-foreground/30" />}
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">{u.category}</span>
                     </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      {u.maintenanceStatus === 'OPERATIONAL' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-mercury-green/60" />
                      ) : u.maintenanceStatus === 'UNDER_REPAIR' ? (
                        <Hammer className="w-3.5 h-3.5 text-amber-500/60" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500/60" />
                      )}
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        u.maintenanceStatus === 'OPERATIONAL' ? 'text-mercury-green/80' : 'text-muted-foreground/50'
                      )}>
                        {u.maintenanceStatus?.replace('_', ' ')}
                      </span>
                    </div>
                  </TD>
                  <TD>
                     <span className={cn(
                       "text-[14px] font-medium tracking-tight",
                       u.isOccupied ? 'text-foreground/80' : 'text-muted-foreground/20 italic'
                     )}>
                        {u.activeTenant || 'Material Vacuum (Vacant)'}
                     </span>
                  </TD>
                  <TD className="pr-8 text-right">
                    <button 
                      onClick={() => setEditingUnit(u)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/5 text-muted-foreground hover:text-foreground hover:border-white/10 transition-all"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </TD>
                </TR>
              ))
            )}
          </TBody>
        </MercuryTable>
      </div>

      {/* Add Unit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-card border border-border p-10 rounded-3xl w-full max-w-lg relative shadow-2xl"
             >
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="absolute top-10 right-10 w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-all group"
                >
                  <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </button>
                <div className="mb-10 space-y-2">
                   <h2 className="text-[28px] font-display text-foreground leading-tight tracking-tight">Resource Provisioning</h2>
                   <p className="text-[14px] text-muted-foreground tracking-tight">Initial structural asset allocation</p>
                </div>
                
                <form onSubmit={handleSubmit(onAddUnit)} className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Structural ID</label>
                      <Input 
                        {...register('unitNumber')} 
                        className="bg-background/50 border-border h-14 px-6 text-[16px] font-medium text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl placeholder:text-muted-foreground/20" 
                        placeholder="e.g. N-101" 
                      />
                      {errors.unitNumber && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{errors.unitNumber.message}</p>}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Hardware Type</label>
                         <Input 
                           {...register('type')} 
                           className="bg-background/50 border-border h-14 px-6 text-[15px] font-medium text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl" 
                           placeholder="Standard Unit" 
                         />
                         {errors.type && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{errors.type.message}</p>}
                      </div>
                      <div className="space-y-4">
                         <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Market Rent ($)</label>
                         <Input 
                           {...register('marketRent', { valueAsNumber: true })} 
                           className="bg-background/50 border-border h-14 px-6 text-[15px] font-finance text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl" 
                           placeholder="0.00" 
                           type="number" 
                         />
                         {errors.marketRent && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{errors.marketRent.message}</p>}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Atomic Category</label>
                      <div className="bg-background/50 border border-border rounded-xl overflow-hidden focus-within:border-vibrant-blue transition-all">
                        <select 
                          {...register('category')} 
                          className="w-full bg-transparent h-14 px-6 text-[14px] font-bold uppercase tracking-widest text-foreground outline-none appearance-none cursor-pointer"
                        >
                           <option value="FLAT" className="bg-card">FLAT (RESIDENTIAL)</option>
                           <option value="STORE" className="bg-card">STORE (COMMERCIAL)</option>
                           <option value="SHUTTER" className="bg-card">SHUTTER (RETAIL)</option>
                           <option value="PARKING" className="bg-card">PARKING (SERVICE)</option>
                        </select>
                      </div>
                   </div>

                   <Button 
                     disabled={isSubmitting} 
                     className="w-full h-16 rounded-full text-[14px] font-bold uppercase tracking-[0.2em] bg-vibrant-blue hover:bg-vibrant-blue/90 text-white shadow-xl transition-all"
                   >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Materializing...</div>
                      ) : (
                        <div className="flex items-center gap-2">Initiate Deployment <ShieldCheck className="w-5 h-5" /></div>
                      )}
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit/Status Modal */}
      <AnimatePresence>
        {editingUnit && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="bg-card border border-border p-10 rounded-3xl w-full max-w-md relative shadow-2xl"
             >
                <button 
                  onClick={() => setEditingUnit(null)} 
                  className="absolute top-10 right-10 w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-all group"
                >
                  <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </button>
                <div className="mb-10 space-y-2">
                   <h2 className="text-[24px] font-display text-foreground leading-tight tracking-tight">Asset {editingUnit.unitNumber}</h2>
                   <p className="text-muted-foreground text-[12px] font-bold uppercase tracking-widest">Protocol Overrides</p>
                </div>
                
                <div className="space-y-3">
                   <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 ml-1">Integrity Override:</p>
                   {[
                     { id: MaintenanceStatus.OPERATIONAL, label: 'OPERATIONAL', icon: CheckCircle2, color: 'text-mercury-green' },
                     { id: MaintenanceStatus.UNDER_REPAIR, label: 'REPAIR PHASE', icon: Hammer, color: 'text-amber-500' },
                     { id: MaintenanceStatus.DECOMMISSIONED, label: 'VOID RESOURCE', icon: AlertTriangle, color: 'text-rose-500' }
                   ].map((s) => (
                     <button 
                       key={s.id}
                       onClick={() => onStatusChange(editingUnit.id, s.id)}
                       disabled={isSubmitting}
                       className={cn(
                         "w-full flex items-center justify-between p-6 bg-background/50 border border-border rounded-xl transition-all hover:bg-white/[0.03]",
                         editingUnit.maintenanceStatus === s.id ? "border-vibrant-blue bg-vibrant-blue/5" : ""
                       )}
                     >
                       <div className="flex items-center text-[12px] font-bold tracking-widest uppercase">
                          <s.icon className={cn("w-5 h-5 mr-4", s.color)} /> {s.label}
                       </div>
                       {editingUnit.maintenanceStatus === s.id && <ShieldCheck className="w-4 h-4 text-vibrant-blue" />}
                     </button>
                   ))}
                </div>
                <div className="mt-8 pt-8 border-t border-white/[0.04]">
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center leading-relaxed opacity-30">Analytical integrity protocol will materialize immediately upon commit.</p>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
    </div>
  )
}
