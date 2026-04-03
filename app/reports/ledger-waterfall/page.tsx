'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  getLiveWaterfallData 
} from '@/actions/reports.actions'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ArrowRight, 
  Zap, 
  Layers,
  ShieldCheck,
  Activity as Pulse,
  Maximize2,
  PieChart,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

type Node = { id: string, name: string, color?: string }
type Link = { source: string, target: string, value: number, color?: string }

export default function AxiomWaterfallAnalytics() {
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

  // Check if we have actual data to display
  const hasData = useMemo(() => {
    return data && data.stats && data.stats.totalRevenue > 0;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-8 p-8">
         <div className="w-32 h-32 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_80px_rgba(79,70,229,0.3)]" />
         <h2 className="text-white text-3xl font-black uppercase italic tracking-widest animate-pulse">Materializing Waterfall</h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-12 space-y-16 overflow-x-hidden">
      
      {/* HEADER COMMAND STRIP */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[16px] border-slate-900 pb-12 gap-8">
         <div>
            <div className="flex items-center space-x-6 mb-6">
              <Zap className="w-16 h-16 text-indigo-600" />
              <h1 className="text-7xl font-black italic tracking-tighter text-slate-900 uppercase leading-[0.8]">
                 Axiom Waterfall <br/>Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-3 bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>GAAP V.3 Protocol Active</span>
               </div>
               <button 
                 onClick={fetchWaterfall}
                 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-lg transition-all flex items-center border-2 border-transparent hover:border-indigo-100"
               >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Recalibrate Streams
               </button>
            </div>
         </div>

         {/* TOP STATS */}
         <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full md:w-auto">
            <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Gross Intent</p>
               <h3 className="text-3xl font-black text-emerald-600 tracking-tighter italic">
                  +${data?.stats.totalRevenue.toLocaleString() || '0.00'}
               </h3>
            </div>
            <div className="bg-white border-4 border-slate-900 p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Cost Realization</p>
               <h3 className="text-3xl font-black text-rose-500 tracking-tighter italic">
                  -${data?.stats.totalExpense.toLocaleString() || '0.00'}
               </h3>
            </div>
            <div className="bg-slate-900 p-6 rounded-3xl shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] col-span-2 md:col-span-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-2">Net Liquidity (NOI)</p>
               <h3 className="text-3xl font-black text-white tracking-tighter italic">
                  ${data?.stats.noi.toLocaleString() || '0.00'}
               </h3>
            </div>
         </div>
      </div>

      {/* DYNAMIC WATERFALL CANVAS */}
      <div className="bg-white border-[10px] border-slate-900 rounded-[4rem] p-16 shadow-[32px_32px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden h-[800px] flex flex-col items-center justify-center">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Layers className="w-96 h-96 text-slate-900" />
         </div>

         {!hasData ? (
           <div className="relative z-20 text-center space-y-8 max-w-2xl bg-white/80 backdrop-blur-md p-16 rounded-[3rem] border-4 border-dashed border-slate-200">
              <div className="flex justify-center flex-col items-center">
                 <AlertCircle className="w-24 h-24 text-slate-200 mb-4" />
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-300">Null Revenue Detected</h2>
                 <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4 max-w-sm mx-auto leading-relaxed">
                   The Waterfall Engine requires at least one 'REVENUE' class ledger with linked 'LedgerEntries' to visualize the flow.
                 </p>
              </div>
              <button 
                onClick={() => window.location.href = '/expenses'}
                className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase italic tracking-tighter shadow-[8px_8px_0px_0px_rgba(79,70,229,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center mx-auto"
              >
                 Materialize Ledger Entries <ArrowRight className="w-5 h-5 ml-4 text-indigo-400" />
              </button>
           </div>
         ) : (
           <div className="relative z-10 w-full flex h-full justify-between items-stretch transition-opacity duration-1000">
              
              {/* SOURCE LAYER (REVENUE CATEGORIES) */}
              <div className="w-[200px] flex flex-col justify-center space-y-4">
                 {data?.nodes.filter(n => !n.id.includes('GROSS') && !n.id.includes('EXPENSE') && !n.id.includes('NOI') && n.id.length > 30).slice(0, 8).map(node => (
                    <div key={node.id} className="group cursor-default">
                       <div className="flex items-center justify-end space-x-3 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600 truncate max-w-[120px]">{node.name}</span>
                          <div className="w-3 h-10 bg-slate-900 rounded-lg group-hover:bg-indigo-600 transition-all shadow-md" />
                       </div>
                    </div>
                 ))}
              </div>

              {/* INTERMEDIATE LAYER (PARENT LEDGERS) */}
              <div className="w-[180px] flex flex-col justify-center space-y-6">
                  {data?.nodes.filter(n => n.id.length < 30 && !['GROSS_REVENUE', 'OPERATING_EXPENSES', 'NOI'].includes(n.id)).map(node => (
                    <div key={node.id} className="group relative">
                       <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl transform transition-transform group-hover:scale-105">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">FINANCIAL LEDGER</p>
                          <p className="text-sm font-black italic tracking-tighter truncate">{node.name}</p>
                       </div>
                    </div>
                  ))}
              </div>

              {/* AGGREGATE LAYER (GROSS TOTALS) */}
              <div className="w-[240px] flex flex-col justify-center space-y-20">
                 <div className="bg-emerald-500 border-4 border-slate-900 p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative group">
                    <TrendingUp className="w-8 h-8 text-white absolute top-[-10px] right-[-10px]" />
                    <p className="text-[9px] font-black uppercase text-emerald-900 tracking-widest mb-1">AGGREGATE SOURCE</p>
                    <p className="text-2xl font-black uppercase italic tracking-tighter text-white">GROSS REVENUE</p>
                 </div>
                 <div className="bg-rose-500 border-4 border-slate-900 p-8 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] relative group">
                    <TrendingDown className="w-8 h-8 text-white absolute top-[-10px] right-[-10px]" />
                    <p className="text-[9px] font-black uppercase text-rose-900 tracking-widest mb-1">AGGREGATE SINK</p>
                    <p className="text-2xl font-black uppercase italic tracking-tighter text-white">TOTAL EXPENSES</p>
                 </div>
              </div>

              {/* TERMINAL SINK (NOI) */}
              <div className="w-[300px] flex flex-col justify-center">
                  <div className="bg-slate-900 border-[8px] border-indigo-600 p-12 rounded-[3.5rem] shadow-[24px_24px_0px_0px_rgba(79,70,229,0.3)] animate-in zoom-in-95 duration-500">
                     <Pulse className="w-12 h-12 text-indigo-500 mb-6 animate-pulse" />
                     <h5 className="text-xs font-black uppercase tracking-[0.5em] text-slate-500 mb-3">GAAP Realization</h5>
                     <h4 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-6">NET OPERATING INCOME</h4>
                     <div className="h-1 lg:h-2 bg-indigo-600 rounded-full w-2/3 mb-8" />
                     <button 
                       onClick={() => window.location.href = '/reports/financial-connections'}
                       className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white flex items-center group transition-colors"
                     >
                        Audit Logic Mapping <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
                     </button>
                  </div>
              </div>
              
              {/* DYNAMIC FLOW LINES (VISIBLE ONLY IF HAS DATA) */}
              <div className="absolute inset-0 pointer-events-none opacity-30 z-0">
                <svg className="w-full h-full" viewBox="0 0 1000 800" preserveAspectRatio="none">
                  {/* Revenue Flow */}
                  <path d="M 200 300 C 400 300, 400 300, 600 250" stroke="#10b981" strokeWidth="30" fill="none" className="animate-pulse" />
                  {/* Expense Flow */}
                  <path d="M 200 500 C 400 500, 400 500, 600 550" stroke="#f43f5e" strokeWidth="30" fill="none" className="animate-pulse" />
                  {/* Aggregates to NOI */}
                  <path d="M 750 250 C 850 250, 850 450, 950 450" stroke="#10b981" strokeWidth="60" fill="none" />
                  <path d="M 750 550 C 850 550, 850 550, 950 500" stroke="#f43f5e" strokeWidth="60" fill="none" />
                </svg>
              </div>
           </div>
         )}
      </div>

      {/* FOOTER INTELLIGENCE STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         <div className="bg-white border-4 border-slate-900 p-8 rounded-3xl col-span-2">
            <div className="flex items-center space-x-4 mb-4">
               <PieChart className="w-8 h-8 text-indigo-600" />
               <h5 className="text-xl font-black uppercase italic tracking-tighter">Liquid Distribution</h5>
            </div>
            <p className="text-sm font-bold text-slate-500 leading-relaxed capitalize">
              Revenue streams are dynamically mapped to nodes based on FinancialLedger class metadata. Every payment 
              re-renders the graph velocity to ensure real-time reporting accuracy.
            </p>
         </div>
         <div 
           onClick={() => window.location.href = '/reports'}
           className="bg-slate-900 p-8 rounded-3xl col-span-2 flex items-center justify-between group cursor-pointer overflow-hidden relative border-4 border-slate-900 hover:border-indigo-600 transition-all"
         >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
               <Maximize2 className="w-24 h-24 text-white" />
            </div>
            <div>
               <h5 className="text-white text-xl font-black uppercase italic tracking-tighter">Enterprise Intelligence Hub</h5>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Return to Master Analytics</p>
            </div>
            <ArrowRight className="w-10 h-10 text-indigo-500 group-hover:translate-x-6 transition-transform" />
         </div>
      </div>
    </div>
  )
}
