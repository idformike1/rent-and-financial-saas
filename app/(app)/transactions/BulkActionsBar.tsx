'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Download, Tag, X } from 'lucide-react';

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  onExport: () => void;
  onCategorize: () => void;
}

export default function BulkActionsBar({
  selectedCount,
  onClear,
  onDelete,
  onExport,
  onCategorize
}: BulkActionsBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 100, x: '-50%', opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translateX-1/2 z-[100]"
        >
          <div className="bg-[#1e1e2a]/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-6">
            {/* Selection Count */}
            <div className="flex items-center gap-3 border-r border-white/10 pr-6">
              <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[11px] font-bold">
                {selectedCount}
              </div>
              <span className="text-[13px] text-white/70 font-medium pb-0.5">Records Selected</span>
              <button 
                onClick={onClear}
                className="p-1 hover:bg-white/5 rounded-full transition-colors text-white/30 hover:text-white ml-1"
              >
                <X size={14} />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <ActionButton 
                icon={<Tag size={16} />} 
                label="Categorize" 
                onClick={onCategorize} 
              />
              <ActionButton 
                icon={<Download size={16} />} 
                label="Export" 
                onClick={onExport} 
              />
              <div className="w-[1px] h-6 bg-white/10 mx-1" />
              <button 
                onClick={onDelete}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all text-[13px] font-medium"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all text-[13px] font-medium"
    >
      {icon}
      {label}
    </button>
  );
}
