'use client';

import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { ChevronDown, Search, Building2, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface AssetSwitcherProps {
  currentName: string;
  currentId: string;
  allProperties: any[];
}

export default function AssetSwitcher({ currentName, currentId, allProperties = [] }: AssetSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredProperties = allProperties.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md transition-all duration-200 group",
          isOpen ? "bg-white/5 text-foreground" : "text-foreground/60 hover:text-foreground hover:bg-white/5"
        )}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{currentName}</span>
        <ChevronDown 
          size={10} 
          className={cn(
            "text-muted-foreground/40 transition-transform duration-200",
            isOpen ? "rotate-180" : "group-hover:text-foreground"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for closing */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full left-0 mt-2 w-64 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden backdrop-blur-xl"
            >
              {/* Search Header */}
              <div className="p-3 border-b border-white/5 bg-white/[0.02]">
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                  <input 
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Quick search portfolio..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg h-9 pl-9 pr-4 text-[10px] font-medium text-white outline-none focus:border-brand/40 transition-all placeholder:text-white/10"
                  />
                </div>
              </div>

              {/* List */}
              <div className="max-h-72 overflow-y-auto p-1.5 custom-scrollbar">
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((prop) => (
                    <Link 
                      key={prop.id}
                      href={`/assets/${prop.id}`}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group",
                        prop.id === currentId 
                          ? "bg-brand/10 text-brand pointer-events-none" 
                          : "hover:bg-white/5 text-white/40 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                          prop.id === currentId 
                            ? "bg-brand text-white shadow-[0_0_15px_rgba(var(--brand-rgb),0.3)]" 
                            : "bg-white/5 text-white/20 group-hover:bg-white/10 group-hover:text-white/40"
                        )}>
                          <Building2 size={12} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-widest">{prop.name}</span>
                          <span className="text-[8px] font-medium text-white/20 uppercase tracking-tighter">
                            {prop.units?.length || 0} Inventory Nodes
                          </span>
                        </div>
                      </div>
                      
                      {prop.id === currentId && (
                        <div className="w-1 h-1 rounded-full bg-brand shadow-[0_0_8px_rgba(var(--brand-rgb),0.5)]" />
                      )}
                    </Link>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">No assets matched</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <Link 
                href="/assets"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 p-3 bg-white/[0.02] border-t border-white/5 hover:bg-white/[0.05] transition-all"
              >
                <Globe size={10} className="text-white/20" />
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">View Full Portfolio</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
