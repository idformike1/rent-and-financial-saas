'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function TreasuryRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-background">
      <div className="w-16 h-16 rounded-3xl bg-brand/10 flex items-center justify-center shadow-premium animate-spin mb-6">
        <Loader2 className="w-8 h-8 text-brand" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Synchronizing Treasury Matrix...</p>
    </div>
  )
}
