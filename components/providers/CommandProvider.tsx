'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import CommandMenu from '@/components/ui-finova/CommandMenu';

interface CommandContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandContext = createContext<CommandContextType | undefined>(undefined);

export const useCommand = () => {
  const context = useContext(CommandContext);
  if (!context) {
    throw new Error('useCommand must be used within a CommandProvider');
  }
  return context;
};

export default function CommandProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const toggle = () => setOpen((o) => !o);

  return (
    <CommandContext.Provider value={{ open, setOpen, toggle }}>
      {children}
      <CommandMenu />
    </CommandContext.Provider>
  );
}
