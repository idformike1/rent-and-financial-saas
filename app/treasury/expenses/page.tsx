import prisma from '@/lib/prisma'
import Link from 'next/link'
import ExpenseFormClient from './ExpenseFormClient'
import { Landmark, ShieldAlert, History, ArrowLeft, Shield, Zap } from 'lucide-react'

export default async function ExpenseLoggingPage() {
  const properties = await (prisma as any).property.findMany();
  const allCategories = await (prisma as any).expenseCategory.findMany({
    include: { children: true }
  });
  const allLedgers = await (prisma as any).financialLedger.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 dark:border-white/5 pb-10 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.75rem] bg-brand/10 flex items-center justify-center shadow-premium-lg">
            <Landmark className="w-8 h-8 text-brand" />
          </div>
          <div>
            <Link
              href="/expenses"
              className="inline-flex items-center text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-brand transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Wealth Ledger
            </Link>
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">Treasury Entry Hub</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Fiscal Materialization v3.1</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-emerald-500/10 px-4 py-2 rounded-2xl border border-emerald-500/20">
            <ShieldAlert className="w-4 h-4 mr-3 text-emerald-500" />
            <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest leading-none">Governance Signal: Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <ExpenseFormClient properties={properties} allCategories={allCategories} allLedgers={allLedgers} />
      </div>

      {/* Footer panel — Glassmorphic Integrity Anchor */}
      <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-[3rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-10 shadow-premium">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-[1.75rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
             <History className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <p className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">System Integrity Anchored</p>
            <div className="flex items-center gap-3 mt-3">
               <Zap className="w-3 h-3 text-brand" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Double-Entry Ledger Verified</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Link
            href="/expenses"
            className="h-14 px-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-[10px] font-black rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all uppercase tracking-widest italic flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-3 text-slate-400" />
            Wealth Registry
          </Link>
          <Link
            href="/settings/audit"
            className="h-14 px-8 bg-slate-900 dark:bg-brand text-white text-[10px] font-black rounded-2xl shadow-brand/40 hover:shadow-brand/60 transition-all uppercase tracking-widest italic flex items-center justify-center"
          >
            <Shield className="w-4 h-4 mr-3" />
            View Audit Trail
          </Link>
        </div>
      </div>
    </div>
  )
}
