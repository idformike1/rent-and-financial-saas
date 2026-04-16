'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SovereignSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export function SovereignSheet({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: SovereignSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sizeMap = {
    md: 'w-[480px]',
    lg: 'w-[640px]',
    xl: 'w-[800px]',
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* PANEL CONTAINER */}
      <div
        className={cn(
          "fixed right-0 top-0 h-screen z-[101] bg-[#0A0A0A] border-l border-zinc-800/50  transition-transform duration-300 ease-out",
          sizeMap[size],
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800/50">
          <h2 className="text-[11px] uppercase tracking-wider text-zinc-100 font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-100 transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="h-[calc(100vh-63px)] overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}
