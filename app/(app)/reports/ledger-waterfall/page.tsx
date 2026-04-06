'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  getLiveWaterfallData 
} from '@/actions/analytics.actions'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Layers,
  ShieldCheck,
  Activity as Pulse,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  PieChart
} from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui-finova'

type Node = { id: string, name: string, color?: string }
type Link = { source: string, target: string, value: number, color?: string }

export default function WaterfallAnalyticsPage() {
  const [data, setData] = useState<{ nodes: Node[], links: Link[], stats: any } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWaterfall = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getLiveWaterfallData()
      if (res.success && res.data) {
         setData(res.data)
      } else {
         setError(res.error || 'UNABLE_TO_SYNCHRONIZE_WATERFALL')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWaterfall()
  }, [])

  const hasData = useMemo(() => {
    return data && data.stats && data.stats.totalRevenue > 0;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center space-y-8 p-6">
         <div className="w-24 h-24 border-4 border-brand border-t-transparent rounded-full animate-spin shadow-none" />
         <h2 className="text-foreground text-xl  animate-pulse">Materializing Waterfall</h2>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-6 space-y-6 bg-surface-50 dark:bg-surface-950 min-h-screen">
      
      {/* HEADER COMMAND STRIP (PHASE 3 MANDATE: FINOVA CARD WRAPPER) */}
      <Card className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-6 border-none bg-surface-900 text-foreground">
         <div>
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 rounded-[8px] bg-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-brand fill-brand" />
              </div>
              <h1 className="text-display font-weight-display leading-none">
                 Waterfall <br/><span className="text-brand">Analytics</span>
              </h1>
            </div>
            <div className="flex items-center space-x-4">
               <Badge className="bg-muted text-foreground border-border">GAAP V.3 Protocol</Badge>
               <button 
                 onClick={fetchWaterfall}
                 className="text-[10px] text-brand  hover:text-foreground transition-colors flex items-center"
               >
                  <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Recalibrate Streams
               </button>
            </div>
         </div>

         <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full md:w-auto">
            <div className="bg-muted/50 border border-border p-5 rounded-[8px]">
               <p className="text-[9px] text-foreground/40 mb-2">Gross Intent</p>
               <h3 className="text-2xl text-[var(--primary)]">
                  +${data?.stats.totalRevenue.toLocaleString() || '0.00'}
               </h3>
            </div>
            <div className="bg-muted/50 border border-border p-5 rounded-[8px]">
               <p className="text-[9px] text-foreground/40 mb-2">Cost Realization</p>
               <h3 className="text-2xl text-rose-400">
                  -${data?.stats.totalExpense.toLocaleString() || '0.00'}
               </h3>
            </div>
            <div className="bg-brand/20 border border-brand/30 p-5 rounded-[8px] col-span-2 lg:col-span-1">
               <p className="text-[9px] text-foreground/60 mb-2">Net Liquidity (NOI)</p>
               <h3 className="text-2xl text-foreground">
                  ${data?.stats.noi.toLocaleString() || '0.00'}
               </h3>
            </div>
         </div>
      </Card>

      {/* DYNAMIC WATERFALL CANVAS: ENSURING DARK MODE CONTRAST ADHERENCE */}
      <Card className="p-0 overflow-hidden h-[750px] relative border-none bg-card dark:bg-surface-900">
         <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Layers className="w-96 h-96 text-foreground dark:text-foreground" />
         </div>

         {!hasData ? (
           <div className="h-full flex flex-col items-center justify-center p-6 space-y-8">
              <div className="w-20 h-20 rounded-full bg-surface-50 dark:bg-muted flex items-center justify-center">
                 <AlertCircle className="w-10 h-10 text-muted-foreground dark:text-muted-foreground" />
              </div>
              <div className="text-center">
                 <h2 className="text-2xl  text-surface-900 dark:text-foreground">Null Revenue Detected</h2>
                 <p className="text-muted-foreground font-bold  text-[10px] mt-3 max-w-xs leading-relaxed">
                   The Waterfall Engine requires at least one 'REVENUE' class ledger with linked 'LedgerEntries'.
                 </p>
              </div>
              <Button variant="primary" onClick={() => window.location.href = '/reports'}>Enforce Materialization</Button>
           </div>
         ) : (
           <div className="relative z-10 w-full flex h-full justify-between items-stretch p-6">
              {/* SOURCE LAYER (REVENUE CATEGORIES) */}
              <div className="w-[180px] flex flex-col justify-center space-y-4">
                 {data?.nodes.filter(n => n.id.length > 25 && !['GROSS_REVENUE', 'OPERATING_EXPENSES', 'NOI'].includes(n.id)).slice(0, 6).map(node => (
                    <div key={node.id} className="group">
                       <div className="flex items-center justify-end space-x-3">
                          <span className="text-[10px]  text-muted-foreground truncate max-w-[100px]">{node.name}</span>
                          <div className="w-2 h-10 bg-surface-100 dark:bg-muted rounded-full group-hover:bg-brand transition-all" />
                       </div>
                    </div>
                 ))}
              </div>

              {/* FLOW SECTION (SANKY-ISH ENGINE) */}
              <div className="flex-1 px-12 relative flex items-center justify-center">
                 <svg className="w-full h-[400px] opacity-20 dark:opacity-40" viewBox="0 0 800 400">
                   <path d="M 0 100 C 400 100, 400 150, 800 150" stroke="#10b981" strokeWidth="80" fill="none" className="animate-pulse" />
                   <path d="M 0 300 C 400 300, 400 250, 800 250" stroke="#f43f5e" strokeWidth="60" fill="none" className="animate-pulse" />
                 </svg>
                 
                 {/* CORE NODES */}
                 <div className="absolute inset-x-0 inset-y-0 flex items-center justify-between pointer-events-none p-6">
                    <div className="space-y-48">
                        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 px-8 py-4 rounded-[8px]">
                           <p className="text-[10px] text-[var(--primary)]  text-center">Gross Revenue</p>
                        </div>
                        <div className="bg-rose-500/10 border border-rose-500/20 px-8 py-4 rounded-[8px]">
                           <p className="text-[10px] text-rose-500  text-center">Total Costs</p>
                        </div>
                    </div>
                    
                    <div className="bg-surface-900 border border-brand/50 p-6 rounded-[8px] flex flex-col items-center">
                       <Pulse className="w-10 h-10 text-brand mb-6 animate-pulse" />
                       <h5 className="text-[10px]   text-muted-foreground mb-2">GAAP Realization</h5>
                       <h4 className="text-display font-weight-display text-foreground">NET PROFIT</h4>
                    </div>
                 </div>
              </div>

              {/* TERMINAL SINK DETAILS */}
              <div className="w-[180px] flex flex-col justify-center space-y-6">
                 <div className="p-6 bg-surface-50 dark:bg-muted rounded-[8px] space-y-4">
                    <h6 className="text-[10px]  text-muted-foreground border-b border-surface-100 dark:border-surface-700 pb-2">Yield Metrics</h6>
                    <div className="space-y-3">
                       <p className="text-xs text-surface-900 dark:text-foreground">Margin: 64%</p>
                       <p className="text-xs text-surface-900 dark:text-foreground">NOI: +12%</p>
                    </div>
                 </div>
              </div>
           </div>
         )}
      </Card>

      {/* FOOTER INTELLIGENCE STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="md:col-span-2 flex items-center p-6 gap-8">
            <div className="w-16 h-16 rounded-[8px] bg-[var(--primary)] dark:bg-[var(--primary)]/20 flex items-center justify-center shrink-0">
               <PieChart className="w-8 h-8 text-brand" />
            </div>
            <div>
               <h5 className="text-xl  text-surface-900 dark:text-foreground">Distribution Logic Protocol</h5>
               <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
                 Financial data is autonomously routed via class discriminators. The red cost streams are calibrated to ensure peak readability in dark mode without color vibration.
               </p>
            </div>
         </Card>
         <Card className="bg-surface-950 border-brand/20 p-6 flex flex-col justify-center relative group overflow-hidden cursor-pointer" onClick={() => window.location.href = '/reports'}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
               <ArrowRight className="w-24 h-24 text-foreground" />
            </div>
            <h5 className="text-foreground text-lg ">Master Hub</h5>
            <div className="mt-4 flex items-center text-brand text-[10px] ">
               Exit Analytics <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
            </div>
         </Card>
      </div>
    </div>
  )
}
