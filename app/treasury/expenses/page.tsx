import prisma from '@/lib/prisma'
import ExpenseFormClient from './ExpenseFormClient'
import { Landmark, ShieldAlert, History } from 'lucide-react'

export default async function ExpenseLoggingPage() {
  const properties = await (prisma as any).property.findMany();
  const allCategories = await (prisma as any).expenseCategory.findMany({
    include: { children: true }
  });

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-900 pb-8 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Landmark className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Treasury Outflow</h1>
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Fiscal Expenditure Materialization Engine</p>
        </div>

        <div className="flex items-center gap-3">
             <div className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <ShieldAlert className="w-3 h-3 mr-2 text-green-600" />
                <span className="text-[8px] font-black uppercase text-green-700 tracking-widest leading-none">Status: Governance Active</span>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <ExpenseFormClient properties={properties} allCategories={allCategories} />
      </div>

      <div className="bg-slate-50 border-4 border-slate-200 rounded-3xl p-10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
             <History className="w-10 h-10 text-slate-400" />
             <div>
                <p className="text-slate-900 font-black uppercase italic tracking-tighter text-lg">System Integrity Anchored</p>
                <p className="text-slate-400 font-bold text-xs mt-1 tracking-tight">All expenditures are anchored to the Chart of Accounts and the Double-Entry Ledger.</p>
             </div>
          </div>
          <button className="bg-white border-2 border-slate-900 text-[8px] font-black px-4 py-2 rounded-lg hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest italic">
             View Audit Trail
          </button>
      </div>
    </div>
  )
}
