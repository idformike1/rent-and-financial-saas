'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import UnitConfigForm from './UnitConfigForm';
import LeaseAssignmentForm from './LeaseAssignmentForm';
import UnitLedgerTab from './UnitLedgerTab';
import { X } from 'lucide-react';

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
        "fixed right-0 top-0 h-screen w-[40vw] min-w-[500px] border-l border-[#1F2937] bg-background z-50 flex flex-col shadow-[var(--shadow-mercury-float)]",
        "animate-in slide-in-from-right-1/2 duration-300"
      )}>
        
        {/* HEADER BAR */}
        <div className="h-14 border-b border-[#1F2937] flex items-center justify-between px-8 shrink-0">
           <div className="flex items-center gap-4">
             <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
             <span className="font-mono text-[13px] font-bold text-[#E5E7EB] uppercase tracking-widest">
               Subject: {activeUnit?.unitNumber || 'UNKNOWN_NODE'}
             </span>
           </div>
           <button 
             onClick={closeSheet}
             className="text-muted-foreground hover:text-foreground transition-colors"
           >
             <X size={16} />
           </button>
        </div>

        {/* TAB MATRIX */}
        <div className="flex border-b border-[#1F2937] px-8 pt-6 shrink-0 gap-6">
          {(['CONFIGURATION', 'OCCUPANT', 'LEDGER'] as TabKey[]).map((tab) => {
            const label = tab.charAt(0) + tab.slice(1).toLowerCase();
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-4 text-[13px] font-medium transition-all relative",
                  activeTab === tab 
                    ? "text-[#E5E7EB]" 
                    : "text-[#9CA3AF] hover:text-[#E5E7EB]"
                )}
              >
                {label}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand" />
                )}
              </button>
            );
          })}
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
