'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import UnitConfigForm from './UnitConfigForm';
import LeaseAssignmentForm from './LeaseAssignmentForm';
import UnitLedgerTab from './UnitLedgerTab';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface UnitSideSheetProps {
  propertyData: any;
}

type TabKey = 'CONFIGURATION' | 'OCCUPANT' | 'LEDGER';

export default function UnitSideSheet({ propertyData }: UnitSideSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const unitId = searchParams.get('unitId');
  const isOpen = !!unitId;

  const activeUnit = useMemo(() => {
    if (!unitId || !propertyData?.units) return null;
    return propertyData.units.find((u: any) => u.id === unitId);
  }, [unitId, propertyData]);

  const [activeTab, setActiveTab] = useState<TabKey>('CONFIGURATION');

  const closeSheet = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('unitId');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    // Reset tab state when closing so next open starts at CONFIGURATION
    setTimeout(() => setActiveTab('CONFIGURATION'), 300);
  }, [pathname, searchParams, router]);

  if (!isOpen) return null;

  return (
    <>
      {/* ── BACKDROP ──────────────────────────────────────────────────────── */}
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={closeSheet}
      />

      {/* ── SOVEREIGN SIDE SHEET ──────────────────────────────────────────── */}
      <div className={cn(
        "fixed right-0 top-0 h-screen w-full md:w-[40vw] max-w-[600px] border-l border-border bg-background z-50 flex flex-col shadow-2xl",
        "animate-in slide-in-from-right duration-500 ease-in-out"
      )}>
        
        {/* HEADER BAR */}
        <div className="h-16 border-b border-border flex items-center justify-between px-8 shrink-0 bg-muted/10">
           <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em]">
                Subject_Identifier // {activeUnit?.unitNumber || 'UNKNOWN_NODE'}
              </span>
           </div>
           <button 
             onClick={closeSheet}
             className="w-10 h-10 flex items-center justify-center rounded-[var(--radius-sm)] text-foreground/20 hover:text-foreground hover:bg-muted transition-colors"
           >
             <X size={18} />
           </button>
        </div>

        {/* TAB MATRIX */}
        <div className="flex border-b border-border px-8 pt-6 shrink-0 gap-8 bg-muted/5">
          {(['CONFIGURATION', 'OCCUPANT', 'LEDGER'] as TabKey[]).map((tab) => {
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all relative",
                  activeTab === tab 
                    ? "text-foreground" 
                    : "text-foreground/20 hover:text-foreground/40"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* VIEWPORT AREA */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          
          {activeTab === 'CONFIGURATION' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UnitConfigForm activeUnit={activeUnit} />
            </div>
          )}

          {activeTab === 'OCCUPANT' && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <LeaseAssignmentForm activeUnit={activeUnit} />
            </div>
          )}

          {activeTab === 'LEDGER' && activeUnit && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <UnitLedgerTab activeUnit={activeUnit} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
