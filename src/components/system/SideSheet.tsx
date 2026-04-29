'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * AXIOM SYSTEM: SIDE SHEET
 * A robust, reusable overlay component for side-panels.
 * Handles backdrop, scroll locking, and unified typography.
 */
interface SideSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}

export function SideSheet({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: SideSheetProps) {
  // Lock body scroll when open
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

      <div
        className={cn(
          "fixed right-0 top-0 h-screen z-[101] bg-card border-l border-white/10 transition-transform duration-300 ease-out",
          sizeMap[size],
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ boxShadow: 'var(--shadow-elevation)' }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-mercury-label-caps text-white/90">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors duration-200 p-1"
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
