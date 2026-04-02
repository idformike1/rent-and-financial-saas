import { auth } from "@/auth"
import { fetchTeamMembers } from "@/actions/team.actions"
import UserTable from "@/components/team/UserTable"
import InviteOperatorButton from "@/components/team/InviteOperatorButton"
import { Users, UserCheck, ShieldAlert, Plus } from "lucide-react"

export default async function TeamPage() {
  const session = await auth()
  const { members, stats } = await fetchTeamMembers()

  return (
    <div className="space-y-12 pb-24 font-mono">
      {/* Brutalist Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
        <div>
          <h1 className="text-7xl font-black uppercase tracking-tighter leading-[0.8] mb-2">
            Team<br/>Command
          </h1>
          <div className="flex items-center gap-2 bg-black text-white px-4 py-2 w-fit">
            <span className="text-[10px] uppercase font-black tracking-widest opacity-50">Cluster Identity:</span>
            <span className="text-lg font-black uppercase italic tracking-tighter">
              {session?.user?.organizationName}
            </span>
          </div>
        </div>

        <InviteOperatorButton />
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start mb-2">
            <Users size={32} />
            <span className="text-4xl font-black">{stats.total}</span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Total Deployment</span>
        </div>

        <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start mb-2">
            <UserCheck size={32} className="text-green-600" />
            <span className="text-4xl font-black">{stats.active}</span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Active Duty</span>
        </div>

        <div className="border-4 border-black p-6 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start mb-2">
            <ShieldAlert size={32} className="text-amber-500" />
            <span className="text-4xl font-black">{stats.viewOnly}</span>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Muzzled (View-Only)</span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="space-y-4">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
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

      <footer className="bg-black text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] p-2 flex justify-center">
        Enterprise Multi-Tenancy Core // Unified Wealth Ledger // Terminal-01
      </footer>
    </div>
  )
}
