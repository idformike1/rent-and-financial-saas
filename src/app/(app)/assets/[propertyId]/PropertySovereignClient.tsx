'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import UnitGrid from './UnitGrid';
import UnitSideSheet from './UnitSideSheet';
import { Building2, Plus, Edit2, Trash2, X, ArrowLeft, Globe } from 'lucide-react';
import { Button, Badge } from '@/components/ui-finova';
import PropertyMetricsHud from '@/components/assets/PropertyMetricsHud';
import PropertyWaterfall from '@/components/charts/PropertyWaterfall';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { updateProperty, deleteProperty, createUnit } from '@/actions/asset.actions';
import { toast } from '@/lib/toast';
import { useRouter } from 'next/navigation';
import DomainSwitcher from '@/components/assets/DomainSwitcher';

interface PropertySovereignClientProps {
  propertyData: any;
  pulseData: any;
  allProperties: any[];
}

export default function PropertySovereignClient({ propertyData, pulseData, allProperties }: PropertySovereignClientProps) {
  const router = useRouter();
  const [drillDownType, setDrillDownType] = useState<string | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditAssetModalOpen, setIsEditAssetModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Buffer states for forms
  const [editPropName, setEditPropName] = useState(propertyData.name);
  const [editPropAddr, setEditPropAddr] = useState(propertyData.address);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const res = await updateProperty(propertyData.id, { name: editPropName, address: editPropAddr });
    if (res.success) toast.success("Asset intelligence updated.");
    else toast.error("Update failed.");
    setIsUpdating(false);
    setIsEditAssetModalOpen(false);
  };

  const handleArchive = async () => {
    const res = await deleteProperty(propertyData.id);
    if (res.success) {
      toast.success("Asset decommissioned.");
      router.push('/assets');
    } else {
      toast.error("Decommission protocol failed.");
    }
  };

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* ── SYSTEM NAVIGATION & METADATA ────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b border-white/[0.04]">
        <div className="flex items-center gap-8">
          <Link href="/assets" className="inline-flex items-center gap-2 text-[10px] font-bold text-white/30 hover:text-white/60 uppercase tracking-[0.2em] transition-colors group">
            <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" />
            System Portfolio
          </Link>
          <div className="w-[1px] h-4 bg-white/10" />
          <DomainSwitcher properties={allProperties} />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-mercury-green animate-pulse" />
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Registry ID: {propertyData.id.slice(0, 8)}</span>
          </div>
          <Badge variant="ghost" className="font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 border-white/5 text-white/40 bg-white/[0.02]">
            Asset_Class: Tier_1
          </Badge>
        </div>
      </div>

      {/* ── COMMAND CENTER HEADER ─────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-[44px] leading-tight font-display text-white tracking-tight">
            {propertyData.name}
          </h1>
          <div className="flex items-center gap-3 text-white/40">
            <Building2 className="w-3.5 h-3.5" />
            <p className="text-[14px] font-medium tracking-wide">
              {propertyData.address}
            </p>
          </div>
        </div>
        
        <div className="flex items-center p-1 bg-white/[0.02] border border-white/5 rounded-[8px] backdrop-blur-sm">
          <Button 
            variant="ghost" 
            onClick={() => setIsEditAssetModalOpen(true)}
            className="h-10 px-5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider text-white/60 hover:text-white hover:bg-white/5 border-none"
          >
            <Edit2 className="w-3.5 h-3.5 mr-2 opacity-50" />
            Edit Profile
          </Button>
          <div className="w-[1px] h-5 bg-white/10 mx-1" />
          <Button 
            variant="ghost" 
            className="h-10 px-5 rounded-[6px] text-[11px] font-bold uppercase tracking-wider text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/5 border-none"
            onClick={() => setIsArchiveModalOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2 opacity-50" />
            Archive
          </Button>
          <div className="w-[1px] h-5 bg-white/10 mx-1" />
          <Button 
            onClick={() => setIsAddUnitModalOpen(true)}
            className="h-10 px-6 rounded-[6px] text-[11px] font-bold bg-brand hover:bg-brand/90 text-white uppercase tracking-wider ml-1 shadow-lg shadow-brand/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Provision Unit
          </Button>
        </div>
      </div>

      {/* ── FISCAL TELEMETRY HUD ───────────────────────────────────────────── */}
      {pulseData && (
        <div className="mb-12">
          <PropertyMetricsHud 
            metrics={pulseData.hud} 
            onDrillDown={(type) => setDrillDownType(type)} 
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* ── FISCAL WATERFALL ─────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          {pulseData && <PropertyWaterfall data={pulseData.waterfall} />}
        </div>

        {/* ── ASSET MATRIX ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[12px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-3">
               <Building2 className="w-4 h-4" /> Asset Compliance Matrix
            </h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-mercury-green" />
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Optimized</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Surveillance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Critical</span>
              </div>
            </div>
          </div>
          <UnitGrid units={propertyData.units} />
        </div>
      </div>

      <UnitSideSheet propertyData={propertyData} />

      {/* ── MODAL STRATUM ─────────────────────────────────────────────────── */}
      
      {/* EDIT ASSET MODAL */}
      {isEditAssetModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-sm">
          <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-md rounded-[12px] overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
                <h3 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                   <Edit2 className="w-4 h-4 text-brand" /> Edit Asset Intelligence
                </h3>
                <button onClick={() => setIsEditAssetModalOpen(false)} className="text-white/20 hover:text-white transition-colors"><X size={16} /></button>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Property Name</label>
                   <input value={editPropName} onChange={(e) => setEditPropName(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-11 px-4 text-white text-[14px] outline-none focus:border-brand/40 transition-all" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Address Coordinates</label>
                   <input value={editPropAddr} onChange={(e) => setEditPropAddr(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-11 px-4 text-white text-[14px] outline-none focus:border-brand/40 transition-all" />
                </div>
                <div className="pt-4">
                  <Button onClick={handleUpdate} disabled={isUpdating} className="w-full bg-brand h-11 font-bold text-[12px] uppercase tracking-wider rounded-[6px] hover:bg-brand/90 border-none transition-all">{isUpdating ? 'Synchronizing...' : 'Update Protocol'}</Button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* ARCHIVE CONFIRMATION */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-sm">
           <div className="bg-[#0A0A0F] border border-red-500/20 w-full max-w-sm rounded-[12px] p-10 text-center space-y-8 shadow-2xl">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
                 <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <div className="space-y-3">
                 <h3 className="text-white font-display text-xl tracking-tight uppercase">Decommission Node?</h3>
                 <p className="text-white/40 text-[14px] leading-relaxed">This protocol will permanently eliminate <span className="text-white font-bold">{propertyData.name}</span> and all associated unit identifiers from the sovereign registry.</p>
              </div>
              <div className="flex gap-4">
                 <Button variant="ghost" onClick={() => setIsArchiveModalOpen(false)} className="flex-1 h-11 font-bold text-[11px] uppercase tracking-wider bg-white/[0.03] border-white/5 text-white/60 hover:text-white transition-all">Abort</Button>
                 <Button variant="danger" onClick={handleArchive} className="flex-1 h-11 font-bold text-[11px] uppercase tracking-wider bg-rose-600 text-white hover:bg-rose-500 transition-all border-none">Execute</Button>
              </div>
           </div>
        </div>
      )}

      {/* PROVISION UNIT MODAL */}
      {isAddUnitModalOpen && (
        <AddUnitModal 
          isOpen={isAddUnitModalOpen} 
          onClose={() => setIsAddUnitModalOpen(false)} 
          propertyId={propertyData.id} 
        />
      )}

      {/* ── DRILL-DOWN OVERLAY ────────────────────────────────────────────── */}
      <AnimatePresence>
        {drillDownType && (
           <div className="fixed inset-0 z-[100] bg-black/60 flex justify-end animate-in fade-in duration-300 backdrop-blur-sm">
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-full max-w-4xl h-full border-l border-white/10 bg-[#0A0A0F] flex flex-col overflow-hidden shadow-2xl"
             >
                <div className="p-10 border-b border-white/[0.04] flex justify-between items-center bg-white/[0.02]">
                   <div className="space-y-1">
                      <h2 className="text-[32px] font-display text-white leading-tight tracking-tight uppercase">Ledger Surveillance</h2>
                      <p className="text-[12px] text-brand font-bold uppercase tracking-[0.2em]">{propertyData.name} // Telemetry: {drillDownType}</p>
                   </div>
                   <button 
                     onClick={() => setDrillDownType(null)}
                     className="w-12 h-12 rounded-[8px] bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                   >
                      <X className="w-5 h-5 text-white/40" />
                   </button>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-10 border border-dashed border-white/5 m-10 rounded-[12px]">
                   <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-white/[0.02] border border-white/10 rounded-[8px] flex items-center justify-center mx-auto animate-pulse">
                         <Globe className="w-10 h-10 text-brand/40" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/60 font-mono text-[14px] uppercase tracking-[0.3em]">Materializing Drill-Down Buffer</p>
                        <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest italic">Decrypting granular fiscal records...</p>
                      </div>
                   </div>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AddUnitModal({ isOpen, onClose, propertyId }: { isOpen: boolean, onClose: () => void, propertyId: string }) {
  const [unitNumber, setUnitNumber] = useState('');
  const [type, setType] = useState('STUDIO');
  const [category, setCategory] = useState('RESIDENTIAL');
  const [marketRent, setMarketRent] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    const res = await createUnit({
      unitNumber,
      type,
      category,
      propertyId,
      marketRent: Number(marketRent) || 0
    });
    
    if (res.success) {
      toast.success("Unit provisioned successfully.");
      onClose();
    } else {
      toast.error(res.message || "Failed to provision unit.");
    }
    setIsPending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 animate-in fade-in duration-300 backdrop-blur-sm">
      <div className="bg-[#0A0A0F] border border-white/10 w-full max-w-md rounded-[12px] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/[0.08] flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-[12px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand" /> Provision Asset Unit
          </h3>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
           <div className="space-y-1.5">
             <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Unit Identifier</label>
             <input required value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-10 px-4 text-white text-[14px] outline-none focus:border-brand/40" placeholder="e.g. Unit 402" />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
               <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Category</label>
               <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-10 px-4 text-white text-[14px] outline-none">
                 <option value="RESIDENTIAL">Residential</option>
                 <option value="COMMERCIAL">Commercial</option>
                 <option value="STORAGE">Storage</option>
               </select>
             </div>
             <div className="space-y-1.5">
               <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Type</label>
               <input value={type} onChange={(e) => setType(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-10 px-4 text-white text-[14px] outline-none" placeholder="STUDIO, 1BR, etc." />
             </div>
           </div>
           <div className="space-y-1.5">
             <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest pl-1">Market Rent ($)</label>
             <input type="number" value={marketRent} onChange={(e) => setMarketRent(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-[6px] h-10 px-4 text-white text-[14px] outline-none" placeholder="0.00" />
           </div>
           <div className="pt-4">
             <Button type="submit" disabled={isPending} className="w-full bg-brand h-11 font-bold text-[12px] uppercase tracking-wider rounded-[6px] border-none">{isPending ? 'Provisioning...' : 'Confirm Provisioning'}</Button>
           </div>
        </form>
      </div>
    </div>
  );
}
