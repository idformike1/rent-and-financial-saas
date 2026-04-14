'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function TreasuryRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/home')
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted dark:bg-background">
      <div className="w-16 h-16 rounded-[8px] bg-brand/10 flex items-center justify-center animate-spin mb-6">
        <Loader2 className="w-8 h-8 text-brand" />
      </div>
      <p className="text-[10px]   text-muted-foreground animate-pulse">Synchronizing Treasury Matrix...</p>
    </div>
  )
}
