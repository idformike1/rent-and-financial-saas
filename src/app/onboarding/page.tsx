'use client'

import { useState, useTransition, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { consumeInvitation } from '@/actions/team.actions'
import { toast } from '@/lib/toast'
import { LucideShieldCheck, LucideZap, LucideAlertTriangle, LucideLoader2, LucideKeyRound } from 'lucide-react'

function OnboardingForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <div className="mercury-card max-w-md w-full border-destructive/20 bg-destructive/5 items-center text-center py-12">
          <LucideAlertTriangle className="w-12 h-12 text-destructive mb-6 opacity-80" />
          <h1 className="text-mercury-headline text-foreground mb-3">Invalid Protocol</h1>
          <p className="text-mercury-body text-clinical-muted mb-8 max-w-[280px]">
            The invitation token is missing or corrupted. Please contact your administrator for a secure access link.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="text-mercury-label-caps text-clinical-low hover:text-foreground transition-colors underline underline-offset-4"
          >
            Return to Login Registry
          </button>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError("Complexity Requirement: Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Parity Error: Passwords do not match.")
      return
    }

    startTransition(async () => {
      const result = await consumeInvitation(token, password)
      if (result.success) {
        toast.success("Account Materialized Successfully. Redirecting to Login.")
        router.push('/login?onboarding=success')
      } else {
        setError(result.error || "Execution Fatal: Failed to consume token.")
        toast.error(result.error || "Account Materialization Failed.")
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 selection:bg-brand/20">
      <div className="mercury-card max-w-md w-full shadow-2xl shadow-black/40">
        <div className="flex items-center gap-3 mb-8 border-b border-border pb-6">
          <div className="w-10 h-10 bg-foreground rounded-[var(--radius-sm)] flex items-center justify-center">
            <LucideZap className="w-6 h-6 text-background fill-current" />
          </div>
          <div>
            <h1 className="text-mercury-heading text-foreground">Mercury Alpha</h1>
            <p className="text-mercury-label-caps text-clinical-low">Secure Onboarding Circuit</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-mercury-headline text-foreground mb-2">Initialize Identity</h2>
          <p className="text-mercury-body text-clinical-muted">
            You have been granted access to the Mercury Financial Engine. Secure your account by establishing a master passkey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-mercury-label-caps text-clinical-low block">Master Passkey</label>
            <div className="relative">
              <LucideKeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-low" />
              <input 
                type="password"
                required
                disabled={isPending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 bg-sidebar border border-border rounded-[var(--radius-sm)] pl-10 pr-4 text-mercury-body focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-clinical-low/30 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-mercury-label-caps text-clinical-low block">Confirm Passkey</label>
            <div className="relative">
              <LucideShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-clinical-low" />
              <input 
                type="password"
                required
                disabled={isPending}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 bg-sidebar border border-border rounded-[var(--radius-sm)] pl-10 pr-4 text-mercury-body focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all placeholder:text-clinical-low/30 outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-[var(--radius-sm)] p-3 flex items-start gap-3">
              <LucideAlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[11px] text-destructive uppercase tracking-wider font-semibold leading-tight">
                {error}
              </p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-foreground text-background rounded-[var(--radius-sm)] text-mercury-label-caps hover:bg-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <LucideLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Confirm Identity Access
                <LucideShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-[10px] text-clinical-low uppercase tracking-[0.1em] text-center leading-relaxed">
            By initializing this account, you agree to the <br />
            <span className="text-foreground/60">Sovereign Governance & Audit Protocols</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
       <div className="flex items-center justify-center min-h-screen bg-background">
         <LucideLoader2 className="w-8 h-8 text-clinical-low animate-spin" />
       </div>
    }>
      <OnboardingForm />
    </Suspense>
  )
}
