'use client';

import { useState } from 'react';
import { ChevronDown, Building2, Globe, Command, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/src/components/finova/ui-finova';

interface Property {
  id: string;
  name: string;
}

interface DomainSwitcherProps {
  properties: Property[];
}

export default function DomainSwitcher({ properties }: DomainSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { propertyId } = useParams();
  const router = useRouter();

  const currentProperty = properties.find(p => p.id === propertyId);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-1.5 rounded-[var(--radius-sm)] hover:bg-white/[0.04] transition-all group border border-transparent hover:border-white/5"
      >
        <div className="w-8 h-8 rounded-[4px] bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
          <Globe size={16} />
        </div>
        <div className="text-left">
          <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">Active Domain</div>
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-medium text-white tracking-clinical leading-none truncate max-w-[180px]">
              {currentProperty?.name || 'Select Domain'}
            </span>
            <ChevronDown size={14} className={cn("text-white/20 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-[280px] bg-[#0A0A0F] border border-white/10 rounded-[var(--radius-sm)] shadow-2xl z-[101] overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
            <div className="p-3 border-b border-white/[0.04] bg-white/[0.02]">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Portfolio Matrix</span>
                <Link 
                  href="/assets?modal=add"
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] text-brand hover:text-brand/80 font-bold uppercase tracking-widest flex items-center gap-1 transition-colors"
                >
                  <Plus size={10} /> Register New
                </Link>
              </div>
            </div>
            <div className="p-2 max-h-[320px] overflow-y-auto scrollbar-hide">
              {properties.map((p) => (
                <Link
                  key={p.id}
                  href={`/assets/${p.id}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-sm)] transition-all group",
                    p.id === propertyId 
                      ? "bg-brand/10 text-brand border border-brand/10" 
                      : "text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  <Building2 size={16} className={cn("shrink-0", p.id === propertyId ? "text-brand" : "text-white/20 group-hover:text-white/40")} />
                  <span className="text-[13px] font-medium truncate">{p.name}</span>
                </Link>
              ))}
            </div>
            <div className="p-2 border-t border-white/[0.04] bg-white/[0.01]">
              <Link
                href="/assets"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2 text-[11px] font-bold text-white/40 hover:text-white/80 uppercase tracking-widest transition-colors"
              >
                <Command size={12} /> View All Assets
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
