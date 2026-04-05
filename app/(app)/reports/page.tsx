import prisma from '@/lib/prisma'
import ReportHubClient from './ReportHubClient'
import { BrainCircuit, ShieldCheck, History, ArrowRight } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui-finova'

export default async function ReportsPage() {
  const properties = await (prisma as any).property.findMany();

  return (
    <div className="py-12 px-8 max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700">
      
      {/* HEADER: INTELLIGENCE HUB OVERHAUL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border dark:border-surface-800 pb-10 gap-8">
        <div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-14 h-14 rounded-3xl bg-brand/10 flex items-center justify-center transition-transform hover:scale-110">
               <BrainCircuit className="w-7 h-7 text-brand fill-brand" />
            </div>
            <div>
               <h1 className="text-4xl font-black italic tracking-tighter text-foreground dark:text-white uppercase leading-none">Intelligence <span className="text-brand">Hub</span></h1>
               <p className="text-slate-400 font-bold tracking-[0.3em] uppercase text-[10px] mt-2">Strategic Fiscal Analysis & Reporting Engine</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
             <Badge className="bg-brand/5 text-brand border-brand/20 px-4 py-2 text-[10px] font-black uppercase tracking-widest leading-none">
                <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Analysis Logic Bound
             </Badge>
        </div>
      </div>

      {/* CORE HUB INTERFACE */}
      <div className="grid grid-cols-1 gap-12">
        <ReportHubClient properties={properties} />
      </div>

      {/* AUDIT BUMPER: FINOVA STANDARD */}
      <Card className="bg-surface-900 dark:bg-surface-900 border-none rounded-[3rem] p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-premium-lg group overflow-hidden relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full -mr-40 -mt-40 transition-transform duration-700 group-hover:scale-110" />
          <div className="flex items-center space-x-8 relative z-10">
             <div className="w-20 h-20 rounded-[2rem] bg-[var(--primary-muted)]0/10 flex items-center justify-center">
                <History className="w-10 h-10 text-brand" />
             </div>
             <div className="space-y-2">
                <p className="text-white font-black uppercase italic tracking-tighter text-2xl leading-none">Predictive Audit Readiness</p>
                <p className="text-slate-400 font-medium text-xs tracking-wide uppercase opacity-70">Engineered for 100% GAAP compliance and IRS reporting integrity.</p>
             </div>
          </div>
          <Button variant="primary" className="h-14 px-10 rounded-3xl bg-card text-foreground hover:bg-slate-50 transition-all font-black uppercase tracking-widest relative z-10 shadow-xl">
             Enter Audit Mode <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
          </Button>
      </Card>
    </div>
  )
}
