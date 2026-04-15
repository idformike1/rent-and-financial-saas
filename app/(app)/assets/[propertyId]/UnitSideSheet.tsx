'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import UnitConfigForm from './UnitConfigForm';
import LeaseAssignmentForm from './LeaseAssignmentForm';
import UnitLedgerTab from './UnitLedgerTab';

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
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={closeSheet}
      />

      {/* ── SOVEREIGN SIDE SHEET ──────────────────────────────────────────── */}
      <div className={cn(
        "fixed right-0 top-0 h-screen w-[40vw] min-w-[500px] border-l border-[#1F2937] bg-[#12121A] z-50 flex flex-col shadow-2xl",
        "animate-in slide-in-from-right-1/2 duration-300"
      )}>
        
        {/* HEADER BAR */}
        <div className="h-14 border-b border-[#1F2937] flex items-center justify-between px-8 bg-[#1A1A24] shrink-0">
           <div className="flex items-center gap-4">
             <div className="w-2 h-2 bg-brand animate-pulse" /> {/* Using brand or fallback to blue */}
             <span className="font-mono text-[13px] font-bold text-[#E5E7EB] uppercase tracking-widest">
               Subject: {activeUnit?.unitNumber || 'UNKNOWN_NODE'}
             </span>
           </div>
           <button 
             onClick={closeSheet}
             className="font-mono text-[11px] font-bold text-[#9CA3AF] hover:text-white transition-colors tracking-widest"
           >
             [ CLOSE ]
           </button>
        </div>

        {/* TAB MATRIX */}
        <div className="flex border-b border-[#1F2937] px-8 pt-6 shrink-0 gap-6">
          {(['CONFIGURATION', 'OCCUPANT', 'LEDGER'] as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 font-mono text-[11px] font-bold tracking-widest transition-all",
                activeTab === tab 
                  ? "text-[#E5E7EB] border-b-2 border-[#5D71F9]" 
                  : "text-[#9CA3AF] opacity-50 hover:opacity-100 border-b-2 border-transparent"
              )}
            >
              [ {tab} ]
            </button>
          ))}
        </div>

        {/* VIEWPORT AREA */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {activeTab === 'CONFIGURATION' && (
            <div className="animate-in fade-in duration-300">
               <UnitConfigForm activeUnit={activeUnit} />
            </div>
          )}

          {activeTab === 'OCCUPANT' && (
            <div className="animate-in fade-in duration-300">
               <LeaseAssignmentForm activeUnit={activeUnit} />
            </div>
          )}

          {activeTab === 'LEDGER' && activeUnit && (
            <div className="animate-in fade-in duration-300">
               <UnitLedgerTab activeUnit={activeUnit} />
            </div>
          )}

        </div>
      </div>
    </>
  );
}
