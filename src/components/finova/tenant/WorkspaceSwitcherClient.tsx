"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchActiveModule } from "@/actions/system.actions";
import { cn } from "@/lib/utils";
import { ChevronDown, Building2, Wallet, Check, Layers } from "lucide-react";

export function WorkspaceSwitcherClient({ 
  canAccessRent, 
  canAccessWealth,
  activeModule 
}: { 
  canAccessRent: boolean, 
  canAccessWealth: boolean,
  activeModule: 'RENT' | 'WEALTH' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSwitch = async (module: 'RENT' | 'WEALTH') => {
    if (module === activeModule) return;

    startTransition(async () => {
      const result = await switchActiveModule(module);
      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(result.error || "Failed to switch module.");
      }
    });
  };

  const activeLabel = activeModule === 'RENT' ? "Property Management" : "Personal Wealth";
  const ActiveIcon = activeModule === 'RENT' ? Building2 : Wallet;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] transition-all group",
          isPending && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 group-hover:border-amber-500/40 transition-all">
          <ActiveIcon className="w-3 h-3 text-amber-500" />
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/70 group-hover:text-white transition-all">
          {activeLabel}
        </span>
        <ChevronDown className={cn("w-3 h-3 text-neutral-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 p-1 bg-neutral-900 border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-black">Functional Scopes</p>
            </div>
            
            {canAccessRent && (
              <button
                onClick={() => handleSwitch('RENT')}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all group",
                  activeModule === 'RENT' ? "bg-amber-500/10" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Building2 className={cn("w-4 h-4", activeModule === 'RENT' ? "text-amber-500" : "text-neutral-500")} />
                  <div>
                    <p className={cn("text-[10px] uppercase tracking-widest font-bold", activeModule === 'RENT' ? "text-white" : "text-neutral-400 group-hover:text-white")}>Property Management</p>
                    <p className="text-[8px] text-neutral-600 uppercase tracking-tighter">Operational Command</p>
                  </div>
                </div>
                {activeModule === 'RENT' && <Check className="w-3 h-3 text-amber-500" />}
              </button>
            )}

            {canAccessWealth && (
              <button
                onClick={() => handleSwitch('WEALTH')}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all group",
                  activeModule === 'WEALTH' ? "bg-amber-500/10" : "hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Wallet className={cn("w-4 h-4", activeModule === 'WEALTH' ? "text-amber-500" : "text-neutral-500")} />
                  <div>
                    <p className={cn("text-[10px] uppercase tracking-widest font-bold", activeModule === 'WEALTH' ? "text-white" : "text-neutral-400 group-hover:text-white")}>Personal Wealth</p>
                    <p className="text-[8px] text-neutral-600 uppercase tracking-tighter">Analytical Cockpit</p>
                  </div>
                </div>
                {activeModule === 'WEALTH' && <Check className="w-3 h-3 text-amber-500" />}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

