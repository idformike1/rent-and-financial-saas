'use client'

import { useState } from 'react'
import { Plus, Building2, MapPin, LayoutGrid, ChevronRight, Hash } from 'lucide-react'
import { createProperty } from '@/actions/property-mgmt.actions'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from '@/lib/toast'

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
        // Refresh properties or redirect if needed
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
    <div className="flex-1 flex flex-col">
      <div className="flex justify-end mb-8">
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-slate-900 text-white font-black text-xs px-8 py-4 rounded-2xl shadow-xl shadow-slate-200 flex items-center hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-widest"
        >
          <Building2 className="w-5 h-5 mr-4" /> Add New Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialProperties.map((p) => (
          <Link 
            key={p.id} 
            href={`/properties/${p.id}`}
            className="group bg-white border-2 border-slate-900 p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Building2 className="w-24 h-24" />
            </div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">{p.name}</h2>
              <div className="flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                <MapPin className="w-3 h-3 mr-2" /> {p.address}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
               <div className="flex items-center space-x-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Asset Count</span>
                    <span className="text-xl font-black text-slate-900 flex items-center">
                      <Hash className="w-4 h-4 mr-1 text-indigo-600" /> {p._count.units}
                    </span>
                  </div>
               </div>
               <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <ChevronRight className="w-5 h-5" />
               </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Add Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
               <div>
                  <h2 className="text-xl font-black uppercase tracking-tight italic">Resource Registration</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Phase 1: Property Initialization</p>
               </div>
               <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                 <Plus className="w-6 h-6 rotate-45" />
               </button>
             </div>
             <form onSubmit={handleSubmit(onAddProperty)} className="p-10 space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Property Visual Label</label>
                  <input 
                    {...register('name')} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:font-bold placeholder:text-slate-200" 
                    placeholder="e.g. North Complex" 
                  />
                  {errors.name && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.name.message as string}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">GPS / Physical Mapping</label>
                  <input 
                    {...register('address')} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-lg font-black outline-none focus:border-slate-900 focus:bg-white transition-all placeholder:font-bold placeholder:text-slate-200" 
                    placeholder="e.g. 123 Sky Tower Blvd" 
                  />
                   {errors.address && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase">{errors.address.message as string}</p>}
                </div>
                <button disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl shadow-slate-200 uppercase tracking-[0.34em] text-xs hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98] transition-all">
                   {isSubmitting ? 'Syncing...' : 'Complete Registration'}
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  )
}
