'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import UnitGrid from './UnitGrid';
import UnitSideSheet from './UnitSideSheet';
import { Building2, Plus, Edit2, Trash2, X, ArrowLeft, Receipt, LayoutGrid, AlertCircle, Download, Database } from 'lucide-react';
import { Button, Badge } from '@/components/ui-finova';
import PropertyMetricsHud from '@/components/assets/PropertyMetricsHud';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { updateProperty, deleteProperty, createUnit } from '@/actions/asset.actions';
import { getPropertyLedgerEntries } from '@/actions/analytics.actions';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import DomainSwitcher from '@/components/assets/DomainSwitcher';
import AssetLedgerTable from '../AssetLedgerTable';

interface PropertySovereignClientProps {
  propertyData: any;
  pulseData: any;
  allProperties: any[];
  role?: string;
}

export default function PropertySovereignClient({ 
  propertyData, 
  pulseData, 
  allProperties,
  role 
}: PropertySovereignClientProps) {
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'MONTHLY' | 'YEARLY' | 'ALL_TIME'>('MONTHLY');
  const [drillDownType, setDrillDownType] = useState<string | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditAssetModalOpen, setIsEditAssetModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Buffer states for forms
  const [editPropName, setEditPropName] = useState(propertyData.name);
  const [editPropAddr, setEditPropAddr] = useState(propertyData.address);
  const [isUpdating, setIsUpdating] = useState(false);

  // Ledger Logic
  const [mainLedger, setMainLedger] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  useEffect(() => {
    const fetchMainLedger = async () => {
      const res = await getPropertyLedgerEntries(propertyData.id, 'ALL');
      setMainLedger(res || []);
    };
    fetchMainLedger();
  }, [propertyData.id]);

  useEffect(() => {
    if (drillDownType) {
      const fetchLedger = async () => {
        setIsLedgerLoading(true);
        const res = await getPropertyLedgerEntries(propertyData.id, drillDownType);
        setLedgerEntries(res || []);
        setIsLedgerLoading(false);
      };
      fetchLedger();
    }
  }, [drillDownType, propertyData.id]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const res = await updateProperty(propertyData.id, { name: editPropName, address: editPropAddr });
      if (res.success) {
        toast.success("Asset details updated.");
        setIsEditAssetModalOpen(false);
      }
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    const res = await deleteProperty(propertyData.id);
    if (res.success) {
      toast.success("Asset removed.");
      router.push('/assets');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col gap-8 p-8 animate-in fade-in duration-700 subpixel-antialiased">
      
      {/* ── 1. HEADER + ACTION SYSTEM ─────────────────────────────────────── */}
      <header className="flex items-start justify-between">
        {/* Left: Identity */}
        <div className="flex items-center gap-6">
          <Link href="/assets" className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft size={18} className="text-muted-foreground" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{propertyData.name}</h1>
              <DomainSwitcher properties={allProperties} />
            </div>
            <div className="flex items-center gap-2 text-muted-foreground/60">
              <Building2 className="w-3.5 h-3.5" />
              <p className="text-sm font-medium">{propertyData.address}</p>
            </div>
          </div>
        </div>

        {/* Right: Actions (Separated by Intent) */}
        <div className="flex items-center gap-6">
          {/* Group: Primary */}
          <Button 
            onClick={() => setIsAddUnitModalOpen(true)}
            className="h-9 px-5 bg-brand hover:bg-brand/90 text-white shadow-lg shadow-brand/20 border-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Provision Unit
          </Button>

          {/* Group: Secondary (Safe) */}
          <div className="flex items-center gap-1 border-x border-border/50 px-4">
            <Button variant="ghost" size="sm" onClick={() => setIsEditAssetModalOpen(true)} className="text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Download className="w-3.5 h-3.5 mr-2" /> Export
            </Button>
          </div>

          {/* Group: Risk & Destructive */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => toast.info('Risk remediation engine initializing...')}
              className="bg-amber-500/5 text-amber-500 hover:bg-amber-500/10 border border-amber-500/20"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-2" /> Remediate
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsArchiveModalOpen(true)}
              className="text-destructive/40 hover:text-destructive hover:bg-destructive/5 border-none p-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── 2. CONTEXT BAR ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          {(['MONTHLY', 'YEARLY', 'ALL_TIME'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                timeframe === t ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <Database className="w-3 h-3" /> Node: {propertyData.id.slice(0, 8)}
        </div>
      </div>

      {/* ── 3. KPI SECTION (2-TIER) ───────────────────────────────────────── */}
      <section>
        {pulseData && (
          <PropertyMetricsHud 
            metrics={pulseData.hud} 
            timeframe={timeframe}
            onDrillDown={(type) => setDrillDownType(type)} 
          />
        )}
      </section>

      {/* ── 4. UNITS SECTION ──────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-foreground">Units</h2>
            <Badge variant="default" className="text-[10px] font-bold opacity-60">{propertyData.units?.length || 0}</Badge>
          </div>
          {propertyData.units?.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setIsAddUnitModalOpen(true)} className="text-xs text-brand hover:text-brand/80">
              <Plus className="w-3 h-3 mr-1.5" /> Add Unit
            </Button>
          )}
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <UnitGrid units={propertyData.units} />
        </div>
      </section>

      {/* ── 5. TRANSACTIONS SECTION ───────────────────────────────────────── */}
      <section className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-foreground">Transactions</h2>
            <Badge variant="default" className="text-[10px] font-bold opacity-60">{mainLedger.length}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => toast.info('Log interface pending.')} className="text-xs text-brand hover:text-brand/80">
            <Plus className="w-3 h-3 mr-1.5" /> Log Transaction
          </Button>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <AssetLedgerTable 
            properties={[propertyData]} 
            ledgerEntries={mainLedger}
          />
        </div>
      </section>

      <UnitSideSheet propertyData={propertyData} />

      {/* MODALS */}
      {isEditAssetModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center gap-2"><Edit2 className="w-4 h-4 text-brand" /> Edit Asset Details</h3>
                <button onClick={() => setIsEditAssetModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-muted-foreground">Property Name</label>
                   <input value={editPropName} onChange={(e) => setEditPropName(e.target.value)} className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-muted-foreground">Address</label>
                   <input value={editPropAddr} onChange={(e) => setEditPropAddr(e.target.value)} className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40" />
                </div>
                <Button onClick={handleUpdate} disabled={isUpdating} className="w-full bg-brand h-11 font-bold text-sm">{isUpdating ? 'Saving...' : 'Save Changes'}</Button>
             </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {drillDownType && (
          <div className="fixed inset-0 z-[100] bg-black/60 flex justify-end backdrop-blur-sm">
             <motion.div 
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                className="w-full max-w-4xl h-full border-l border-border bg-card flex flex-col shadow-2xl"
             >
                <div className="p-10 border-b border-border flex justify-between items-center">
                   <div className="space-y-1">
                      <h2 className="text-2xl font-bold tracking-tight">Ledger Details</h2>
                      <p className="text-xs text-brand font-bold uppercase tracking-widest">{propertyData.name} // {drillDownType}</p>
                   </div>
                   <button onClick={() => setDrillDownType(null)} className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-accent transition-colors"><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10">
                   {isLedgerLoading ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-xs">Materializing records...</div>
                   ) : ledgerEntries.length > 0 ? (
                      <div className="space-y-4">
                         {ledgerEntries.map((e: any) => (
                            <div key={e.id} className="p-4 bg-muted/30 border border-border rounded-lg flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center"><Receipt size={16} /></div>
                                  <div>
                                     <p className="text-sm font-medium">{e.description || e.expenseCategory?.name || 'Manual Entry'}</p>
                                     <p className="text-[10px] text-muted-foreground uppercase font-bold">{new Date(e.transactionDate).toLocaleDateString()} // ID: {e.id.slice(0, 8)}</p>
                                  </div>
                               </div>
                               <p className={cn("text-base font-bold tabular-nums", e.amount < 0 ? "text-rose-500" : "text-emerald-500")}>
                                  {e.amount < 0 ? '-' : '+'}${Math.abs(Number(e.amount)).toLocaleString()}
                               </p>
                            </div>
                         ))}
                      </div>
                   ) : (
                      <div className="flex items-center justify-center h-full opacity-40 text-sm font-bold">No records found</div>
                   )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
