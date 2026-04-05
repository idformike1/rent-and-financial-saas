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
    <div className="fixed top-8 right-8 z-[9999] flex flex-col gap-4 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div 
          key={t.id} 
          className={`
            pointer-events-auto
            flex items-center gap-4 p-5 rounded-3xl shadow-premium backdrop-blur-md border border-white/10
            animate-in slide-in-from-right-full duration-500
            ${t.type === 'success' ? 'bg-[var(--primary)] text-white shadow-[var(--primary)]/20' : ''}
            ${t.type === 'error' ? 'bg-rose-600 text-white shadow-rose-500/20' : ''}
            ${t.type === 'info' ? 'glass-panel text-white' : ''}
          `}
        >
          <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-card/20">
            {t.type === 'success' && <CheckCircle2 className="w-6 h-6 text-white" />}
            {t.type === 'error' && <AlertCircle className="w-6 h-6 text-white" />}
            {t.type === 'info' && <Info className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-1 pr-6">
            <p className="text-[12px] font-black uppercase italic tracking-widest text-white leading-tight">
              {t.message}
            </p>
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            className="absolute top-4 right-4 p-1 hover:bg-white/5 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
          </button>
        </div>
      ))}
    </div>
  );
}
