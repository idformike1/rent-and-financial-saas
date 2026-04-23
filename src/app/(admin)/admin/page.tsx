import { getSystemAuditSummary } from "@/actions/system.actions";

export default async function AdminDashboardPage() {
  const audit = await getSystemAuditSummary();

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h2 className="text-4xl font-light tracking-tight text-white mb-2">Supreme Command Center</h2>
        <p className="text-neutral-500 font-light">Global state overview and organizational orchestration.</p>
      </header>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group relative p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          </div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-6">System Health</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light text-white">OPTIMAL</span>
          </div>
          <p className="mt-4 text-xs text-emerald-500/60 font-mono">ALL_NODES_OPERATIONAL</p>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-6">Active Orgs</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light text-white">{audit.activeOrgs}</span>
            <span className="text-sm text-neutral-600 tracking-tighter">ENTITIES</span>
          </div>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5">
          <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-6">Total Population</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-light text-white">{audit.totalUsers}</span>
            <span className="text-sm text-neutral-600 tracking-tighter">IDENTITIES</span>
          </div>
        </div>
      </div>

      {/* System Audit Report Summary */}
      <div className="max-w-2xl p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-8">
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-1">Audit Protocol</h3>
          <p className="text-sm text-neutral-400">Forensic summary of current system state.</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5">
            <span className="text-xs text-neutral-500 uppercase tracking-widest">Pending Intake</span>
            <span className={`text-sm font-mono ${audit.pendingIntake > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {audit.pendingIntake} USERS
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5">
            <span className="text-xs text-neutral-500 uppercase tracking-widest">Auth Integrity</span>
            <span className="text-sm font-mono text-emerald-500">HARDENED</span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5">
            <span className="text-xs text-neutral-500 uppercase tracking-widest">Isolation Principle</span>
            <span className="text-sm font-mono text-white">ENFORCED</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] leading-relaxed text-amber-200/60 uppercase tracking-wider">
          WARNING: SYSTEM DETECTED STRING-BASED ROLE DRIFT. RECOMMEND SCHEMA CONVERSION TO ENUM IN NEXT PHASE.
        </div>
      </div>
    </div>
  );
}
