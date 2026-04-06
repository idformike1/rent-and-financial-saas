import { auth } from "@/auth"
import { fetchTeamMembers } from "@/actions/team.actions"
import UserTable from "@/components/team/UserTable"
import InviteOperatorButton from "@/components/team/InviteOperatorButton"
import { Users, UserCheck, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui-finova"

export default async function TeamPage() {
  const session = await auth()
  const { members, stats } = await fetchTeamMembers()

  const statCards = [
    { label: 'Total Deployment', value: stats.total, icon: Users, color: 'text-[var(--foreground)]' },
    { label: 'Active Duty', value: stats.active, icon: UserCheck, color: 'text-[var(--primary)]' },
    { label: 'View-Only', value: stats.viewOnly, icon: ShieldAlert, color: 'text-amber-400' },
  ]

  return (
    <div className="space-y-6 pb-24 max-w-7xl mx-auto animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--border)] pb-10">
        <div className="space-y-4">
          <Badge variant="brand" className="px-5 py-2 rounded-[8px]  text-[9px] bg-[var(--primary-muted)] border-2 border-[var(--primary)]/20">
            Team Command Center
          </Badge>
          <h1 className="text-display font-weight-display text-[var(--foreground)] leading-none">
            Team <span className="text-[var(--primary)]">Command</span>
          </h1>
          <p className="text-[10px] font-mono text-[var(--muted)]  tracking-[0.3em]">
            Cluster Identity: {session?.user?.organizationName}
          </p>
        </div>
        <InviteOperatorButton />
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((s) => (
          <div key={s.label} className="glass-panel rounded-[8px] p-6 flex flex-col justify-between gap-4 border border-[var(--border)] hover:border-[var(--primary)]/30 transition-all">
            <div className="flex justify-between items-start">
              <s.icon size={24} className={s.color} />
              <span className={`text-display font-weight-display font-mono ${s.color}`}>{s.value}</span>
            </div>
            <span className="text-[10px]  text-[var(--muted)]">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="space-y-6">
        <h2 className="text-xl  text-[var(--foreground)]">
          Registry Overview
        </h2>
        <UserTable
          users={members.map((m: any) => ({
            ...m,
            role: m.role as string
          }))}
          currentUserId={session?.user?.id}
        />
      </div>

      <footer className="text-[9px] font-mono text-[var(--muted)]  tracking-[0.3em] text-center pt-4 border-t border-[var(--border)]">
        Enterprise Multi-Tenancy Core // Unified Wealth Ledger // Terminal-01
      </footer>
    </div>
  )
}
