import Link from 'next/link'
import { Home, Zap, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-8">
      <div className="glass-panel rounded-3xl p-16 max-w-xl w-full text-center space-y-10 border border-white/10">
        
        {/* Icon */}
        <div className="w-20 h-20 bg-[var(--primary-muted)] rounded-3xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-[var(--primary)]" />
        </div>

        {/* Code */}
        <div className="space-y-3">
          <p className="text-[10px] font-mono font-black text-[var(--muted)] uppercase tracking-[0.4em]">
            System Error // Routing Protocol Failure
          </p>
          <h1 className="text-8xl font-black tracking-tighter text-[var(--foreground)] leading-none">
            4<span className="text-[var(--primary)]">0</span>4
          </h1>
          <p className="text-xl font-black uppercase tracking-widest text-[var(--foreground)]">
            Coordinates Lost
          </p>
          <p className="text-sm text-[var(--muted)] font-medium leading-relaxed">
            The asset you requested does not exist in this registry. The route may have been decommissioned or never provisioned.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 w-full" />

        {/* CTA */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-3 bg-[var(--primary)] text-white font-black uppercase tracking-widest text-[11px] px-10 py-5 rounded-full hover:bg-[var(--primary-light,#FF7555)] glow-primary transition-all duration-300 active:scale-95"
        >
          <Zap className="w-4 h-4 fill-white animate-pulse" />
          Return to Command Hub
        </Link>

        <p className="text-[9px] font-mono text-[var(--muted)] uppercase tracking-widest opacity-50">
          Axiom 2026 // Sovereign Navigation Protocol
        </p>
      </div>
    </div>
  )
}
