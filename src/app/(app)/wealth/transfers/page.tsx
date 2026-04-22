import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { getActiveWorkspaceId } from '@/src/actions/workspace.actions'
import TransferEngine from '@/src/components/Cockpit/TransferEngine'

export default async function TransfersPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const activeId = await getActiveWorkspaceId();
  if (!activeId) redirect('/home');

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-6xl mx-auto py-8">
      <header className="text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-amber-500/10 blur-[100px] -z-10"></div>
        <h1 className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-500 mb-2">
          Treasury Support Engine
        </h1>
        <h2 className="text-5xl font-weight-display text-white tracking-tighter mb-4">
          Allowances & Transfers
        </h2>
        <p className="text-clinical-muted text-sm max-w-lg mx-auto">
            Mathematically guaranteed double-entry rebalancing between sovereign account buckets.
        </p>
      </header>

      <TransferEngine />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <AdvisoryCard 
            title="Instant Settle" 
            desc="Funds are immediately re-allocated across all analytical cockpit views."
          />
          <AdvisoryCard 
            title="Sovereign Shield" 
            desc="All transfers are signed by your active session organization ID."
          />
          <AdvisoryCard 
            title="Audit Ready" 
            desc="Every transfer creates an immutable ledger pair for GAAP compliance."
          />
      </div>
    </div>
  );
}

function AdvisoryCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="p-6 bg-white/5 border border-border/30 rounded-2xl group hover:border-amber-500/20 transition-all">
            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-3">{title}</h4>
            <p className="text-xs text-clinical-muted leading-relaxed">{desc}</p>
        </div>
    )
}
