import prisma from '@/lib/prisma'
import Link from 'next/link'
import ExpenseFormClient from './ExpenseFormClient'
import { Landmark, ShieldAlert, History, ArrowLeft, Shield, Zap } from 'lucide-react'

export default async function ExpenseLoggingPage() {
  const properties = await (prisma as any).property.findMany();
  const allCategories = await (prisma as any).expenseCategory.findMany({
    include: { children: true, ledger: true }
  });
  const allLedgers = await (prisma as any).financialLedger.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="py-12 px-6 max-w-5xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border border-border pb-10 gap-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.75rem] bg-brand/10 flex items-center justify-center">
            <Landmark className="w-8 h-8 text-brand" />
          </div>
          <div>
            <Link
              href="/expenses"
              className="inline-flex items-center text-[9px]  text-muted-foreground hover:text-brand transition-colors mb-3 group"
            >
              <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Wealth Ledger
            </Link>
            <h1 className="text-display font-weight-display text-foreground dark:text-foreground leading-none">Treasury Entry Hub</h1>
            <p className="text-[10px] text-muted-foreground  tracking-[0.3em] mt-3">Fiscal Materialization v3.1</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--primary)]/10 px-4 py-2 rounded-[8px] border border-[var(--primary)]/20">
            <ShieldAlert className="w-4 h-4 mr-3 text-[var(--primary)]" />
            <span className="text-[9px]  text-[var(--primary)] dark:text-[var(--primary)] leading-none">Governance Signal: Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <ExpenseFormClient properties={properties} allCategories={allCategories} allLedgers={allLedgers} />
      </div>

      {/* Footer panel — Glassmorphic Integrity Anchor */}
      <div className="bg-card/40 dark:bg-card border border-border border-border rounded-[8px] p-6 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="flex items-center gap-8">
          <div className="w-16 h-16 rounded-[1.75rem] bg-muted dark:bg-card flex items-center justify-center shrink-0">
             <History className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl text-foreground dark:text-foreground leading-none">System Integrity Anchored</p>
            <div className="flex items-center gap-3 mt-3">
               <Zap className="w-3 h-3 text-brand" />
               <p className="text-[10px] text-muted-foreground ">Double-Entry Ledger Verified</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Link
            href="/expenses"
            className="h-14 px-8 bg-card dark:bg-card border border-border border-border text-[10px] rounded-[8px] hover:bg-muted dark:hover:bg-muted transition-all  flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-3 text-muted-foreground" />
            Wealth Registry
          </Link>
          <Link
            href="/settings/audit"
            className="h-14 px-8 bg-card dark:bg-brand text-foreground text-[10px] rounded-[8px] hover:shadow-brand/60 transition-all  flex items-center justify-center"
          >
            <Shield className="w-4 h-4 mr-3" />
            View Audit Trail
          </Link>
        </div>
      </div>
    </div>
  )
}
