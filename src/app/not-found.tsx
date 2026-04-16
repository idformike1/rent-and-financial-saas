import Link from 'next/link'
import { Home, Zap, AlertTriangle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-[8px] p-6 max-w-xl w-full text-center space-y-10 border border-border">
        
        {/* Icon */}
        <div className="w-16 h-16 bg-background border border-border rounded-[8px] flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-8 h-8 text-muted-foreground" />
        </div>

        {/* Code */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-muted-foreground  ">
            System Error // Routing Protocol Failure
          </p>
          <h1 className="text-7xl font-bold text-foreground leading-none">
            4<span className="text-muted-foreground">0</span>4
          </h1>
          <p className="text-lg font-bold text-foreground">
            Coordinates Lost
          </p>
          <p className="text-sm text-muted-foreground font-bold leading-relaxed max-w-sm mx-auto">
            The asset you requested does not exist in this registry. The route may have been decommissioned or never provisioned.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px bg-border w-full" />

        {/* CTA */}
        <Link
          href="/home"
          className="inline-flex items-center gap-3 bg-primary text-primary-foreground font-bold  text-[11px] px-8 py-4 rounded-[8px] hover:bg-primary/90 transition-none active:scale-95"
        >
          <Zap className="w-4 h-4" />
          Return Home
        </Link>

        <p className="text-[9px] font-bold text-muted-foreground ">
          Axiom 2026 // Sovereign Navigation Protocol
        </p>
      </div>
    </div>
  )
}
