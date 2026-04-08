'use client';

import React from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useCommand } from '@/components/providers/CommandProvider';
import {
  LayoutDashboard,
  BarChart3,
  History,
  Plus,
  Users,
  Download,
  Search
} from 'lucide-react';

export default function CommandMenu() {
  const { open, setOpen } = useCommand();
  const router = useRouter();

  // Helper to handle navigation and close menu
  const navigate = (path: string) => {
    router.push(path);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] p-4"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#090A0E]/80 backdrop-blur-sm" />

      {/* Menu Container */}
      <Command
        className="relative w-full max-w-[640px] bg-[#161821] border border-[#2D2E39] rounded-[12px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setOpen(false);
        }}
      >
        <div className="flex items-center px-4 border-b border-[#2D2E39]">
          <Search className="w-5 h-5 text-[#8A8B94] mr-3" />
          <Command.Input
            placeholder="Type a command or search..."
            className="w-full h-14 bg-transparent border-none outline-none text-white text-[16px] placeholder:text-[#4A4B56]"
            autoFocus
          />
        </div>

        <Command.List className="p-2 max-h-[400px] overflow-y-auto custom-scrollbar">
          <Command.Empty className="p-8 text-center text-[#8A8B94] text-[14px]">
            No results found.
          </Command.Empty>

          <Command.Group heading="Navigation" className="px-2 py-3 text-[11px] uppercase tracking-widest text-[#4A4B56] font-bold">
            <CommandItem
              onSelect={() => navigate('/dashboard')}
              icon={<LayoutDashboard className="w-4 h-4" />}
            >
              Overview
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/transactions')}
              icon={<History className="w-4 h-4" />}
            >
              Master Ledger
            </CommandItem>
            <CommandItem
              onSelect={() => navigate('/insights')}
              icon={<BarChart3 className="w-4 h-4" />}
            >
              Engineering Insights
            </CommandItem>
          </Command.Group>

          <div className="h-[1px] bg-[#2D2E39] my-1 mx-2" />

          <Command.Group heading="Actions" className="px-2 py-3 text-[11px] uppercase tracking-widest text-[#4A4B56] font-bold">
            <CommandItem
              onSelect={() => { console.log('Log Expense'); setOpen(false); }}
              icon={<Plus className="w-4 h-4" />}
            >
              Log Expense
            </CommandItem>
            <CommandItem
              onSelect={() => { console.log('Register Tenant'); setOpen(false); }}
              icon={<Users className="w-4 h-4" />}
            >
              Register Tenant
            </CommandItem>
            <CommandItem
              onSelect={() => { console.log('Export Data'); setOpen(false); }}
              icon={<Download className="w-4 h-4" />}
            >
              Export Financial Data
            </CommandItem>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function CommandItem({ children, onSelect, icon }: { children: React.ReactNode, onSelect: () => void, icon?: React.ReactNode }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white text-[14px] cursor-pointer transition-all hover:bg-white/5 data-[selected=true]:bg-white/10 group"
    >
      <span className="text-[#8A8B94] group-hover:text-white transition-colors">
        {icon}
      </span>
      {children}
    </Command.Item>
  );
}
