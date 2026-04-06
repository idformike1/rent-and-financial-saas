'use client'

import { useState } from 'react'
import { Plus, Building2, MapPin, LayoutGrid, ChevronRight, Hash, X, Loader2, Sparkles, Navigation } from 'lucide-react'
import { createProperty } from '@/actions/asset.actions'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { Card, Button, Input, Badge } from '@/components/ui-finova'

const propertySchema = z.object({
  name: z.string().min(2, "Required"),
  address: z.string().min(5, "Full address required")
})

type PropertyForm = z.infer<typeof propertySchema>

export default function PropertyDashboardClient({ initialProperties }: { initialProperties: any[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PropertyForm>({
    resolver: zodResolver(propertySchema)
  });

  const onAddProperty = async (data: PropertyForm) => {
    setIsSubmitting(true);
    try {
      const result = await createProperty(data);
      if (result.success) {
        toast.success("Property Registered Successfully");
        reset();
        setIsAddModalOpen(false);
      } else {
        toast.error(result.message || "Property registration failed");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col animate-in fade-in duration-700">
      <div className="flex justify-end mb-10">
        <Button 
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="h-14 px-8 rounded-3xl font-black uppercase tracking-widest shadow-premium flex items-center group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          <Building2 className="w-5 h-5 mr-3 relative z-10" /> 
          <span className="relative z-10">Add Property</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialProperties.map((p) => (
          <Link 
            key={p.id} 
            href={`/properties/${p.id}`}
            className="group"
          >
            <Card className="p-8 rounded-[2.5rem] border-none shadow-premium hover:shadow-premium-lg hover:-translate-y-2 transition-all relative overflow-hidden bg-card dark:bg-slate-900 h-full">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700">
                 <Building2 className="w-32 h-32 text-brand" />
              </div>
              
              <div className="mb-8 space-y-3">
                <div className="flex items-center gap-2">
                   <Badge className="bg-brand/5 text-brand border-brand/20 text-[8px] px-2 py-0">Asset ID: {p.id.slice(0,4)}</Badge>
                   <Badge variant="success" className="text-[8px] px-2 py-0">Status: Active</Badge>
                </div>
                <h2 className="text-2xl font-black text-foreground dark:text-foreground uppercase tracking-tighter italic leading-tight group-hover:text-brand transition-colors">{p.name}</h2>
                <div className="flex items-center text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                  <Navigation className="w-3 h-3 mr-2 text-brand" /> {p.address}
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-surface-800">
                 <div className="flex items-center space-x-6">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment Count</span>
                      <span className="text-xl font-black text-foreground dark:text-foreground flex items-center mt-1">
                        <Hash className="w-4 h-4 mr-1.5 text-brand" /> {p._count.units}
                      </span>
                    </div>
                 </div>
                 <div className="w-12 h-12 bg-slate-50 dark:bg-surface-800 rounded-3xl flex items-center justify-center group-hover:bg-brand group-hover:text-foreground group-hover:shadow-premium transition-all">
                    <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                 </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Add Property Modal: FINOVA STANDARD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
           <Card className="border-none rounded-[3rem] shadow-premium-lg w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300 bg-card dark:bg-slate-900">
             <div className="p-10 bg-slate-900 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                   <h2 className="text-2xl font-black text-foreground uppercase tracking-tighter italic leading-none">Asset Registration</h2>
                   <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-2">Phase 1: Domain Mapping</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="bg-white/5 hover:bg-card/20 text-foreground rounded-xl p-3 transition-colors relative z-10">
                  <X className="w-5 h-5" />
                </button>
             </div>
             <form onSubmit={handleSubmit(onAddProperty)} className="p-12 space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">Visual Deployment Label</label>
                  <Input 
                    {...register('name')} 
                    className="py-7 text-xl font-black placeholder:text-slate-200 dark:placeholder:text-surface-700 italic tracking-tighter"
                    placeholder="e.g. North Metropolitan" 
                  />
                  {errors.name && <p className="text-rose-500 text-[10px] font-black mt-1 uppercase px-1">{errors.name.message as string}</p>}
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1">GPS Persistence Mapping</label>
                  <Input 
                    {...register('address')} 
                    className="py-7 text-lg font-bold placeholder:text-slate-200 dark:placeholder:text-surface-700 tracking-tight"
                    placeholder="e.g. 123 Sky Tower Blvd" 
                  />
                  {errors.address && <p className="text-rose-500 text-[10px] font-black mt-1 uppercase px-1">{errors.address.message as string}</p>}
                </div>
                <Button 
                  disabled={isSubmitting} 
                  variant="primary"
                  className="w-full h-16 rounded-3xl font-black uppercase tracking-widest shadow-premium"
                >
                   {isSubmitting ? <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> Syncing Registry...</> : <><Sparkles className="w-5 h-5 mr-3"/> Finalize Deployment</>}
                </Button>
             </form>
           </Card>
        </div>
      )}
    </div>
  )
}
