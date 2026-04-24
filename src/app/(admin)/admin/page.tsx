import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Activity, ShieldAlert, History, User, Box, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [totalVaults, totalIdentities, recentLogs, quarantinedVaults] = await Promise.all([
    prisma.organization.count({ where: { isSuspended: false, deletedAt: null } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        organization: { select: { name: true } }
      }
    }),
    prisma.organization.findMany({ 
      where: { isSuspended: true, deletedAt: null },
      select: { id: true, name: true, createdAt: true }
    })
  ]);

  return (
    <div className="space-y-12 pb-24">
      <header>
        <h2 className="text-4xl font-light tracking-tight text-white mb-2 flex items-center gap-4">
          Ultimate Cockpit
          <div className="px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-black">Secure Shell</span>
          </div>
        </h2>
        <p className="text-neutral-500 font-light uppercase tracking-widest text-[10px]">Root Administrative Command • Real-time Telemetry</p>
      </header>

      {/* ROW 1: KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500">
          <div className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-500 group-hover:text-white transition-all">
            <Box size={20} />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-8">Active Organizational Vaults</h3>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-white tracking-tighter">{totalVaults}</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Encrypted</span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-mono italic">SILOS_ONLINE</span>
            </div>
          </div>
        </div>

        <div className="group relative p-10 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500">
          <div className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-500 group-hover:text-white transition-all">
            <User size={20} />
          </div>
          <h3 className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-bold mb-8">Global Identity Population</h3>
          <div className="flex items-baseline gap-4">
            <span className="text-7xl font-light text-white tracking-tighter">{totalIdentities}</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-blue-500 font-bold">Authenticated</span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-600 font-mono italic">ACTORS_SYNCED</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: THE HEARTBEAT (MINI PANOPTICON) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-bold flex items-center gap-3">
            <Activity className="w-4 h-4 text-emerald-500" />
            System Heartbeat
          </h3>
          <a href="/admin/audit" className="text-[10px] uppercase tracking-widest text-neutral-500 hover:text-white transition-colors flex items-center gap-2">
            View Global Ledger <ArrowUpRight size={12} />
          </a>
        </div>
        
        <div className="rounded-2xl bg-black border border-white/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-white/5">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.01] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-mono text-neutral-600 uppercase italic">
                      {format(new Date(log.createdAt), "HH:mm:ss")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-light text-neutral-300">{log.user?.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">
                      {log.targetName || log.entityId}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ROW 3: THE QUARANTINE ZONE */}
      {quarantinedVaults.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h3 className="text-xs uppercase tracking-[0.3em] text-red-500 font-bold flex items-center gap-3">
            <ShieldAlert className="w-4 h-4" />
            Quarantine Zone
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quarantinedVaults.map((vault) => (
              <div key={vault.id} className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-widest">{vault.name}</span>
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest text-red-500/60 font-mono">Status: LOCKED_DOWN</p>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-600 font-mono">Since: {format(new Date(vault.createdAt), "MMM dd, yyyy")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

