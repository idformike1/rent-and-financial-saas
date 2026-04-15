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
  Trash2,
  Loader2,
  Sparkles
} from 'lucide-react'
import { getPropertyAssetPulse, getPropertyLedgerEntries } from '@/actions/analytics.actions'
import { createUnit, updateUnit, updateProperty, deleteProperty } from '@/actions/asset.actions'
import { Card, Badge, Button, Input, MercuryTable, THead, TBody, TR, TD } from '@/components/ui-finova'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from '@/lib/toast'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const unitSchema = z.object({
  unitNumber: z.string().min(1, "Required"),
  type: z.string().min(2, "e.g. Standard Apartment"),
  category: z.string().min(1, "Required"),
  marketRent: z.number().min(0)
})

const propertyEditSchema = z.object({
  name: z.string().min(2, "Required"),
  address: z.string().min(5, "Address too short")
})

type UnitForm = {
  unitNumber: string;
  type: string;
  category: string;
  marketRent: number;
}

type PropertyEditForm = z.infer<typeof propertyEditSchema>

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
  const router = useRouter()
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

  const { register, handleSubmit, reset: resetUnitForm, formState: { errors } } = useForm<UnitForm>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      category: 'FLAT',
      marketRent: 0
    }
  });

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEditForm, formState: { errors: editErrors } } = useForm<PropertyEditForm>({
    resolver: zodResolver(propertyEditSchema),
    defaultValues: {
      name: propertyName,
      address: ''
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
        resetUnitForm();
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

  const onEditProperty = async (formData: PropertyEditForm) => {
    setIsSubmitting(true)
    try {
      const result = await updateProperty(propertyId, formData);
      if (result.success) {
        toast.success("Domain Mapping Overridden");
        setIsEditPortfolioModalOpen(false);
        await loadData();
        router.refresh();
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch (e) {
      toast.error("Network sync failure");
    } finally {
      setIsSubmitting(false)
    }
  }

  const onArchiveProperty = async () => {
    if (confirmArchiveText !== propertyName) {
      toast.error("SHIELD_ERROR: Confirmation label mismatch");
      return;
    }
    setIsSubmitting(true)
    try {
      const result = await deleteProperty(propertyId);
      if (result.success) {
        toast.success("Resource Decommissioned Successfully");
        router.push('/properties');
      } else {
        toast.error(result.message || "Decommissioning failed");
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
      <div className="space-y-6 animate-in fade-in duration-300 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-border pb-10">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-background divide-x divide-white/10">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 text-left group">
               <div className="flex justify-between items-start mb-6">
                 <Skeleton className="w-32 h-3 rounded" />
                 <Skeleton className="w-4 h-4 rounded-full" />
               </div>
               <Skeleton className="w-40 h-10 mb-4 rounded" />
               <Skeleton className="w-24 h-3 mt-3 rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="h-[600px] flex flex-col items-center justify-center p-6 text-center space-y-6 border border-rose-500/20 bg-rose-500/5 rounded-[8px]">
         <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10 text-rose-500" />
         </div>
         <div>
            <h3 className="text-[24px] font-display text-foreground leading-none">Sovereign_Audit_Halt</h3>
            <p className="text-muted-foreground text-[14px] mt-2">{error || 'Unknown Pipeline Interruption'}</p>
         </div>
         <Button variant="secondary" onClick={() => window.location.reload()} className="h-10 px-8 rounded-full border-rose-500/30 text-rose-500 hover:bg-rose-500/10">Re-Initialize Pipeline</Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-12">
      
      {/* UNIVERSAL MERCURY HEADER BLOCK */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="brand" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">Property Hub</Badge>
            <Badge variant="default" className="font-mono text-[10px] opacity-40">ID: {propertyId.slice(0, 8)}</Badge>
          </div>
          <h1 className="text-[28px] font-display text-foreground tracking-tight leading-none mt-2">
            {propertyName}
          </h1>
          <p className="text-[15px] text-muted-foreground">
            Asset performance vectors and clinical level compliance matrix
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isSovereign && (
            <>
              <Button 
                variant="secondary" 
                onClick={() => setIsEditPortfolioModalOpen(true)}
                className="h-10 px-4 rounded-full text-[13px] font-bold"
              >
                <Edit2 className="w-3.5 h-3.5 mr-2" />
                Edit Asset
              </Button>
              <Button 
                variant="danger" 
                className="h-10 px-4 rounded-full text-[13px] font-bold opacity-50 hover:opacity-100"
                onClick={() => setIsArchiveModalOpen(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Archive
              </Button>
            </>
          )}
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="h-10 px-6 rounded-full text-[13px] font-bold bg-[#5D71F9] hover:bg-[#5D71F9]/90 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Provision Unit
          </Button>
        </div>
      </div>

      {/* STEP 1: FISCAL HUD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border border-border bg-card divide-x divide-border overflow-hidden rounded-xl shadow-sm">
        
        {/* NOI */}
        <button 
          onClick={() => setDrillDownType('NOI')}
          className="p-8 text-left hover:bg-white/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Net Operating Income</span>
             <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-mercury-green transition-colors" />
          </div>
          <div className={cn("text-[28px] font-display tracking-tight", data.hud.noi >= 0 ? "text-mercury-green" : "text-rose-500")}>
             <span className="font-finance">${data.hud.noi.toLocaleString()}</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Verified FY2026</p>
        </button>

        {/* ADJUSTED NOI */}
        <button 
          onClick={() => setDrillDownType('ADJ_NOI')}
          className="p-8 text-left hover:bg-white/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Adjusted NOI</span>
             <Activity className="w-4 h-4 text-muted-foreground group-hover:text-vibrant-blue transition-colors" />
          </div>
          <div className="text-[28px] font-display text-foreground tracking-tight font-finance">
             <span className="font-finance">${data.hud.adjustedNoi.toLocaleString()}</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium tracking-tight underline decoration-border/50">OPEX Adjusted Flow</p>
        </button>

        {/* REVENUE LEAKAGE */}
        <button 
          onClick={() => setDrillDownType('LEAKAGE')}
          className="p-8 text-left hover:bg-white/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Revenue Leakage</span>
             <AlertCircle className="w-4 h-4 text-muted-foreground group-hover:text-rose-500 transition-colors" />
          </div>
          <div className={cn("text-[28px] font-display tracking-tight", data.hud.revenueLeakage > 10 ? "text-rose-500" : "text-foreground")}>
             <span className="font-finance">{data.hud.revenueLeakage}%</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Market Contract Delta</p>
        </button>

        {/* COLLECTION EFFICIENCY */}
        <button 
          onClick={() => setDrillDownType('COLLECTION')}
          className="p-8 text-left hover:bg-white/[0.02] transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
             <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Collection Ratio</span>
             <ShieldCheck className="w-4 h-4 text-muted-foreground group-hover:text-mercury-green transition-colors" />
          </div>
          <div className={cn("text-[28px] font-display tracking-tight", data.hud.collectionEfficiency >= 90 ? "text-mercury-green" : "text-amber-500")}>
             <span className="font-finance">{data.hud.collectionEfficiency}%</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/40 font-medium">Current_Cycle_Inflow</p>
        </button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
         
         {/* STEP 2: EXPENSE WATERFALL (SVG ENGINE) */}
         <div className="lg:col-span-1 space-y-6">
            <h3 className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest mb-4 flex items-center gap-3">
               <History className="w-4 h-4" /> Fiscal Materialization
            </h3>
            <Card className="bg-card border-border p-10 h-[480px] flex flex-col justify-between relative overflow-hidden group rounded-2xl">
               <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none group-hover:opacity-10 transition-opacity">
                  <svg width="100%" height="100%" viewBox="0 0 200 200" className="rotate-90">
                     <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-vibrant-blue" />
                  </svg>
               </div>
               
               <div className="space-y-12 relative z-10 w-full">
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-6">
                     <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">Gross Revenue</span>
                     <span className="text-mercury-green font-finance text-[17px] font-medium">+${data.waterfall.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-6 pl-8">
                     <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">OpEx</span>
                     <span className="text-rose-500/80 font-finance text-[17px] font-medium">-${data.waterfall.opex.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-white/[0.04] pb-6 pl-8">
                     <span className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">CapEx</span>
                     <span className="text-rose-500/80 font-finance text-[17px] font-medium">-${data.waterfall.capex.toLocaleString()}</span>
                  </div>
               </div>

               <div className="pt-12 border-t border-vibrant-blue/20 relative z-10">
                  <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest mb-3">Net Cash Yield</p>
                  <div className="text-[32px] font-display text-foreground font-finance drop-shadow-sm">
                     ${data.waterfall.netCash.toLocaleString()}
                  </div>
               </div>
            </Card>
         </div>

         {/* STEP 3: THE MATRIX (HEATMAP) */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-3">
                 <Building2 className="w-4 h-4" /> Asset Compliance Matrix
              </h3>
              <div className="flex gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-mercury-green" />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Prime</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Watchlist</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Default</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {data.units.map(unit => (
                 <button 
                   key={unit.id}
                   onClick={() => setEditingUnit(unit)}
                   className={cn(
                     "border border-border bg-card p-6 rounded-2xl flex flex-col justify-between h-[130px] text-left group relative transition-all active:scale-[0.97] hover:border-vibrant-blue/20",
                     unit.occupancy ? "opacity-100" : "opacity-30 hover:opacity-100 transition-all cursor-pointer"
                   )}
                 >
                    <div className="flex justify-between items-start">
                       <span className="text-[18px] font-display font-medium text-foreground">{unit.unitNumber}</span>
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full",
                         unit.riskScore === 'GREEN' ? "bg-mercury-green" :
                         unit.riskScore === 'YELLOW' ? "bg-amber-500" :
                         "bg-rose-500 animate-pulse"
                       )} />
                    </div>
                    <div className="space-y-1">
                       <p className="text-[12px] text-muted-foreground truncate font-medium">{unit.tenantName || 'VACANT_SIGNAL'}</p>
                       <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            unit.occupancy ? "text-mercury-green/60" : "text-muted-foreground/30"
                          )}>
                             {unit.occupancy ? 'Active' : 'Void'}
                          </span>
                          {unit.occupancy && (
                            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                       </div>
                    </div>
                 </button>
               ))}
            </div>
         </div>

      </div>

      {/* DRILL-DOWN OVERLAY (SURVEILLANCE) */}
      <AnimatePresence>
        {drillDownType && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-full max-w-4xl h-full border-l border-border bg-background flex flex-col overflow-hidden shadow-2xl"
             >
                <div className="p-10 border-b border-border flex justify-between items-center bg-card">
                   <div className="space-y-1">
                      <h2 className="text-[28px] font-display text-foreground leading-tight tracking-tight">Ledger Surveillance</h2>
                      <p className="text-[12px] text-vibrant-blue font-bold uppercase tracking-[0.2em]">{propertyName} // Drill-Down: {drillDownType}</p>
                   </div>
                   <button 
                    onClick={() => setDrillDownType(null)}
                    className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                   >
                      <X className="w-5 h-5 text-muted-foreground" />
                   </button>
                </div>
                
                <div className="flex-1 p-10 overflow-y-auto space-y-8 scrollbar-hide">
                   <div className="flex items-center gap-6">
                      <div className="relative flex-1">
                         <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/40" />
                         <input 
                           placeholder="SCAN_LEADGER_POOL..." 
                           className="w-full bg-card border border-border h-14 pl-14 pr-6 text-[13px] text-foreground outline-none focus:border-white/20 transition-all rounded-xl placeholder:text-muted-foreground/20 font-mono"
                         />
                      </div>
                   </div>

                   {drillDownLoading ? (
                      <div className="h-64 flex flex-col items-center justify-center space-y-6 opacity-40">
                         <Loader2 className="w-8 h-8 text-vibrant-blue animate-spin" />
                         <p className="text-[11px] font-bold uppercase tracking-widest">Parsing Ledger Streams...</p>
                      </div>
                   ) : drillDownEntries.length === 0 ? (
                      <div className="flex items-center justify-center h-[300px] border border-dashed border-border rounded-2xl flex-col space-y-5">
                         <Search className="w-10 h-10 text-muted-foreground/20" />
                         <p className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">No records materialized in buffer</p>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 gap-4">
                         {drillDownEntries.map((e: any) => (
                           <div key={e.id} className="p-6 border border-border bg-card/50 rounded-2xl flex justify-between items-center group hover:border-vibrant-blue/20 transition-all">
                              <div className="space-y-1.5">
                                 <div className="flex items-center gap-3">
                                    <span className="text-[11px] text-muted-foreground font-mono">{new Date(e.transactionDate).toLocaleDateString()}</span>
                                    <Badge variant="default" className="text-[9px] py-0 px-2 font-bold uppercase tracking-widest bg-white/[0.03] border-white/5">{e.expenseCategory?.name || 'GEN_MISC'}</Badge>
                                 </div>
                                 <p className="text-foreground font-medium text-[15px] tracking-tight">{e.description}</p>
                              </div>
                              <div className={cn("text-[20px] font-finance tabular-nums", e.amount < 0 ? "text-rose-500" : "text-mercury-green")}>
                                 {e.amount < 0 ? '-' : '+'}${Math.abs(e.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                              </div>
                           </div>
                         ))}
                      </div>
                   )}
                </div>

                <div className="p-10 bg-card border-t border-border flex items-center justify-between">
                   <div className="flex items-center gap-6 opacity-30">
                      <History className="w-6 h-6" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Audit Stability: Immutalized</span>
                   </div>
                   <Button variant="secondary" onClick={() => window.location.href = '/transactions'} className="rounded-full h-11 px-8 font-bold text-[13px]">Master Ledger Pool</Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD UNIT MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-lg bg-card border border-border p-10 rounded-3xl relative shadow-2xl"
             >
                <button 
                  onClick={() => setIsAddModalOpen(false)} 
                  className="absolute top-10 right-10 w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-all group"
                >
                   <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </button>
                <div className="mb-10 space-y-2">
                   <h2 className="text-[28px] font-display text-foreground leading-tight tracking-tight">Resource Provisioning</h2>
                   <p className="text-[14px] text-muted-foreground tracking-tight">Initial structural asset allocation</p>
                </div>
                
                <form onSubmit={handleSubmit(onAddUnit)} className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Structural ID</label>
                      <Input 
                        {...register('unitNumber')} 
                        className="bg-background/50 border-border h-14 px-6 text-[16px] font-medium text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl placeholder:text-muted-foreground/20" 
                        placeholder="e.g. N-101" 
                      />
                      {errors.unitNumber && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{errors.unitNumber.message}</p>}
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Hardware Type</label>
                         <Input 
                           {...register('type')} 
                           className="bg-background/50 border-border h-14 px-6 text-[15px] font-medium text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl" 
                           placeholder="Standard Unit" 
                         />
                         {errors.type && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{errors.type.message}</p>}
                      </div>
                      <div className="space-y-4">
                         <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Market Rent ($)</label>
                         <Input 
                           {...register('marketRent', { valueAsNumber: true })} 
                           className="bg-background/50 border-border h-14 px-6 text-[15px] font-mono text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl font-finance" 
                           placeholder="0.00" 
                           type="number" 
                           step="0.01" 
                         />
                         {errors.marketRent && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{errors.marketRent.message}</p>}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Atomic Category</label>
                      <div className="bg-background/50 border border-border rounded-xl overflow-hidden focus-within:border-vibrant-blue transition-all">
                        <select 
                          {...register('category')} 
                          className="w-full bg-transparent h-14 px-6 text-[14px] font-bold uppercase tracking-widest text-foreground outline-none appearance-none cursor-pointer"
                        >
                           <option value="FLAT" className="bg-card">FLAT (RESIDENTIAL)</option>
                           <option value="STORE" className="bg-card">STORE (COMMERCIAL)</option>
                           <option value="SHUTTER" className="bg-card">SHUTTER (RETAIL)</option>
                        </select>
                      </div>
                      {errors.category && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{errors.category.message}</p>}
                   </div>

                   <Button 
                     disabled={isSubmitting} 
                     className="w-full h-16 rounded-full text-[14px] font-bold uppercase tracking-[0.2em] bg-vibrant-blue hover:bg-vibrant-blue/90 text-white shadow-xl transition-all"
                   >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Materializing...</div>
                      ) : (
                        <div className="flex items-center gap-2">Initiate Deployment <ShieldCheck className="w-5 h-5" /></div>
                      )}
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT UNIT MODAL */}
      <AnimatePresence>
        {editingUnit && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-md bg-card border border-border p-10 rounded-3xl relative shadow-2xl"
             >
                <button 
                  onClick={() => setEditingUnit(null)} 
                  className="absolute top-10 right-10 w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-all group"
                >
                   <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </button>
                <div className="mb-10 space-y-2">
                   <h2 className="text-[24px] font-display text-foreground leading-tight tracking-tight">Asset {editingUnit.unitNumber}</h2>
                   <p className="text-muted-foreground text-[12px] font-bold uppercase tracking-widest">Clinical Protocol Override</p>
                </div>
                
                <div className="space-y-10">
                   <div className="space-y-6">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Integrity State</label>
                      <div className="grid grid-cols-1 gap-3">
                         {[
                           { id: 'OPERATIONAL', label: 'OPERATIONAL', color: 'text-mercury-green' },
                           { id: 'UNDER_REPAIR', label: 'REPAIR_PROCESS', color: 'text-amber-500' },
                           { id: 'DECOMMISSIONED', label: 'VOID_RESOURCE', color: 'text-rose-500' }
                         ].map(s => (
                           <button 
                             key={s.id} 
                             onClick={() => onUpdateUnit(s.id)}
                             disabled={isSubmitting}
                             className={cn(
                               "w-full h-[60px] rounded-xl border border-border text-[11px] font-bold tracking-widest flex items-center justify-between px-8 hover:bg-white/[0.03] transition-all",
                               editingUnit.maintenanceStatus === s.id ? "border-vibrant-blue bg-vibrant-blue/5" : ""
                             )}
                           >
                              <span className={cn(s.color)}>{s.label}</span>
                              {editingUnit.maintenanceStatus === s.id && <ShieldCheck className="w-4 h-4 text-vibrant-blue" />}
                           </button>
                         ))}
                      </div>
                   </div>
                   
                   <div className="pt-8 border-t border-white/[0.04] space-y-4">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Market Analytical Override ($)</label>
                      <Input 
                        type="number"
                        defaultValue={editingUnit.marketRent || 0}
                        onBlur={(e) => onUpdateUnit(undefined, Number(e.target.value))}
                        disabled={isSubmitting}
                        className="bg-background/50 border-border h-14 px-6 text-[15px] font-finance text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl"
                      />
                      <p className="text-[9px] text-muted-foreground/40 italic pl-1">Auto-commits on loss of focus</p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT PORTFOLIO MODAL */}
      <AnimatePresence>
        {isEditPortfolioModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-lg bg-card border border-border p-10 rounded-3xl relative shadow-2xl"
             >
                <button 
                  onClick={() => setIsEditPortfolioModalOpen(false)} 
                  className="absolute top-10 right-10 w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-all group"
                >
                   <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                </button>
                <div className="mb-10 space-y-2">
                   <h2 className="text-[28px] font-display text-foreground leading-tight tracking-tight">Domain Override</h2>
                   <p className="text-[14px] text-muted-foreground tracking-tight">Asset registry property metadata modification</p>
                </div>
                
                <form onSubmit={handleSubmitEdit(onEditProperty)} className="space-y-10">
                   <div className="space-y-4">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Asset Label</label>
                      <Input 
                        {...registerEdit('name')} 
                        className="bg-background/50 border-border h-14 px-6 text-[16px] font-medium text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl" 
                        placeholder="Property Name" 
                      />
                      {editErrors.name && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{editErrors.name.message}</p>}
                   </div>
                   
                   <div className="space-y-4">
                      <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1">Geospatial Address</label>
                      <Input 
                        {...registerEdit('address')} 
                        className="bg-background/50 border-border h-14 px-6 text-[15px] font-medium text-foreground outline-none focus:border-vibrant-blue transition-all rounded-xl" 
                        placeholder="Full Address" 
                      />
                      {editErrors.address && <p className="text-rose-500 text-[10px] uppercase font-bold tracking-widest pl-1">{editErrors.address.message}</p>}
                   </div>

                   <Button 
                     disabled={isSubmitting} 
                     className="w-full h-16 rounded-full text-[14px] font-bold uppercase tracking-[0.2em] bg-vibrant-blue hover:bg-vibrant-blue/90 text-white shadow-xl transition-all"
                   >
                      {isSubmitting ? (
                        <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin" /> Synchronizing...</div>
                      ) : (
                        <div className="flex items-center gap-2">Commit Vector Changes <Sparkles className="w-5 h-5" /></div>
                      )}
                   </Button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ARCHIVE PORTFOLIO MODAL */}
      <AnimatePresence>
        {isArchiveModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
             <motion.div 
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="w-full max-w-lg bg-card border border-rose-500/20 p-10 rounded-3xl relative shadow-2xl"
             >
                <div className="mb-10 space-y-4 text-center">
                   <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-10 h-10 text-rose-500" />
                   </div>
                   <h2 className="text-[28px] font-display text-foreground leading-tight tracking-tight">Decommission Asset?</h2>
                   <p className="text-[14px] text-muted-foreground leading-relaxed px-4">
                      You are about to permanently purge <span className="text-foreground font-bold">"{propertyName}"</span> from the active material registry. This action is irreversible.
                   </p>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="text-[11px] text-rose-500/60 font-bold uppercase tracking-[0.2em] text-center block">Type <span className="text-rose-500 font-black">"{propertyName}"</span> to confirm</label>
                      <Input 
                        value={confirmArchiveText}
                        onChange={(e) => setConfirmArchiveText(e.target.value)}
                        className="bg-rose-500/5 border-rose-500/20 h-16 px-6 text-center text-[18px] font-display text-rose-500 outline-none focus:border-rose-500/40 transition-all rounded-2xl" 
                        placeholder="SECURITY_CHALLENGE" 
                      />
                   </div>

                   <div className="flex gap-4">
                      <Button 
                        variant="secondary"
                        onClick={() => setIsArchiveModalOpen(false)}
                        className="flex-1 h-14 rounded-full font-bold uppercase tracking-widest border-border hover:bg-white/5"
                      >
                         Abort
                      </Button>
                      <Button 
                        disabled={isSubmitting || confirmArchiveText !== propertyName}
                        onClick={onArchiveProperty}
                        className="flex-1 h-14 rounded-full font-bold uppercase tracking-widest bg-rose-500 hover:bg-rose-600 text-white shadow-lg disabled:opacity-20"
                      >
                         {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Vaporize"}
                      </Button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
