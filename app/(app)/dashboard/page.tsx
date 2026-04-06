import { Card, Badge, Button } from '@/components/ui-finova'
import { Activity, Zap, LayoutDashboard } from 'lucide-react'
import ExportControls from '@/components/ExportControls'
import DashboardClientGrid from './DashboardClientGrid'
import { getGlobalPortfolioTelemetry } from '@/actions/analytics.actions'
import { Suspense } from 'react'
import { cn } from '@/lib/utils'

function MacroSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6 min-h-[160px] border border-border bg-card">
           <div className="flex justify-between items-start mb-8">
              <div className="h-2 w-24 bg-muted rounded-full" />
              <div className="h-5 w-5 bg-muted rounded-[4px]" />
           </div>
           <div className="h-8 w-32 bg-muted rounded-[4px]" />
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
    <div className="h-[200px] border border-dashed border-border rounded-[8px] bg-muted/30 flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
       [ TELEMETRY_PROTOCOL_FAILURE ]
    </div>
  );

  return <DashboardClientGrid data={data} />;
}

export default async function FinovaDashboard() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight uppercase">
            Treasury Oversight
          </h1>
          <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Portfolio-Level Macro Analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="px-3 py-1.5 font-bold">
            <Zap size={12} className="mr-2 inline-block" /> LIVE SYNC
          </Badge>
          <ExportControls />
        </div>
      </div>

      <Suspense fallback={<MacroSkeleton />}>
        <ReconTerminal />
      </Suspense>
    </div>
  )
}
