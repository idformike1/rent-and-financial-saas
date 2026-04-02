import prisma from '@/lib/prisma'
import { Plus, FolderTree, Info, Settings, Trash2 } from 'lucide-react'
import CategoryForm from './CategoryForm'

export default async function CategoriesManagementPage() {
  const allCategories = await (prisma as any).expenseCategory.findMany({
    include: {
      children: true,
      parent: true
    },
    orderBy: { name: 'asc' }
  });

  const rootCategories = allCategories.filter((c: any) => !c.parentId);

  const scopes = ['PROPERTY', 'HOME', 'PERSONAL'];

  return (
    <div className="py-8 px-4 sm:px-6 max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-900 pb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Governance Hub</h1>
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Chart of Accounts & Expense Data Governance</p>
        </div>

        <button 
          id="add-category-trigger"
          className="bg-slate-900 text-white font-black px-6 py-3 rounded-xl shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center uppercase tracking-widest text-[10px] italic"
        >
          <Plus className="w-4 h-4 mr-2" /> Materialize New Category
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {scopes.map((scope) => {
          const scopeRoots = rootCategories.filter((c: any) => c.scope === scope);

          return (
            <div key={scope} className="bg-white border-4 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl p-6 flex flex-col space-y-6">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h2 className="text-xl font-black italic text-slate-900 uppercase tracking-tighter">{scope} RECORDS</h2>
                <div className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest uppercase ${
                    scope === 'PROPERTY' ? 'bg-indigo-100 text-indigo-600' :
                    scope === 'HOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                    SCOPE::{scope}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {scopeRoots.length === 0 ? (
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Active Registry</p>
                  </div>
                ) : (
                  scopeRoots.map((root: any) => (
                    <div key={root.id} className="group border-b border-slate-100 last:border-0 pb-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center">
                            <FolderTree className="w-4 h-4 mr-3 text-indigo-600" />
                            <span className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">{root.name}</span>
                         </div>
                      </div>
                      
                      {root.children.length > 0 && (
                        <div className="mt-2 ml-7 flex flex-wrap gap-2">
                          {root.children.map((child: any) => (
                            <span key={child.id} className="px-3 py-1 bg-slate-50 border-2 border-slate-200 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-tighter italic">
                              {child.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CategoryForm rootCategories={rootCategories} />

      <div className="bg-indigo-50 border-4 border-indigo-200 rounded-3xl p-10 flex items-center space-x-6">
          <Info className="w-12 h-12 text-indigo-600 flex-shrink-0" />
          <div>
              <p className="text-indigo-900 font-black uppercase italic italic tracking-tighter text-lg underline decoration-4 decoration-indigo-200 underline-offset-8">Audit Governance Protocol Active</p>
              <p className="text-indigo-600/80 font-bold text-xs mt-4 tracking-tight leading-relaxed">
                  Modification of the Chart of Accounts is an immutable broadcast. Existing ledger entries will remain anchored to their original identifiers. 
                  Use this console to expand the semantic depth of your financial tracking.
              </p>
          </div>
      </div>
    </div>
  )
}
