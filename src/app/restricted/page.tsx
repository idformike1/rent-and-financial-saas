import Link from "next/link"
import { ShieldAlert, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0E] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl text-center space-y-12">
        
        {/* Visual Symbol */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-destructive/20 blur-[60px] rounded-full animate-pulse" />
          <div className="relative w-24 h-24 mx-auto rounded-full bg-[#0F0F15] border border-destructive/30 flex items-center justify-center shadow-2xl">
            <ShieldAlert size={40} className="text-destructive animate-in zoom-in duration-500" />
          </div>
        </div>

        {/* Messaging */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/20 bg-destructive/5 text-[10px] font-bold tracking-[0.2em] text-destructive uppercase">
            Protocol Violation: Error 403
          </div>
          <h1 className="text-display font-weight-display text-foreground text-5xl md:text-6xl tracking-tighter">
            Clearance <span className="text-destructive">Required</span>
          </h1>
          <p className="text-clinical-muted max-w-sm mx-auto leading-relaxed text-sm">
            Access to this sub-system is strictly limited to higher-tier operational roles. Your current credentials do not possess the required decryption keys.
          </p>
        </div>

        {/* Forensic Metadata */}
        <div className="glass-panel border border-white/5 p-6 rounded-[var(--radius-sm)] bg-white/[0.02] max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-8 text-left">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/30 block">ID Trace</span>
              <span className="text-[11px] font-mono text-foreground/60">AUT-001-ALPHA</span>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/30 block">Target Sector</span>
              <span className="text-[11px] font-mono text-foreground/60">RESTRICTED_CORE</span>
            </div>
          </div>
        </div>

        {/* Recovery Action */}
        <div className="pt-8">
          <Link 
            href="/home"
            className="inline-flex items-center gap-3 bg-foreground text-background px-10 py-5 rounded-[var(--radius-sm)] uppercase text-xs font-bold tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/50 overflow-hidden relative group"
          >
            <ArrowLeft size={16} />
            Return to Command
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
        </div>

        <footer className="text-[9px] text-foreground/20 uppercase tracking-[0.5em] pt-12">
          Enterprise Security Mesh // Mercury-01
        </footer>
      </div>
    </div>
  )
}
