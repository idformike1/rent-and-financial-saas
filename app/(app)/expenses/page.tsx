import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Landmark, ShieldCheck, Zap, ArrowLeft, History } from 'lucide-react'
import RegistrySurveillanceClient from './RegistrySurveillanceClient'
import { Badge } from '@/components/ui-finova'

export default async function ExpenseRegistryPage() {
  const entries = await (prisma as any).ledgerEntry.findMany({
    include: {
      expenseCategory: {
        include: { 
          parent: true 
        }
      },
      property: true
    },
    orderBy: { transactionDate: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-950 p-12 space-y-20 font-mono">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-white/5 pb-10">
        <div>
          <div className="flex items-center space-x-3 mb-3">
             <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] rounded-none px-2 py-0.5 uppercase tracking-widest">REGISTRY_SURVEILLANCE_v3.2</Badge>
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>
          <h1 className="text-5xl font-light tracking-tighter text-white uppercase italic leading-none">Wealth <span className="text-emerald-400">Registry Terminal</span></h1>
          <p className="text-[10px] text-slate-500 tracking-[0.4em] mt-5 uppercase">System audit of operational expenditure and inflow recognized in the axiom 2026 protocol.</p>
        </div>
        
        <div className="flex gap-4">
          <Link 
            href="/treasury/expenses" 
            className="h-16 px-10 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-4 hover:bg-emerald-500 hover:text-white transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Authorize Entry
          </Link>
        </div>
      </div>

      {/* REGISTRY CONTENT */}
      <div className="relative z-10">
         <RegistrySurveillanceClient entries={entries} />
      </div>

      {/* SYSTEM INTEGRITY FOOTER */}
      <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-10 opacity-40 grayscale">
         <div className="flex items-center gap-8">
            <div className="w-14 h-14 rounded-none border border-white/10 flex items-center justify-center">
               <History className="w-6 h-6 text-slate-400" />
            </div>
            <div>
               <p className="text-lg font-black uppercase italic tracking-tighter text-white leading-none">Immutability Protocol Active</p>
               <div className="flex items-center gap-3 mt-3">
                  <Zap className="w-3 h-3 text-emerald-500" />
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em]">Direct Ledger Synchronization: SECURE</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
