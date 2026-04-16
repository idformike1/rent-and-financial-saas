import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ShieldAlert, Fingerprint, Activity, Clock, User as UserIcon, Tag, Database } from "lucide-react"
import { Badge } from "@/components/ui-finova"

export default async function AuditLogPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'OWNER') {
    return redirect('/home');
  }

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: session.user.organizationId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const getBadgeStyle = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'INVITE':
      case 'ACTIVATE':
        return 'bg-[var(--primary-muted)] text-[var(--primary)] border-[var(--primary)]/20';
      case 'UPDATE':
      case 'ROLE_CHANGE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE':
      case 'DEACTIVATE':
      case 'NUCLEAR_PURGE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-muted text-[var(--muted)] border-border';
    }
  };

  const statCards = [
    { label: 'Capture Points', value: logs.length, icon: Database },
    { label: 'Threat Identity', value: session.user.organizationName, icon: UserIcon },
    { label: 'Grid Status', value: 'NOMINAL', icon: Activity },
    { label: 'Archive Depth', value: '100 ITEMS', icon: Clock },
  ];

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <div className="space-y-6 pb-24 max-w-7xl mx-auto animate-in fade-in duration-500 pt-10">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-500/10 rounded-[8px] flex items-center justify-center border border-rose-500/20">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <Badge variant="brand" className="px-5 py-2 rounded-[8px] text-[9px] bg-[#5D71F9]/10 text-[#5D71F9] border-[#5D71F9]/20">
              System Security Log
            </Badge>
          </div>
          <h1 className="text-display font-weight-display text-white leading-none">
            Audit Protocol
          </h1>
          <p className="text-[10px] text-[#9CA3AF] flex items-center gap-2">
            <Fingerprint className="w-3 h-3" />
            System Activity Log
          </p>
        </div>
        <div className="glass-panel rounded-[8px] px-6 py-3 border border-[var(--border)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--primary)] animate-pulse" />
          <span className="text-[10px]  text-[var(--foreground)]">Live Monitoring</span>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <div key={s.label} className="glass-panel rounded-[8px] p-6 border border-[var(--border)] flex flex-col justify-between gap-3 hover:border-[var(--primary)]/30 transition-all">
            <div className="flex justify-between items-center text-[var(--muted)]">
              <span className="text-[9px] ">{s.label}</span>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="text-xl text-[var(--foreground)] ">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-[8px] border border-[var(--border)] overflow-hidden">
        {/* Table Header */}
        <div className="bg-[var(--card-raised,#202840)] px-8 py-5 border-b border-[var(--border)] flex justify-between items-center">
          <span className="text-[10px]  text-[var(--muted)]">Chronological Forensic Feed</span>
          <span className="text-[9px] text-[var(--primary)]">{logs.length} RECORDS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border)]">
              <tr>
                {['Timestamp', 'Operator', 'Action', 'Target', 'Metadata'].map(h => (
                  <th key={h} className="px-8 py-5 text-left text-[9px]  text-[var(--muted)]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-[var(--muted)]  text-[10px]">
                    No forensic captures available. System secure.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="bg-[var(--card)]/50 hover:bg-[var(--primary)]/5 transition-colors group">
                    <td className="px-8 py-5 text-[11px] font-bold text-[var(--muted)]">
                      {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[6px] bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] text-xs">
                          {log.user.name?.[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px]  text-[var(--foreground)]">{log.user.name}</span>
                          <span className="text-[9px] text-[var(--muted)]">{log.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-[6px] text-[9px]   border ${getBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px]  tracking-tight text-[var(--foreground)] flex items-center gap-1">
                          <Tag className="w-3 h-3 text-[var(--muted)]" /> {log.entityType}
                        </span>
                        <span className="text-[9px] text-[var(--muted)] truncate w-32 group-hover:w-auto transition-all">
                          {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="glass-panel text-[9px] p-4 rounded-[8px] border border-[var(--border)] min-w-[280px]">
                        {log.metadata && Object.keys(log.metadata).length > 0 ? (
                          <div className="flex flex-col gap-1.5 line-clamp-4 group-hover:line-clamp-none transition-all">
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <div key={key} className="flex items-start gap-2 break-all">
                                <span className="text-[var(--primary)] shrink-0">"{key}":</span>
                                <span className="text-[var(--muted)]">
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[var(--muted)]">No Metadata Attributes</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  )
}
