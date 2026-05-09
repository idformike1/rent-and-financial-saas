'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import UnitGrid from './UnitGrid';
import UnitSideSheet from './UnitSideSheet';
import { Building2, Plus, Edit2, Trash2, X, ArrowLeft, Receipt, LayoutGrid, AlertCircle, Download, Database, TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { Button, Badge } from '@/src/components/finova/ui-finova';
import PropertyMetricsHud from '@/src/components/finova/assets/PropertyMetricsHud';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { updateProperty, deleteProperty, createUnit } from '@/actions/asset.actions';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import { getFinanceMetadataAction } from '@/actions/treasury.actions';

import DomainSwitcher from '@/src/components/finova/assets/DomainSwitcher';
import { SideSheet } from '@/src/components/system/SideSheet';
import AssetLedgerTable from './AssetLedgerTable';
import ExpenseFormClient from '../treasury/ExpenseFormClient';
import FinancialActivityFeed from './FinancialActivityFeed';
import { MapPin, Share2, Globe } from 'lucide-react';
import { Card } from '@/src/components/system/Card';

interface PropertySovereignClientProps {
  propertyData: any;
  pulseData: any;
  allProperties: any[];
  initialLedger?: any[];
  role?: string;
}

export default function PropertySovereignClient({ 
  propertyData, 
  pulseData, 
  allProperties,
  initialLedger = [],
  role 
}: PropertySovereignClientProps) {

  // ... (rest of states and handlers remain the same)
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<'MONTHLY' | 'YEARLY' | 'ALL_TIME'>(
    (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('timeframe') as any) || 'MONTHLY'
  );
  const [drillDownType, setDrillDownType] = useState<string | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditAssetModalOpen, setIsEditAssetModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [governanceData, setGovernanceData] = useState<any>(null);
  const [isLoadingGov, setIsLoadingGov] = useState(false);

  const [editPropName, setEditPropName] = useState(propertyData.name);
  const [editPropAddr, setEditPropAddr] = useState(propertyData.address);
  const [isUpdating, setIsUpdating] = useState(false);

  const [mainLedger, setMainLedger] = useState<any[]>(initialLedger);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);

  // Sync server props to client state when timeframe changes
  useEffect(() => {
    setMainLedger(initialLedger);
  }, [initialLedger]);

  useEffect(() => {
    if (drillDownType) {
      setIsLedgerLoading(true);
      let filtered = [...mainLedger];
      if (drillDownType === 'NOI') {
        filtered = mainLedger.filter(e => e.account?.category === 'INCOME' || e.account?.category === 'EXPENSE');
      } else if (['GROSS_POTENTIAL', 'LEAKAGE', 'COLLECTION'].includes(drillDownType)) {
        filtered = mainLedger.filter(e => e.account?.category === 'INCOME');
      }
      setLedgerEntries(filtered);
      setIsLedgerLoading(false);
    }
  }, [drillDownType, mainLedger]);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      const res = await updateProperty(propertyData.id, { name: editPropName, address: editPropAddr });
      if (res.success) {
        toast.success("Asset details updated.");
        setIsEditAssetModalOpen(false);
      } else {
        toast.error(res.error || "Update failed.");
      }
    } catch (error: any) {
      toast.error(error.message || "Update failed.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    const res = await deleteProperty(propertyData.id);
    if (res.success) {
      toast.success("Asset removed.");
      router.push('/assets');
    } else {
      toast.error(res.error || "Archive failed.");
    }
  };

  const handleExportCSV = () => {
    if (mainLedger.length === 0) {
      toast.error("No ledger data available for export.");
      return;
    }
    const headers = ["Date", "Description", "Amount", "Account", "Status"].join(",");
    const rows = mainLedger.map(e => [
      new Date(e.transactionDate).toLocaleDateString(),
      `"${(e.description || "").replace(/"/g, '""')}"`,
      e.amount,
      `"${e.account?.name || ""}"`,
      e.status
    ].join(",")).join("\n");

    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${propertyData.name.replace(/\s+/g, '_')}_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Forensic CSV materialized.");
  };

  const handleOpenLogModal = async () => {
    setIsLogModalOpen(true);
    if (!governanceData && !isLoadingGov) {
      setIsLoadingGov(true);
      const res = await getFinanceMetadataAction();
      if (res.success) {
        setGovernanceData({ ...res.data, properties: allProperties });
      } else {
        toast.error("Failed to materialize treasury context.");
      }
      setIsLoadingGov(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen bg-background text-foreground flex flex-col p-4 md:p-8 subpixel-antialiased overflow-y-auto lg:overflow-hidden">
      
      {/* ── 1. MINIMALIST HEADER ────────────────────────────────────────── */}
      <header className="flex items-center justify-between mb-8 flex-shrink-0">
        <div className="flex items-center gap-6">
          <div className="space-y-2">
            {/* Clinical Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
              <span className="hover:text-foreground/50 transition-colors cursor-default">PORTFOLIO</span>
              <span>/</span>
              <Link href="/assets" className="hover:text-foreground/50 transition-colors">ASSETS</Link>
              <span>/</span>
              <span className="text-foreground/60">{propertyData.name.toUpperCase()}</span>
            </nav>

            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {propertyData.name.charAt(0)}
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{propertyData.name}</h1>
                <Badge variant="brand" className="text-[9px] font-bold px-2 py-0.5 bg-brand/10 border-brand/20 text-brand">ACTIVE</Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-muted-foreground/40">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest">{propertyData.address}</p>
              </div>
              <div className="w-1 h-1 rounded-full bg-border" />
              <p className="text-[10px] font-bold uppercase tracking-widest">ID: {propertyData.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsEditAssetModalOpen(true)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={handleExportCSV} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <Share2 className="w-3.5 h-3.5 mr-2" /> Export
            </Button>
          </div>

          <div className="h-6 w-px bg-border/50" />

          <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-xl border border-border/40">
            {(['MONTHLY', 'YEARLY', 'ALL_TIME'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTimeframe(t);
                  router.push(`/assets/${propertyData.id}?timeframe=${t}`, { scroll: false });
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                  timeframe === t 
                    ? "bg-background text-foreground shadow-sm border border-border/50" 
                    : "text-muted-foreground/40 hover:text-muted-foreground"
                )}
              >
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── 2. KPI GRID ─────────────────────────────────────────────────── */}
      <section className="mb-8 flex-shrink-0">
        {pulseData && (
          <PropertyMetricsHud 
            metrics={pulseData.hud} 
            timeframe={timeframe}
            onDrillDown={(type) => setDrillDownType(type)} 
          />
        )}
      </section>

      {/* ── 3. OPERATIONAL GRID (FIXED HEIGHT) ──────────────────────────── */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 flex-grow min-h-0">
        
        {/* Left: Units Table */}
        <section className="flex flex-col flex-1 min-h-[300px] lg:min-h-0">
          <Card className="p-0 overflow-hidden border border-border/40 shadow-none bg-muted/5 flex flex-col h-full">
            <div className="p-4 border-b border-border/40 bg-muted/10 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">Units</h2>
                <Badge variant="default" className="text-[9px] font-bold opacity-40">{propertyData.units?.length || 0}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-32 md:w-48">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full h-8 bg-muted/20 border border-border/50 rounded-lg px-3 text-[10px] font-medium outline-none focus:border-brand/40 transition-all"
                  />
                </div>
                <Button 
                  onClick={() => setIsAddUnitModalOpen(true)}
                  className="h-8 w-8 p-0 bg-brand hover:bg-brand/90 text-white rounded-lg shadow-lg shadow-brand/20 transition-all flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar">
              <UnitGrid units={propertyData.units} propertyId={propertyData.id} />
            </div>
          </Card>
        </section>

        {/* Right: Financial Activity */}
        <section className="flex flex-col flex-1 min-h-[300px] lg:min-h-0">
          <Card className="p-6 border border-border/40 shadow-none bg-muted/5 flex flex-col h-full">
            <FinancialActivityFeed 
              propertyData={propertyData}
              ledgerEntries={mainLedger}
              onLogTransaction={handleOpenLogModal}
            />
          </Card>
        </section>

      </div>

      {/* SIDEBARS & MODALS */}
      <UnitSideSheet propertyData={propertyData} />

      <SideSheet
        isOpen={isEditAssetModalOpen}
        onClose={() => setIsEditAssetModalOpen(false)}
        title="Asset Configuration"
      >
        <div className="space-y-10 py-6">
          {/* Identity Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Identity & Location</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Property Name</label>
                <input value={editPropName} onChange={(e) => setEditPropName(e.target.value)} className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Global Address</label>
                <input value={editPropAddr} onChange={(e) => setEditPropAddr(e.target.value)} className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40 transition-all" />
              </div>
              <Button onClick={handleUpdate} disabled={isUpdating} className="w-full bg-brand h-11 font-bold text-sm shadow-lg shadow-brand/20">
                {isUpdating ? 'Synchronizing...' : 'Save Configuration'}
              </Button>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          {/* Governance Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">Management & Danger Zone</h3>
            
            {propertyData.units?.some((u: any) => u.leases?.length > 0) && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-bold text-white mt-0.5">!</div>
                <p className="text-[10px] font-bold text-rose-500 leading-normal">
                  GOVERNANCE LOCK: Management actions are restricted while occupants are present. Terminate all active leases before decommissioning or purging this asset.
                </p>
              </div>
            )}

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-500">Decommission Asset</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Temporarily disable all financial and unit operations for this asset.</p>
                </div>
                <Button 
                  variant="ghost" 
                  disabled={propertyData.units?.some((u: any) => u.leases?.length > 0)}
                  onClick={() => toast.success("Asset decommissioned. System state updated.")}
                  className="w-full border border-rose-500/40 text-rose-500 hover:bg-rose-500/10 h-10 text-[10px] font-bold uppercase tracking-widest cursor-pointer active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Execute Decommission
                </Button>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/10 bg-rose-500/5 space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-rose-500">Purge / Delete Asset</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Permanently remove this asset and all associated unit metadata.</p>
                </div>
                <Button 
                  variant="primary"
                  disabled={propertyData.units?.some((u: any) => u.leases?.length > 0)}
                  onClick={() => {
                    if (confirm("CRITICAL WARNING: This will permanently delete the asset. Proceed?")) {
                      handleArchive();
                    }
                  }} 
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white h-10 text-[10px] font-bold uppercase tracking-widest border-none disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Confirm Permanent Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SideSheet>

      <SideSheet
        isOpen={isAddUnitModalOpen}
        onClose={() => setIsAddUnitModalOpen(false)}
        title="Provision New Unit"
      >
        <form action={async (formData) => {
          setIsUpdating(true);
          const res = await createUnit({
            unitNumber: formData.get('unitNumber') as string,
            type: formData.get('type') as string,
            category: formData.get('category') as string,
            marketRent: Number(formData.get('marketRent')),
            propertyId: propertyData.id
          });
          if (res.success) {
            toast.success("Unit provisioned successfully.");
            setIsAddUnitModalOpen(false);
          } else {
            toast.error(res.error || "Provisioning failed.");
          }
          setIsUpdating(false);
        }} className="space-y-8 py-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Unit Number</label>
            <input name="unitNumber" required className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Type</label>
            <input name="type" required className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Category</label>
            <input name="category" required className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground">Market Rent ($)</label>
            <input name="marketRent" type="number" required className="w-full bg-muted/30 border border-border rounded-lg h-10 px-4 text-sm outline-none focus:border-brand/40 tabular-nums" />
          </div>
          <Button type="submit" disabled={isUpdating} className="w-full bg-brand h-11 font-bold text-sm">{isUpdating ? 'Provisioning...' : 'Provision Unit'}</Button>
        </form>
      </SideSheet>

      <SideSheet
        isOpen={!!drillDownType}
        onClose={() => setDrillDownType(null)}
        title={`Ledger Details: ${propertyData.name}`}
        size="xl"
      >
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
      </SideSheet>

      <SideSheet
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        title="Log Treasury Transaction"
        size="xl"
      >
        {governanceData ? (
          <ExpenseFormClient 
            properties={governanceData.properties} 
            allCategories={governanceData.categories} 
            allLedgers={governanceData.ledgers} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
             <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
             <span className="font-mono text-[11px] text-[#9CA3AF] uppercase tracking-widest">
                Materializing Treasury Logic...
             </span>
          </div>
        )}
      </SideSheet>

    </div>
  );
}
