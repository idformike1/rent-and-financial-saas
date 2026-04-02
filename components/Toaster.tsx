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
            flex items-center gap-4 p-5 rounded-2xl border-4 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]
            animate-in slide-in-from-right-full duration-500
            ${t.type === 'success' ? 'bg-green-50 border-slate-900 border-4' : ''}
            ${t.type === 'error' ? 'bg-red-50 border-red-900 border-4' : ''}
            ${t.type === 'info' ? 'bg-indigo-50 border-slate-900 border-4' : ''}
          `}
        >
          <div className="flex-shrink-0">
            {t.type === 'success' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
            {t.type === 'error' && <AlertCircle className="w-6 h-6 text-red-600" />}
            {t.type === 'info' && <Info className="w-6 h-6 text-indigo-600" />}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-black uppercase italic tracking-tighter ${
                t.type === 'success' ? 'text-slate-900' :
                t.type === 'error' ? 'text-red-950' : 'text-slate-900'
            }`}>
              {t.message}
            </p>
          </div>
          <button 
            onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400 font-black" />
          </button>
        </div>
      ))}
    </div>
  );
}
