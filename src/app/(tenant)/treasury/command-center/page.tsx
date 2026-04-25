import { getGlobalExecutiveMetrics, getCollectionVelocity } from "@/src/services/analytics.service";
import DashboardKPI from "@/components/ui/DashboardKPI";
import VelocityHeatmap from "@/components/ui/VelocityHeatmap";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { Landmark, Zap, BarChart3, History, ArrowRight } from "lucide-react";
import Link from "next/link";
import BillingBatchForm from "@/components/treasury/BillingBatchForm";

export default async function CommandCenterPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const { period } = await searchParams;
  const targetPeriod = period || "2026-04";

  // 1. DATA HARVESTING (ANALYTICAL MATRIX)
  const [executiveMetrics, collectionVelocity] = await Promise.all([
    getGlobalExecutiveMetrics(session.organizationId, targetPeriod),
    getCollectionVelocity(session.organizationId, targetPeriod)
  ]);

  return (
    <div className="min-h-screen bg-background p-8 space-y-12">
      {/* ── 1. MISSION CONTROL HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/5">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Treasury Node // V4.1</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Command Center</h1>
          <p className="text-sm text-zinc-500 font-mono tracking-widest uppercase">Fiscal Orchestration & Monitoring</p>
        </div>

        <div className="flex items-center gap-4 bg-zinc-950/50 p-2 rounded-xl border border-white/5 backdrop-blur-md">
          <div className="px-4 py-2">
            <span className="text-[9px] block text-zinc-600 uppercase tracking-widest mb-1">Active Period</span>
            <span className="font-mono text-zinc-300 font-bold">{targetPeriod}</span>
          </div>
          <Link 
            href="/tenants/onboard"
            className="flex items-center gap-3 px-6 py-3 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white transition-all group"
          >
            Onboard Tenant <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── 2. EXECUTIVE KPI MATRIX ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardKPI 
          title="Net Operating Income" 
          value={executiveMetrics.noi.toNumber()} 
          type="currency" 
          trend="+12.4%" 
        />
        <DashboardKPI 
          title="Total Arrears" 
          value={executiveMetrics.totalArrears.toNumber()} 
          type="currency" 
          alert={executiveMetrics.totalArrears.gt(0)} 
        />
        <DashboardKPI 
          title="Global Occupancy" 
          value={executiveMetrics.occupancyRate} 
          type="percentage" 
          trend={executiveMetrics.occupancyRate > 90 ? "OPTIMAL" : "SUB_PAR"} 
        />
      </div>

      {/* ── 3. COLLECTION VELOCITY & BATCH CONTROL ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <VelocityHeatmap data={{
            totalBilled: collectionVelocity.totalBilled.toNumber(),
            collected: collectionVelocity.collected.toNumber(),
            remaining: collectionVelocity.remaining.toNumber(),
            velocityPercentage: collectionVelocity.velocityPercentage
          }} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-xl border border-white/5 bg-zinc-950/30 backdrop-blur-md space-y-6">
             <div className="flex items-center gap-3 mb-2">
               <Zap className="w-4 h-4 text-emerald-500" />
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-100">Payroll Batch Execution</h3>
             </div>
             
             <p className="text-[11px] text-zinc-500 leading-relaxed uppercase tracking-wider">
               Manually trigger the monthly billing cycle for the next service period. This will generate all rent and utility charges across the primary asset registry.
             </p>

             <BillingBatchForm />
          </div>

          <div className="p-6 rounded-xl border border-white/5 bg-zinc-950/30 backdrop-blur-md">
             <div className="flex items-center gap-3 mb-6">
               <BarChart3 className="w-4 h-4 text-zinc-500" />
               <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-100">Period Navigator</h3>
             </div>
             <div className="grid grid-cols-3 gap-2">
               {['2026-03', '2026-04', '2026-05'].map(p => (
                 <Link 
                   key={p} 
                   href={`/treasury/command-center?period=${p}`}
                   className={cn(
                     "py-2 text-center rounded-lg border text-[10px] font-mono transition-all",
                     targetPeriod === p ? "bg-zinc-100 text-zinc-950 border-white" : "bg-transparent text-zinc-500 border-white/5 hover:border-white/20"
                   )}
                 >
                   {p}
                 </Link>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* ── 4. RECENT ACTIVITY LOG ────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-3">
          <History className="w-4 h-4" /> Forensic Activity Stream
        </h3>
        <div className="bg-zinc-950/20 rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden">
           <div className="p-4 flex justify-between items-center bg-white/5">
             <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Protocol</span>
             <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Operator</span>
             <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest text-right">Status</span>
           </div>
           {[
             { action: 'WATERFALL_RECON', user: 'SYSTEM', status: 'SUCCESS' },
             { action: 'PAYROLL_BATCH', user: 'ADMIN', status: 'SUCCESS' },
             { action: 'ONBOARD_TENANT', user: 'MANAGER', status: 'SUCCESS' }
           ].map((log, i) => (
             <div key={i} className="p-4 flex justify-between items-center hover:bg-white/[0.02] transition-colors">
               <span className="text-xs font-mono text-zinc-100">{log.action}</span>
               <span className="text-xs font-mono text-zinc-500">{log.user}</span>
               <span className="text-[9px] font-bold text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5">{log.status}</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
