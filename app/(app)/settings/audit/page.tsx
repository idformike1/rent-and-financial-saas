import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ShieldAlert, Fingerprint, Activity, Clock, User as UserIcon, Tag, Database, Search } from "lucide-react"

export default async function AuditLogPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'OWNER') {
    return redirect('/dashboard');
  }

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: session.user.organizationId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  const getBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
      case 'INVITE':
      case 'ACTIVATE':
        return 'bg-emerald-500 text-white shadow-[2px_2px_0px_0px_rgba(5,150,105,1)]';
      case 'UPDATE':
      case 'ROLE_CHANGE':
        return 'bg-amber-500 text-white shadow-[2px_2px_0px_0px_rgba(217,119,6,1)]';
      case 'DELETE':
      case 'DEACTIVATE':
      case 'NUCLEAR_PURGE':
        return 'bg-rose-600 text-white shadow-[2px_2px_0px_0px_rgba(153,27,27,1)]';
      default:
        return 'bg-slate-900 text-white';
    }
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b-8 border-black pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-600 text-white rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
              Surveillance Grid
            </h1>
          </div>
          <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.4em] flex items-center">
            <Fingerprint className="w-3 h-3 mr-2" /> 
            Immutable Forensic Archive • High-Value Asset Protection
          </p>
        </div>

        <div className="flex gap-4">
            <div className="bg-black text-white px-6 py-3 rounded-xl border-4 border-black text-[10px] font-black uppercase tracking-widest flex items-center italic">
                <Activity className="w-4 h-4 mr-2 text-indigo-400 animate-pulse" /> Live Monitoring
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
            { label: 'Capture Points', value: logs.length, icon: <Database /> },
            { label: 'Threat Identity', value: session.user.organizationName, icon: <UserIcon /> },
            { label: 'Grid Status', value: 'NOMINAL', icon: <Activity className="text-emerald-500" /> },
            { label: 'Archive Depth', value: '100 ITEMS', icon: <Clock /> }
        ].map(s => (
            <div key={s.label} className="bg-white border-4 border-black p-6 rounded-3xl flex flex-col justify-between shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="text-zinc-400 font-bold text-[9px] uppercase tracking-widest flex items-center justify-between">
                    {s.label} {s.icon}
                </div>
                <div className="text-2xl font-black italic uppercase tracking-tighter mt-2">{s.value}</div>
            </div>
        ))}
      </div>

      <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] rounded-[40px] overflow-hidden">
        <div className="bg-black text-white p-6 flex justify-between items-center italic">
            <span className="text-xs font-black uppercase tracking-widest">Chronological Forensic Feed</span>
            <div className="relative group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input type="text" placeholder="QUERY UUID OR ACTION..." className="bg-zinc-900 border-2 border-zinc-700 rounded-lg px-10 py-2 text-[10px] uppercase font-black tracking-widest outline-none focus:border-indigo-500 w-64 transition-all" />
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b-4 border-black">
              <tr>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Timestamp</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Operator</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Action Badge</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Tactical Target</th>
                <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-zinc-400 font-black italic uppercase tracking-widest bg-zinc-100">
                    No forensic captures available. System secure.
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-zinc-50 transition-colors group">
                    <td className="px-8 py-6 font-mono text-[11px] font-bold text-zinc-500">
                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {log.user.name?.[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase italic tracking-tighter leading-none">{log.user.name}</span>
                            <span className="text-[9px] font-bold text-zinc-400 tracking-tight">{log.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] italic ${getBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase italic tracking-tighter bg-zinc-100 px-2 py-1 rounded inline-block w-fit">
                            <Tag className="w-3 h-3 inline mr-1" /> {log.entityType}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-400 lowercase tracking-tighter truncate w-32 group-hover:w-auto transition-all">
                            ID: {log.entityId}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                         <div className="bg-black text-[9px] font-mono p-3 rounded-xl border-2 border-zinc-800 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] overflow-hidden">
                            <pre className="text-indigo-400 leading-tight">
                                {JSON.stringify(log.metadata, null, 2) || '{}'}
                            </pre>
                         </div>
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
  )
}
