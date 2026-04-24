import { getGlobalAuditLogs } from "@/actions/audit.actions";
import { format } from "date-fns";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditSearch } from "@/components/admin/AuditSearch";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function PanopticonPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const res = await getGlobalAuditLogs(100, q);
  const logs = res.success ? res.data : [];

  const getActionStyles = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('SUSPEND') || act.includes('LOCKDOWN') || act.includes('TERMINATE')) {
      return "bg-red-500/10 text-red-500 border-red-500/20";
    }
    if (act.includes('CREATE') || act.includes('PROVISION') || act.includes('BOOTSTRAP') || act.includes('MATERIALIZE')) {
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-light tracking-tight text-white mb-2 flex items-center gap-4">
            The Panopticon
            <div className="px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-black">Live Telemetry</span>
            </div>
          </h2>
          <p className="text-neutral-500 font-light uppercase tracking-widest text-[10px]">Forensic Audit Ledger • Global Oversight</p>
        </div>
        
        <div className="flex items-center gap-4">
          <AuditSearch />
        </div>
      </header>

      <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-black/20">
              <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Timestamp</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Actor</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Vault</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Action</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] text-neutral-600 font-bold">Target Identity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <History size={48} className="text-neutral-500" />
                    <p className="text-xs uppercase tracking-[0.2em] font-mono">No events detected in current epoch</p>
                  </div>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-tighter">
                      {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-light text-neutral-200">{log.user?.email}</span>
                      <span className="text-[9px] uppercase tracking-tighter text-neutral-600 font-mono italic">Role: {(log.user as any)?.role || 'ADMIN'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs text-neutral-400 uppercase tracking-widest">{log.organization?.name || 'SYSTEM_CORE'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.1em]",
                      getActionStyles(log.action)
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">{log.entityType}:</span>
                        <span className="text-xs font-medium text-neutral-300">{log.targetName || 'UNKNOWN_TARGET'}</span>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-700 tracking-tighter uppercase">{log.entityId}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

