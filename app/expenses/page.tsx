import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Plus, ReceiptText, Landmark, Home, User, PieChart as PieIcon, ArrowRight, Command, ShieldCheck, Zap } from 'lucide-react'
import ExpensesChartClient from './ExpensesChartClient'
import { cn } from '@/lib/utils'

export default async function UnifiedExpensesDashboard() {
  const entries = await (prisma as any).ledgerEntry.findMany({
    include: {
      expenseCategory: {
        include: { 
          parent: true,
          ledger: true 
        }
      },
      property: true
    },
    orderBy: { date: 'desc' }
  });

  const totalRevenue = entries.filter((e: any) => Number(e.amount) > 0).reduce((sum: number, e: any) => sum + Number(e.amount), 0);
  const totalExpenses = entries.filter((e: any) => Number(e.amount) < 0).reduce((sum: number, e: any) => sum + Math.abs(Number(e.amount)), 0);
  const netPosition = totalRevenue - totalExpenses;
  const grandVolume = totalRevenue + totalExpenses; // For visual weighting

  const categoryMap: Record<string, number> = {};
  entries.forEach((e: any) => {
    if (Number(e.amount) < 0) {
      const catName = e.expenseCategory?.parent?.name || e.expenseCategory?.name || 'Unallocated Expenditure';
      categoryMap[catName] = (categoryMap[catName] || 0) + Math.abs(Number(e.amount));
    }
  });

  const chartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="py-12 px-6 max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 border-b border-slate-100 dark:border-white/5 pb-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.75rem] bg-indigo-500/10 flex items-center justify-center shadow-premium-lg group-hover:rotate-12 transition-transform">
            <Landmark className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Wealth Ledger Terminal</h1>
            <div className="flex items-center gap-3 mt-3">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Audit Registry</span>
               <div className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Axiom 2026 Protocol</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
           <Link 
            href="/settings/categories" 
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 font-black h-14 px-8 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest text-[10px] flex items-center italic"
          >
            Manage Schema
          </Link>
          <Link 
            href="/treasury/expenses" 
            className="bg-slate-900 dark:bg-brand text-white font-black h-14 px-8 rounded-2xl shadow-brand/40 hover:shadow-brand/60 transition-all uppercase tracking-widest text-[10px] flex items-center italic"
          >
            <Plus className="w-4 h-4 mr-3" /> Authorize Entry
          </Link>
        </div>
      </div>

      {/* High-Density Wealth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-emerald-500 rounded-[2.5rem] p-10 h-44 flex flex-col justify-between shadow-2xl shadow-emerald-500/20 group hover:translate-y-[-4px] transition-transform duration-500 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-20"><Plus className="w-12 h-12 text-white" /></div>
           <p className="text-[10px] font-black text-emerald-900/50 uppercase tracking-[0.4em]">Master Revenue Inflow</p>
           <p className="text-5xl font-black text-white italic tracking-tighter">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-rose-500 rounded-[2.5rem] p-10 h-44 flex flex-col justify-between shadow-2xl shadow-rose-500/20 group hover:translate-y-[-4px] transition-transform duration-500 overflow-hidden relative">
           <div className="absolute top-0 right-0 p-8 opacity-20"><Plus className="w-12 h-12 text-white rotate-45" /></div>
           <p className="text-[10px] font-black text-rose-900/50 uppercase tracking-[0.4em]">Operational Expenditure</p>
           <p className="text-5xl font-black text-white italic tracking-tighter">${totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-10 h-44 flex flex-col justify-between shadow-2xl group hover:translate-y-[-4px] transition-transform duration-500 overflow-hidden relative border border-white/5">
           <div className="absolute top-0 right-0 p-8 opacity-20"><ShieldCheck className="w-12 h-12 text-indigo-400" /></div>
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Net Fiscal Position</p>
           <p className={cn("text-5xl font-black italic tracking-tighter", netPosition >= 0 ? "text-emerald-400" : "text-rose-400")}>
             ${netPosition.toLocaleString(undefined, {minimumFractionDigits: 2})}
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-12 shadow-premium">
            <div className="flex items-center justify-between mb-10 border-b border-slate-50 dark:border-white/5 pb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center text-slate-900 dark:text-white">
                    <PieIcon className="w-6 h-6 mr-4 text-indigo-500" /> Allocation Breakdown
                </h3>
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                    <PieIcon className="w-5 h-5 text-slate-400" />
                </div>
            </div>
            <div className="h-96">
                <ExpensesChartClient data={chartData} />
            </div>
        </div>

        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-12 shadow-premium flex flex-col">
            <div className="flex items-center justify-between mb-10 border-b border-slate-50 dark:border-white/5 pb-8">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter flex items-center text-slate-900 dark:text-white">
                    <ReceiptText className="w-6 h-6 mr-4 text-indigo-500" /> Registry Surveillance
                </h3>
                <Link href="/reports/master-ledger" className="text-[10px] font-black uppercase text-indigo-500 hover:underline flex items-center tracking-[0.3em]">
                    Full Audit <ArrowRight className="w-3 h-3 ml-2" />
                </Link>
            </div>
            <div className="flex-1 space-y-8">
                {entries.slice(0, 5).map((e: any) => (
                    <div key={e.id} className="flex items-center justify-between border-b border-slate-50 dark:border-white/5 pb-6 last:border-0 hover:translate-x-3 transition-transform duration-500 group">
                        <div className="flex items-center gap-6">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", 
                              Number(e.amount) > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                               <Landmark className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-widest leading-none">{new Date(e.date).toISOString().split('T')[0]}</span>
                                <span className="text-lg font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{e.payee || "INTERNAL SETTLEMENT"}</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <span className={cn("block text-2xl font-black italic tracking-tighter", 
                              Number(e.amount) > 0 ? "text-emerald-500" : "text-rose-500"
                            )}>
                              {Number(e.amount) > 0 ? '+' : '-'}${Math.abs(Number(e.amount)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                            </span>
                            <span className="block px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 dark:border-white/5">
                              {e.expenseCategory?.name || 'Inflow Stream'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  )
}
