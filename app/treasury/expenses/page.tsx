import prisma from '@/lib/prisma'
import Link from 'next/link'
import ExpenseFormClient from './ExpenseFormClient'
import { Landmark, ShieldAlert, History, ArrowLeft, Shield } from 'lucide-react'

export default async function ExpenseLoggingPage() {
  const properties = await (prisma as any).property.findMany();
  const allCategories = await (prisma as any).expenseCategory.findMany({
    include: { children: true }
  });
  const allLedgers = await (prisma as any).financialLedger.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-900 pb-8 gap-4">
        <div>
          {/* Back link */}
          <Link
            href="/expenses"
            className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors mb-4 group"
          >
            <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Expenses
          </Link>
          <div className="flex items-center space-x-2 mb-2">
            <Landmark className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">Treasury Entry Hub</h1>
          </div>
          <p className="text-slate-500 font-bold tracking-widest uppercase text-[10px]">Dual-Stream Fiscal Materialization · Inflow & Outflow Synchronization</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <ShieldAlert className="w-3 h-3 mr-2 text-green-600" />
            <span className="text-[8px] font-black uppercase text-green-700 tracking-widest leading-none">Status: Governance Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <ExpenseFormClient properties={properties} allCategories={allCategories} allLedgers={allLedgers} />
      </div>

      {/* Footer panel — both buttons now wired */}
      <div className="bg-slate-50 border-4 border-slate-200 rounded-3xl p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <History className="w-10 h-10 text-slate-400 shrink-0" />
          <div>
            <p className="text-slate-900 font-black uppercase italic tracking-tighter text-lg">System Integrity Anchored</p>
            <p className="text-slate-400 font-bold text-xs mt-1 tracking-tight">All expenditures are anchored to the Chart of Accounts and the Double-Entry Ledger.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link
            href="/expenses"
            className="bg-white border-2 border-slate-900 text-[10px] font-black px-5 py-3 rounded-lg hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest italic flex items-center justify-center"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back to Expenses
          </Link>
          <Link
            href="/settings/audit"
            className="bg-slate-900 text-white border-2 border-slate-900 text-[10px] font-black px-5 py-3 rounded-lg hover:bg-indigo-700 hover:border-indigo-700 transition-all uppercase tracking-widest italic flex items-center justify-center"
          >
            <Shield className="w-3 h-3 mr-2" />
            View Audit Trail
          </Link>
        </div>
      </div>
    </div>
  )
}
