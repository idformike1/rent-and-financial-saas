'use client'

import { useEffect, useState } from 'react'
import { SUBSCRIBE_TOAST, ToastEvent } from '@/lib/toast'
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react'

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    const unsubscribe = SUBSCRIBE_TOAST((newToast) => {
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-8 z-[9999] flex flex-col gap-4 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={`
            pointer-events-auto
            flex items-center gap-4 p-5 rounded-[var(--radius)] border border-border
            animate-in slide-in-from-right-full duration-500
            ${t.type === 'success' ? 'bg-[var(--primary)] text-foreground' : ''}
            ${t.type === 'error' ? 'bg-destructive text-foreground' : ''}
            ${t.type === 'info' ? 'glass-panel text-foreground' : ''}
          `}
        >
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-[var(--radius)] bg-card">
            {t.type === 'success' && <CheckCircle2 className="w-6 h-6 text-foreground" />}
            {t.type === 'error' && <AlertCircle className="w-6 h-6 text-foreground" />}
            {t.type === 'info' && <Info className="w-6 h-6 text-foreground" />}
          </div>
          <div className="flex-1 pr-6">
            <p className="text-[12px] uppercase text-foreground leading-tight">
              {t.message}
            </p>
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            className="absolute top-4 right-4 p-1 hover:bg-muted rounded-[var(--radius)] transition-colors"
          >
            <X className="w-4 h-4 text-foreground/60 hover:text-foreground transition-colors" />
          </button>
        </div>
      ))}
    </div>
  );
}
