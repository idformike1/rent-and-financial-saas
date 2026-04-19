import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ShieldAlert, Fingerprint, Activity, Clock, User as UserIcon, Tag, Database } from "lucide-react"
import { Badge } from "@/components/ui-finova"
import { AuditFilterBar, MetadataExplorer } from './AuditClient'

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  if (!session) return null;

  const params = await searchParams;
  const page = parseInt(params.page as string || '1');
  const actionFilter = params.action as string | undefined;
  const operatorFilter = params.operator as string | undefined;

  const pageSize = 25;
  const skip = (page - 1) * pageSize;

  const where = {
    organizationId: session.user.organizationId,
    ...(actionFilter && { action: actionFilter }),
    ...(operatorFilter && { userId: operatorFilter }),
  };

  const [logs, totalCount, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({
      where: { organizationId: session.user.organizationId },
      select: { id: true, name: true, email: true },
    }),
  ]);

  const auditActions = [
    'CREATE', 'UPDATE', 'DELETE', 'NUCLEAR_PURGE', 'INVITE', 'ACTIVATE', 
    'DEACTIVATE', 'ROLE_CHANGE', 'MOVE_OUT', 'PAYMENT', 'GRANT_EDIT', 'REVOKE_EDIT'
  ];

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
    { label: 'Capture Points', value: totalCount, icon: Database },
    { label: 'Threat Identity', value: session.user.organizationName, icon: UserIcon },
    { label: 'Grid Status', value: 'NOMINAL', icon: Activity },
    { label: 'Archive Page', value: page, icon: Clock },
  ];

  return (
    <div className="bg-[var(--background)] text-[var(--foreground)] min-h-screen">
      <div className="space-y-6 pb-24 max-w-7xl mx-auto animate-in fade-in duration-500 pt-10 px-4">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-rose-500/10 rounded-[var(--radius-sm)] flex items-center justify-center border border-rose-500/20">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
            </div>
            <Badge variant="brand" className="px-5 py-2 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-widest bg-[#5D71F9]/10 text-[#5D71F9] border-[#5D71F9]/20">
              System Security Log
            </Badge>
          </div>
          <h1 className="text-display font-weight-display text-white leading-none">
            Audit Protocol
          </h1>
          <p className="text-[10px] text-foreground/40 flex items-center gap-2">
            <Fingerprint className="w-3 h-3" />
            System Activity Log // Forensic Archive
          </p>
        </div>
        <div className="glass-panel rounded-[var(--radius-sm)] px-6 py-3 border border-[var(--border)] flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--primary)] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--foreground)]">Security Node Active</span>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <div key={s.label} className="glass-panel rounded-[var(--radius-sm)] p-6 border border-[var(--border)] flex flex-col justify-between gap-3 hover:border-[var(--primary)]/30 transition-all">
            <div className="flex justify-between items-center text-[var(--muted)]">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">{s.label}</span>
              <s.icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-medium tracking-clinical text-[var(--foreground)] ">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <AuditFilterBar 
        users={users} 
        actions={auditActions} 
        currentFilters={{ page, action: actionFilter, operator: operatorFilter }} 
      />

      {/* Audit Log Table */}
      <div className="glass-panel rounded-[var(--radius-sm)] border border-[var(--border)] overflow-hidden">
        {/* Table Header */}
        <div className="bg-[var(--card-raised,#202840)] px-8 py-5 border-b border-[var(--border)] flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">Chronological Forensic Feed</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand">{totalCount} RECORDS FOUND</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-[var(--border)]">
              <tr className="bg-white/[0.02]">
                {['Timestamp', 'Operator', 'Action', 'Target', 'Intelligence'].map(h => (
                  <th key={h} className="px-8 py-5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-[var(--muted)]  text-[10px] uppercase tracking-widest">
                    No forensic captures matched the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="bg-[var(--card)]/50 hover:bg-[var(--primary)]/5 transition-all group border-l-2 border-l-transparent hover:border-l-brand">
                    <td className="px-8 py-5 text-[13px] font-medium tracking-clinical text-foreground/60 whitespace-nowrap">
                      {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--primary-muted)] flex items-center justify-center text-[var(--primary)] text-xs border border-[var(--primary)]/10">
                          {log.user?.name?.[0].toUpperCase() || 'S'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-[var(--foreground)] leading-tight">{log.user?.name || 'System'}</span>
                          <span className="text-[11px] text-foreground/40">{log.user?.email || 'automated.circuit'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-widest border ${getBadgeStyle(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold uppercase tracking-clinical text-[var(--foreground)] flex items-center gap-1">
                          <Tag className="w-3 h-3 text-foreground/40" /> {log.entityType}
                        </span>
                        <span className="text-[10px] tabular-nums text-foreground/40 truncate w-32">
                          {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <MetadataExplorer metadata={log.metadata} action={log.action} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Footer */}
      <div className="flex justify-between items-center mt-6 text-[10px] font-bold uppercase tracking-widest text-clinical-low">
         <div>Archive Records {skip + 1} - {Math.min(skip + pageSize, totalCount)} of {totalCount}</div>
         <div className="flex gap-4">
            <span className="text-foreground/20">Session ID: {session.user.id.slice(0, 8)}</span>
            <span className="text-foreground/20">Jurisdiction: {session.user.organizationId.slice(0, 8)}</span>
         </div>
      </div>
    </div>
    </div>
  )
}
