'use client'

import { useRef } from 'react'
import { createCategory } from '@/actions/category.actions'
import { toast } from '@/lib/toast'

export default function CategoryForm({ rootCategories }: { rootCategories: any[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await createCategory(formData);
      // createCategory should return { success: boolean, message: string }
      // If it doesn't, we might need to check how it's implemented.
      // Most actions in this repo seem to return { success, message, data }
      
      if ((result as any)?.success) {
        toast.success("Category Materialized Successfully");
        formRef.current?.reset();
      } else {
        toast.error((result as any)?.message || "Failed to materialize category");
      }
    } catch (error) {
      toast.error("Network synchronization failure");
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-8 border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(79,70,229,0.2)]">
      <h3 className="text-white text-xl font-black italic uppercase tracking-tighter mb-6">Materialize New Data Node</h3>
      <form ref={formRef} action={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Data Label</label>
              <input name="name" required className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500 transition-all text-sm" placeholder="e.g., Electricity" />
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Target Scope</label>
              <select name="scope" required className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500 transition-all text-sm appearance-none">
                  <option value="PROPERTY">PROPERTY</option>
                  <option value="HOME">HOME</option>
                  <option value="PERSONAL">PERSONAL</option>
              </select>
          </div>
          <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Parent Node (Optional)</label>
              <select name="parentId" className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-indigo-500 transition-all text-sm appearance-none">
                  <option value="">ROOT NODE (NONE)</option>
                  {rootCategories.map((c: any) => (
                      <option key={c.id} value={c.id}>{`[${c.scope}] ${c.name}`}</option>
                  ))}
              </select>
          </div>
          <button type="submit" className="bg-indigo-600 text-white font-black h-12 rounded-xl hover:bg-white hover:text-indigo-600 transition-all uppercase tracking-[0.2em] text-xs shadow-lg">
              Activate Entry
          </button>
      </form>
    </div>
  );
}
