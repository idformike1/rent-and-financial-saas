'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import UnitGrid from './UnitGrid';
import UnitSideSheet from './UnitSideSheet';
import { AssetProperty } from '@/src/services/queries/assets.services';
import { Building2, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Button, Badge } from '@/components/ui-finova';
import PropertyMetricsHud from '@/components/assets/PropertyMetricsHud';
import PropertyWaterfall from '@/components/charts/PropertyWaterfall';
import { AnimatePresence, motion } from 'framer-motion';

interface PropertySovereignClientProps {
  propertyData: any;
  pulseData: any;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function PropertySovereignClient({ propertyData, pulseData }: PropertySovereignClientProps) {
  const [drillDownType, setDrillDownType] = useState<string | null>(null);
  const [isAddUnitModalOpen, setIsAddUnitModalOpen] = useState(false);
  const [isEditAssetModalOpen, setIsEditAssetModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  return (
    <div className="animate-in fade-in duration-700 pb-20">
      
      {/* ── HEADER STRATUM ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 border-b border-[#1F2937] pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="success" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">Asset Pillar</Badge>
            <span className="font-mono text-[10px] text-white/20 uppercase tracking-widest">Registry ID: {propertyData.id.slice(0, 8)}</span>
          </div>
          <h1 className="text-[32px] leading-[40px] font-[400] text-white tracking-tight font-sans mt-2">
            {propertyData.name}
          </h1>
          <p className="text-[14px] font-medium text-white/40 font-sans">
            {propertyData.address}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setIsEditAssetModalOpen(true)}
            className="h-10 px-4 rounded-[6px] text-[12px] font-bold border-[#1F2937]"
          >
            <Edit2 className="w-3.5 h-3.5 mr-2" />
            Edit Asset
          </Button>
          <Button 
            variant="danger" 
            className="h-10 px-4 rounded-[6px] text-[12px] font-bold opacity-50 hover:opacity-100"
            onClick={() => setIsArchiveModalOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Archive
          </Button>
          <Button 
            onClick={() => setIsAddUnitModalOpen(true)}
            className="h-10 px-6 rounded-[6px] text-[12px] font-bold bg-brand hover:bg-brand/90 text-white "
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
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-[6px] bg-mercury-green" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-[6px] bg-rose-500" />
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Vacant</span>
              </div>
            </div>
          </div>
          <UnitGrid units={propertyData.units} />
        </div>
      </div>

      <UnitSideSheet propertyData={propertyData} />

      {/* ── DRILL-DOWN OVERLAY ────────────────────────────────────────────── */}
      <AnimatePresence>
        {drillDownType && (
           <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-300">
             <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="w-full max-w-4xl h-full border-l border-[#1F2937] bg-[#0A0A0F] flex flex-col overflow-hidden"
             >
                <div className="p-10 border-b border-[#1F2937] flex justify-between items-center bg-card/20">
                   <div className="space-y-1">
                      <h2 className="text-[28px] font-display text-white leading-tight tracking-tight">Ledger Surveillance</h2>
                      <p className="text-[12px] text-brand font-bold uppercase tracking-[0.2em]">{propertyData.name} // Drill-Down: {drillDownType}</p>
                   </div>
                   <button 
                     onClick={() => setDrillDownType(null)}
                     className="w-12 h-12 rounded-[6px] bg-white/[0.04] border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                   >
                      <X className="w-5 h-5 text-white/40" />
                   </button>
                </div>
                
                <div className="flex-1 flex items-center justify-center p-10 border border-dashed border-[#1F2937]/50 m-10 rounded-[6px]">
                   <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[6px] flex items-center justify-center mx-auto animate-pulse">
                         <Building2 className="w-8 h-8 text-white/20" />
                      </div>
                      <p className="text-white/20 font-mono text-[11px] uppercase tracking-widest">Drill-down buffer materializing...</p>
                   </div>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}
