import { Card, Badge, Button } from '@/components/ui-finova'
import { Activity, Zap, LayoutDashboard } from 'lucide-react'
import ExportControls from '@/components/ExportControls'
import DashboardClientGrid from './DashboardClientGrid'
import { getGlobalPortfolioTelemetry } from '@/actions/dashboard-macro.actions'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

// ... MacroSkeleton remains same if not broken ...
function MacroSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} variant="glass" className="p-8 rounded-3xl min-h-[220px] border border-border">
           <div className="flex justify-between items-start mb-10">
              <div className="h-2 w-24 bg-white/5 rounded-full" />
              <div className="h-5 w-5 bg-white/5 rounded-xl" />
           </div>
           <div className="h-8 w-32 bg-white/5 rounded-xl" />
        </Card>
      ))}
    </div>
  )
}

/**
 * RECON_TERMINAL: The Aggregation View (Server Side Fetching)
 */
async function ReconTerminal() {
  const telemetry = await getGlobalPortfolioTelemetry();
  const data = telemetry.success ? telemetry.data : null;

  if (!data) return (
    <div className="h-[200px] border-2 border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-slate-500">
       [ TELEMETRY_PROTOCOL_FAILURE ]
    </div>
  );

  // Delegate the logic and icon rendering to the Client Component
  return <DashboardClientGrid data={data} />;
}

export default async function FinovaDashboard() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <div className="space-y-4">
           <Badge variant="brand" className="px-5 py-2 rounded-3xl font-black uppercase text-[9px] tracking-widest bg-brand/5 border-2 border-brand/20 flex items-center gap-3">
             <LayoutDashboard className="w-4 h-4 text-brand" /> Organization Command Hub (V.2.1)
           </Badge>
           <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-foreground dark:text-foreground uppercase leading-none">
             Treasury <span className="text-brand">Oversight</span>
           </h1>
           <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-[0.4em]">Portfolio-Level Real-Time Macro Analysis</p>
        </div>
        <div className="flex gap-4 items-center">
           <ExportControls />
           <div className="h-12 w-px bg-white/5 hidden md:block" />
           <Badge variant="brand" className="rounded-3xl px-6 py-3 font-black uppercase tracking-widest text-[10px] italic">
             <Zap size={14} className="mr-3 text-foreground animate-pulse" /> LIVE_SYNC_ACTIVE
           </Badge>
        </div>
      </div>

      <Suspense fallback={<MacroSkeleton />}>
        <ReconTerminal />
      </Suspense>
    </div>
  )
}
