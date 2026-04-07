import { Card, Button } from '@/components/ui-finova'
import { Plus, Send, ArrowRightLeft, Download, Activity, Zap, LayoutDashboard } from 'lucide-react'
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
    <div className="h-[200px] border border-dashed border-border rounded-[8px] bg-muted/30 flex items-center justify-center text-[9px]  text-muted-foreground">
       [ TELEMETRY_PROTOCOL_FAILURE ]
    </div>
  );

  return <DashboardClientGrid data={data} />;
}

export default async function FinovaDashboard() {
  return (
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-12 pt-10">
      {/* ── MERCURY: DASHBOARD HEADER (Welcome Block) ─────────────────────────── */}
      <div className="mb-10">
        <h1 className="text-display font-display text-foreground">Welcome, Rajm</h1>
        <p className="text-[13px] font-[360] text-muted-foreground mt-1">Portfolio-level macro analysis and risk aggregation</p>
      </div>

      {/* ── MERCURY: ACTION STRIP (Tactical Buttons) ───────────────────────────── */}
      <div className="flex items-center gap-2 mb-8">
        <Button variant="primary" size="sm" className="bg-[#5266EB] hover:bg-[#5266EB]/90 h-8 px-4 rounded-full text-[13px] border-none">
          <Send size={14} className="mr-2" /> Send
        </Button>
        <Button variant="secondary" size="sm" className="h-8 px-4 rounded-full text-[13px]">
          <ArrowRightLeft size={14} className="mr-2" /> Transfer
        </Button>
        <Button variant="secondary" size="sm" className="h-8 px-4 rounded-full text-[13px]">
          <Plus size={14} className="mr-2" /> Deposit
        </Button>
        <Button variant="secondary" size="sm" className="h-8 px-4 rounded-full text-[13px]">
           Request
        </Button>
        <div className="h-6 w-[1px] bg-[#1C1C26] mx-2" />
        <ExportControls />
      </div>

      <Suspense fallback={<MacroSkeleton />}>
        <ReconTerminal />
      </Suspense>
    </div>
  )
}
