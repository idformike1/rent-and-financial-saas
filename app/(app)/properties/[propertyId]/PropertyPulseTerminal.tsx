'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Building2, 
  User, 
  ExternalLink, 
  ArrowRight,
  ShieldCheck,
  History,
  Search,
  X,
  FileText,
  Plus,
  Edit2,
  Trash2
} from 'lucide-react'
import { getPropertyAssetPulse, getPropertyLedgerEntries } from '@/actions/reports.actions'
import { createUnit, updateUnit } from '@/actions/unit-mgmt.actions'
import { Card, Badge, Button, RollingCounter } from '@/components/ui-finova'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/lib/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Required"),
  type: z.string().min(2, "e.g. Standard Apartment"),
  category: z.string().min(1, "Required"),
  marketRent: z.coerce.number().min(0)
})

type UnitForm = z.infer<typeof unitSchema>

interface PulseData {
  hud: {
    noi: number
    adjustedNoi: number
    revenueLeakage: number
    collectionEfficiency: number
  }
  waterfall: {
    revenue: number
    opex: number
    capex: number
    netCash: number
  }
  units: {
    id: string
    unitNumber: string
    tenantName: string
    riskScore: 'GREEN' | 'YELLOW' | 'RED'
    occupancy: boolean
    maintenanceStatus?: string
  }[]
}

export default function PropertyPulseTerminal({ propertyId, propertyName }: { propertyId: string, propertyName: string }) {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'MANAGER'
  const isSovereign = ['ADMIN', 'OWNER'].includes(userRole)

  const [data, setData] = useState<PulseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [drillDownType, setDrillDownType] = useState<string | null>(null)
  const [drillDownEntries, setDrillDownEntries] = useState<any[]>([])
  const [drillDownLoading, setDrillDownLoading] = useState(false)
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditPortfolioModalOpen, setIsEditPortfolioModalOpen] = useState(false)
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false)
  const [confirmArchiveText, setConfirmArchiveText] = useState('')
  const [editingUnit, setEditingUnit] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      category: 'FLAT'
    }
  });

  const loadData = async () => {
    try {
      const res: any = await getPropertyAssetPulse(propertyId)
      if (res.success && res.data) {
        setData(res.data)
      } else {
        setError(res.error || 'ANALYSIS_SYNCHRONIZATION_FAILURE')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrillDown = async (type: string) => {
    setDrillDownLoading(true);
    try {
      const entries = await getPropertyLedgerEntries(propertyId, type);
      setDrillDownEntries(entries);
    } catch (e) {
      toast.error("Failed to fetch drill-down records");
    } finally {
      setDrillDownLoading(false);
    }
  }

  useEffect(() => {
    loadData()
  }, [propertyId])

  useEffect(() => {
    if (drillDownType) fetchDrillDown(drillDownType);
  }, [drillDownType])

  const onAddUnit = async (formData: UnitForm) => {
    setIsSubmitting(true)
    try {
      const result = await createUnit({ ...formData, propertyId });
      if (result.success) {
        toast.success("Asset Materialized Successfully");
        setIsAddModalOpen(false);
        reset();
        await loadData();
      } else {
        toast.error(result.message || "Materialization failed");
      }
    } catch (e) {
      toast.error("Network sync failure");
    } finally {
      setIsSubmitting(false)
    }
  }

  const onUpdateUnit = async (status?: string, marketRent?: number) => {
    if (!editingUnit) return;
    setIsSubmitting(true)
    try {
      const result = await updateUnit(editingUnit.id, { 
        maintenanceStatus: status as any, 
        marketRent,
        propertyId 
      });
      if (result.success) {
        toast.success("Asset Overridden Successfully");
        setEditingUnit(null);
        await loadData();
      } else {
        toast.error(result.message || "Override failed");
      }
    } catch (e) {
      toast.error("Network sync failure");
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-12 animate-in fade-in duration-300 pb-20">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Skeleton className="w-24 h-6 rounded" />
              <Skeleton className="w-32 h-6 rounded" />
            </div>
            <Skeleton className="w-80 h-10 rounded" />
            <Skeleton className="w-64 h-3 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="w-32 h-9 rounded-full" />
            <Skeleton className="w-36 h-9 rounded-full" />
          </div>
        </div>

        {/* STEP 1: FISCAL HUD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-background divide-x divide-white/10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-8 text-left group">
               <div className="flex justify-between items-start mb-6">
                 <Skeleton className="w-32 h-3 rounded" />
                 <Skeleton className="w-4 h-4 rounded-full" />
               </div>
               <Skeleton className="w-40 h-10 mb-4 rounded" />
               <Skeleton className="w-24 h-3 mt-3 rounded" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-1 space-y-6">
              <Skeleton className="w-48 h-4 rounded" />
              <Skeleton className="w-full h-[450px] rounded-3xl" />
           </div>
           <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-end mb-4">
                 <Skeleton className="w-64 h-4 rounded" />
                 <Skeleton className="w-32 h-8 rounded" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                 {[...Array(10)].map((_, i) => (
                   <Skeleton key={i} className="w-full h-[140px] rounded-none opacity-50" />
                 ))}
              </div>
           </div>
        </div>

      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center p-12 text-center space-y-6 border border-rose-500/20 bg-rose-500/5 rounded-[3rem]">
         <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500" />
         </div>
         <div>
            <h3 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Sovereign_Audit_Halt</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">{error || 'Unknown Pipeline Interruption'}</p>
         </div>
         <Button variant="secondary" onClick={() => window.location.reload()} className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10">Re-Initialize Pipeline</Button>
      </div>
    )
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-1000 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="brand" className="px-3 py-1 text-[9px] font-black tracking-[0.2em]">{propertyName}</Badge>
            <Badge variant="default" className="px-3 py-1 text-[9px] font-black tracking-[0.2em]">ASSET_ID: {propertyId.slice(0, 8)}</Badge>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            Property <span className="text-brand">Pulse</span> Terminal
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Full-Spectrum Portfolio Intelligence & Unit Control</p>
        </div>
        
        <div className="flex items-center gap-3">
          {isSovereign && (
            <>
              <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-full"
                onClick={() => setIsEditPortfolioModalOpen(true)}
              >
                <Edit2 className="w-3 h-3 mr-2" />
                Edit Asset
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                className="rounded-full opacity-50 hover:opacity-100"
                onClick={() => setIsArchiveModalOpen(true)}
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Archive Portfolio
              </Button>
            </>
          )}
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="glow-orange"
          >
            <Plus className="w-4 h-4 mr-2" />
            Provision New Unit
          </Button>
        </div>
      </div>

      {/* STEP 1: FISCAL HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-background divide-x divide-white/10 overflow-hidden">
        
        {/* NOI */}
        <button 
          onClick={() => setDrillDownType('NOI')}
          className="p-8 text-left hover:bg-card/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Net Operating Income</span>
             <TrendingUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className={cn("text-3xl font-mono tracking-tighter font-finance tabular-nums", data.hud.noi >= 0 ? "text-emerald-500" : "text-rose-500")}>
             <RollingCounter value={data.hud.noi} prefix="$" />
          </div>
          <div className="mt-3 flex items-center gap-2">
             <Badge className="bg-[var(--primary-muted)] text-[var(--primary)] border-none text-[8px] py-0 px-2 font-mono">REALIZED_VALUE_v3</Badge>
          </div>
        </button>

        {/* ADJUSTED NOI */}
        <button 
          onClick={() => setDrillDownType('ADJ_NOI')}
          className="p-8 text-left hover:bg-card/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Adjusted NOI (OPEX-Only)</span>
             <Activity className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand transition-colors" />
          </div>
          <div className="text-3xl font-mono text-foreground tracking-tighter font-finance tabular-nums">
             <RollingCounter value={data.hud.adjustedNoi} prefix="$" />
          </div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3 underline decoration-slate-800">Operational Health Index</p>
        </button>

        {/* REVENUE LEAKAGE */}
        <button 
          onClick={() => setDrillDownType('LEAKAGE')}
          className="p-8 text-left hover:bg-card/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Revenue Leakage (Gap)</span>
             <AlertCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
          </div>
          <div className={cn("text-3xl font-mono tracking-tighter font-finance tabular-nums", data.hud.revenueLeakage > 10 ? "text-rose-500" : "text-slate-300")}>
             <RollingCounter value={data.hud.revenueLeakage} suffix="%" />
          </div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3">Market vs Contract Delta</p>
        </button>

        {/* COLLECTION EFFICIENCY */}
        <button 
          onClick={() => setDrillDownType('COLLECTION')}
          className="p-8 text-left hover:bg-card/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Collection Efficiency</span>
             <ShieldCheck className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </div>
          <div className={cn("text-3xl font-mono tracking-tighter font-finance tabular-nums", data.hud.collectionEfficiency >= 90 ? "text-emerald-400" : "text-amber-500")}>
             <RollingCounter value={data.hud.collectionEfficiency} suffix="%" />
          </div>
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3">Current_Month_Inflow_Ratio</p>
        </button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         {/* STEP 2: EXPENSE WATERFALL (SVG ENGINE) */}
         <div className="lg:col-span-1 space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
               <History className="w-3.5 h-3.5" /> Fiscal Materialization Flow
            </h3>
            <Card className="bg-background border-border p-10 h-[450px] flex flex-col justify-between relative overflow-hidden group">
               <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none group-hover:opacity-20 transition-opacity">
                  <svg width="100%" height="100%" viewBox="0 0 200 200" className="rotate-90">
                     <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-brand" />
                  </svg>
               </div>
               
               <div className="space-y-10 relative z-10 w-full font-mono">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <span className="text-[8px] text-slate-500 uppercase tracking-widest">Gross Revenue</span>
                     <span className="text-emerald-500 font-bold">+${data.waterfall.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4 pl-6">
                     <span className="text-[8px] text-slate-500 uppercase tracking-widest">Operating Expenses</span>
                     <span className="text-rose-500 font-bold">-${data.waterfall.opex.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/5 pb-4 pl-6">
                     <span className="text-[8px] text-slate-500 uppercase tracking-widest">Capital Expenditure</span>
                     <span className="text-rose-500 font-bold">-${data.waterfall.capex.toLocaleString()}</span>
                  </div>
               </div>

               <div className="pt-10 border-t border-brand/30 relative z-10">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Net Cash Realization</p>
                  <div className="text-4xl font-black text-foreground italic tracking-tighter font-finance tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                     ${data.waterfall.netCash.toLocaleString()}
                  </div>
               </div>
            </Card>
         </div>

         {/* STEP 3: THE MATRIX (HEATMAP) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-3">
                 <Building2 className="w-3.5 h-3.5" /> Occupancy & Behavioral Risk Matrix
              </h3>
              <div className="flex gap-4">
                 <button 
                   onClick={() => setIsAddModalOpen(true)}
                   className="bg-brand text-foreground font-black text-[9px] px-6 py-2 rounded-xl flex items-center hover:bg-brand/80 transition-all uppercase tracking-widest mr-4"
                 >
                   <Plus className="w-3 h-3 mr-2" /> Materialize
                 </button>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Prime</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Watchlist</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Default/Void</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {data.units.map(unit => (
                 <button 
                   key={unit.id}
                   onClick={() => setEditingUnit(unit)}
                   className={cn(
                     "border border-border bg-background p-6 flex flex-col justify-between h-[140px] text-left group relative transition-all active:scale-[0.98]",
                     unit.occupancy ? "hover:border-white/30" : "opacity-40 grayscale grayscale hover:grayscale-0 transition-all cursor-not-allowed"
                   )}
                 >
                    <div className="flex justify-between items-start">
                       <span className="text-xl font-bold font-mono text-foreground tracking-tighter italic">{unit.unitNumber}</span>
                       <div className={cn(
                         "w-2 h-2 rounded-full",
                         unit.riskScore === 'GREEN' ? "bg-[var(--primary)] shadow-[0_0_8px_rgba(255,87,51,0.4)]" :
                         unit.riskScore === 'YELLOW' ? "bg-amber-500" :
                         "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)] animate-pulse"
                       )} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest truncate">{unit.tenantName}</p>
                       <div className="flex items-center justify-between">
                         <span className={cn(
                           "text-[7px] font-black uppercase tracking-widest",
                           unit.occupancy ? "text-emerald-500" : "text-slate-500"
                         )}>
                            {unit.occupancy ? 'ACTIVE_TENURE' : 'VACANT_ASSET'}
                         </span>
                         {unit.occupancy && (
                           <ExternalLink className="w-3 h-3 text-brand opacity-0 group-hover:opacity-100 transition-opacity" />
                         )}
                       </div>
                    </div>
                 </button>
               ))}
            </div>
         </div>

      </div>

      {/* DRILL-DOWN OVERLAY (SURVEILLANCE) */}
      {drillDownType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex justify-end p-4 lg:p-10 animate-in fade-in duration-300">
           <Card className="w-full max-w-4xl h-full border-none bg-slate-900 shadow-2xl rounded-[3rem] flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-500">
              <div className="p-12 border-b border-white/5 flex justify-between items-center bg-background">
                 <div>
                    <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none">Registry Surveillance</h2>
                    <p className="text-[10px] font-black text-brand uppercase tracking-[0.3em] mt-3">{propertyName} // Drill-Down: {drillDownType}</p>
                 </div>
                 <button 
                  onClick={() => setDrillDownType(null)}
                  className="w-14 h-14 rounded-3xl bg-white/3 border border-border flex items-center justify-center hover:bg-white/5 transition-colors"
                 >
                    <X className="w-6 h-6 text-slate-400" />
                 </button>
              </div>
              
              <div className="flex-1 p-12 overflow-y-auto space-y-12">
                 <div className="flex items-center gap-6 mb-8">
                    <div className="relative flex-1">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                       <input 
                         placeholder="SCAN DRILL-DOWN RECORDS..." 
                         className="w-full bg-background border border-white/5 h-16 pl-16 pr-6 text-[10px] uppercase font-black tracking-widest text-foreground outline-none focus:border-brand/40 transition-all rounded-3xl"
                       />
                    </div>
                 </div>

                 {drillDownLoading ? (
                    <div className="h-64 flex flex-col items-center justify-center space-y-4 opacity-40">
                       <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                       <p className="text-[8px] font-black uppercase tracking-[0.4em]">Parsing Ledger Streams...</p>
                    </div>
                 ) : drillDownEntries.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] border-2 border-dashed border-white/5 opacity-10 rounded-[2.5rem] flex-col space-y-4">
                       <Search className="w-12 h-12" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Direct Records Found in Current Buffer</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                       {drillDownEntries.map((e: any) => (
                         <div key={e.id} className="p-8 border border-white/5 bg-background/50 rounded-3xl flex justify-between items-center group hover:border-border transition-all">
                            <div className="space-y-1">
                               <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-mono text-slate-500">{new Date(e.transactionDate).toLocaleDateString()}</span>
                                  <Badge className="bg-white/3 text-slate-400 border-none text-[7px] py-0">{e.expenseCategory?.name || 'GEN'}</Badge>
                               </div>
                               <p className="text-foreground font-bold text-xs uppercase tracking-tight">{e.description}</p>
                            </div>
                            <div className={cn("text-xl font-mono font-finance tabular-nums font-black", e.amount < 0 ? "text-rose-500" : "text-emerald-500")}>
                               {e.amount < 0 ? '-' : '+'}${Math.abs(e.amount).toLocaleString()}
                            </div>
                         </div>
                       ))}
                    </div>
                 )}
              </div>

              <div className="p-12 bg-background border-t border-white/5 flex items-center justify-between">
                 <div className="flex items-center gap-6 opacity-40">
                    <History className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">Immutable Audit Data Verified</span>
                 </div>
                 <Button variant="secondary" onClick={() => window.location.href = '/expenses'}>Go to Master Ledger</Button>
              </div>
           </Card>
        </div>
      )}

      {/* ADD UNIT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <Card className="w-full max-w-lg border border-border bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative">
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="absolute top-10 right-10 text-slate-500 hover:text-foreground"
              >
                 <X className="w-6 h-6" />
              </button>
              <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase mb-10">Resource Materialization</h2>
              <form onSubmit={handleSubmit(onAddUnit)} className="space-y-8">
                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Structural Index Mapping</label>
                    <input {...register('unitNumber')} className="w-full bg-background border border-white/5 h-16 px-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all rounded-3xl" placeholder="e.g. N-101" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Hardware Type</label>
                       <input {...register('type')} className="w-full bg-background border border-white/5 h-16 px-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all rounded-3xl" placeholder="Apartment" />
                    </div>
                    <div>
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Market Rent ($)</label>
                       <input {...register('marketRent')} className="w-full bg-background border border-white/5 h-16 px-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all rounded-3xl" placeholder="0.00" type="number" step="0.01" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-3">Atomic Category</label>
                    <select {...register('category')} className="w-full bg-background border border-white/5 h-16 px-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all rounded-3xl appearance-none">
                       <option value="FLAT">FLAT (RESIDENTIAL)</option>
                       <option value="STORE">STORE (COMMERCIAL)</option>
                       <option value="SHUTTER">SHUTTER (RETAIL)</option>
                    </select>
                 </div>
                 <Button disabled={isSubmitting} className="w-full h-20 text-md font-black uppercase tracking-widest">
                    {isSubmitting ? 'SYNCING...' : 'Initiate Deployment'}
                 </Button>
              </form>
           </Card>
        </div>
      )}

      {/* EDIT UNIT MODAL */}
      {editingUnit && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
           <Card className="w-full max-w-md border border-border bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative">
              <button 
                onClick={() => setEditingUnit(null)} 
                className="absolute top-10 right-10 text-slate-500 hover:text-foreground"
              >
                 <X className="w-6 h-6" />
              </button>
              <div className="mb-10">
                 <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none">Asset {editingUnit.unitNumber}</h2>
                 <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Clinical Override Protocol</p>
              </div>
              
              <div className="space-y-8">
                 <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Integrity Status</label>
                    <div className="grid grid-cols-1 gap-3">
                       {[
                         { id: 'OPERATIONAL', label: 'OPERATIONAL', color: 'text-emerald-500' },
                         { id: 'UNDER_REPAIR', label: 'REPAIR_PHASE', color: 'text-amber-500' },
                         { id: 'DECOMMISSIONED', label: 'VOID_RESOURCE', color: 'text-rose-500' }
                       ].map(s => (
                         <button 
                           key={s.id} 
                           onClick={() => onUpdateUnit(s.id)}
                           className={cn(
                             "w-full h-16 rounded-3xl border border-white/5 text-[10px] font-black uppercase tracking-widest flex items-center justify-between px-8 hover:bg-white/3 transition-all",
                             editingUnit.maintenanceStatus === s.id ? "border-brand bg-brand/5" : ""
                           )}
                         >
                            <span className={cn(s.color)}>{s.label}</span>
                            {editingUnit.maintenanceStatus === s.id && <ShieldCheck className="w-4 h-4 text-brand" />}
                         </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-white/5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-4">Market Analytical Override ($)</label>
                    <input 
                      type="number"
                      defaultValue={editingUnit.marketRent || 0}
                      onBlur={(e) => onUpdateUnit(undefined, Number(e.target.value))}
                      className="w-full bg-background border border-white/5 h-16 px-6 text-sm font-bold text-foreground outline-none focus:border-brand transition-all rounded-3xl"
                    />
                 </div>
              </div>
           </Card>
        </div>
      )}

    </div>
  )
}
