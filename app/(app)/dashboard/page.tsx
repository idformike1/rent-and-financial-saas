import { Card, Badge, Button, RollingCounter } from '@/components/ui-finova'
import { Activity, Zap, TrendingUp, BarChart3, ShieldCheck, PieChart, ArrowUpRight, ArrowDownRight, LayoutDashboard } from 'lucide-react'
import ExportControls from '@/components/ExportControls'
import { getGlobalPortfolioTelemetry } from '@/actions/dashboard-macro.actions'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

/**
 * MACRO SKELETON: UI PROTOCOL
 * High-density placeholder for asynchronous telemetry hydration.
 */
function MacroSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="glass" className="finova-glass p-8 rounded-[2.5rem] border-white/5 min-h-[220px] animate-pulse">
           <div className="flex justify-between items-start mb-10">
              <div className="h-2 w-24 bg-white/10 rounded-full" />
              <div className="h-5 w-5 bg-white/10 rounded-lg" />
           </div>
           <div className="h-8 w-32 bg-white/10 rounded-xl" />
        </Card>
      ))}
    </div>
  )
}

/**
 * RECON_TERMINAL: The Aggregation View
 */
async function ReconTerminal() {
  const telemetry = await getGlobalPortfolioTelemetry();
  const data = telemetry.success ? telemetry.data : null;

  if (!data) return (
    <div className="h-[200px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-slate-500">
       [ TELEMETRY_PROTOCOL_FAILURE ]
    </div>
  );

  const CARDS = [
    { 
       label: 'Gross Recognition', 
       val: data.current.revenue, 
       color: 'text-brand', 
       icn: BarChart3, 
       delta: data.deltas.revenue,
       subtitle: 'Total Org Revenue' 
    },
    { 
       label: 'Op. Net Income', 
       val: data.current.revenue - data.current.opex, 
       color: 'text-emerald-500', 
       icn: TrendingUp, 
       delta: data.deltas.revenue - data.deltas.opex,
       subtitle: 'Revenue Adjusted for OPEX'
    },
    { 
       label: 'Delinquent Arrears', 
       val: data.current.debt, 
       color: 'text-rose-500', 
       icn: ShieldCheck, 
       delta: data.deltas.debt,
       subtitle: 'Total Portfolio Debt',
       inverse: true
    },
    { 
       label: 'Occupancy Yield', 
       val: data.current.yieldRate, 
       color: 'text-indigo-500', 
       icn: PieChart, 
       delta: data.deltas.yield, 
       isPercent: true,
       subtitle: 'Capacity Saturation'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {CARDS.map((s) => (
        <Card key={s.label} variant="glass" className="finova-glass p-8 rounded-[2.5rem] border-white/5 group hover:border-brand/30 transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
             <s.icn className="w-20 h-20 stroke-[1]" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-widest leading-none mb-2">{s.label}</p>
                  <p className="text-[8px] font-medium text-slate-600 uppercase tracking-widest">{s.subtitle}</p>
               </div>
               <Badge className={cn(
                 "font-mono text-[9px] border-none px-2 py-1 rounded-lg flex items-center gap-1",
                 s.inverse 
                  ? (s.delta > 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500")
                  : (s.delta >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500")
               )}>
                  {s.delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(s.delta).toFixed(1)}%
               </Badge>
            </div>

            <div className="mt-8">
              <h2 className={cn("text-4xl md:text-5xl font-black italic tracking-tighter leading-none font-mono", s.color)}>
                <RollingCounter value={s.val} prefix={s.isPercent ? "" : "$"} suffix={s.isPercent ? "%" : ""} />
              </h2>
              <div className={cn("mt-4 h-1 w-12 rounded-full bg-white/10 transition-all duration-700 group-hover:w-full", s.color.replace('text-', 'bg-'))} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export default async function FinovaDashboard() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div className="space-y-4">
           <Badge variant="brand" className="px-5 py-2 rounded-2xl font-black uppercase text-[9px] tracking-widest bg-brand/5 border-2 border-brand/20 flex items-center gap-3">
             <LayoutDashboard className="w-4 h-4 text-brand" /> Organization Command Hub (V.2.1)
           </Badge>
           <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
             Treasury <span className="text-brand">Oversight</span>
           </h1>
           <p className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.4em]">Portfolio-Level Real-Time Macro Analysis</p>
        </div>
        <div className="flex gap-4 items-center">
           <ExportControls />
           <div className="h-12 w-px bg-white/10 hidden md:block" />
           <Badge variant="brand" className="rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-[10px] italic">
             <Zap size={14} className="mr-3 text-white animate-pulse" /> LIVE_SYNC_ACTIVE
           </Badge>
        </div>
      </div>

      <Suspense fallback={<MacroSkeleton />}>
        <ReconTerminal />
      </Suspense>
    </div>
  )
}
