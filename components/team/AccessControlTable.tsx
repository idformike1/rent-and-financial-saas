'use client'

import { useTransition, useState } from 'react'
import { 
  updateUserRole, 
  toggleUserActivation, 
  toggleUserEditPermission, 
  deleteUserForever 
} from "@/actions/team.actions"
import { Shield, UserMinus, ShieldAlert, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Member {
  id: string
  name: string | null
  email: string | null
  role: string
  isActive: boolean
  canEdit: boolean
}

export default function AccessControlTable({ 
  members, 
  currentUserId 
}: { 
  members: Member[], 
  currentUserId: string | undefined 
}) {
  const [isPending, startTransition] = useTransition()
  const [localMembers, setLocalMembers] = useState(members)

  const handleAction = async (action: () => Promise<any>, successMsg: string) => {
    startTransition(async () => {
      try {
        await action()
        toast.success(successMsg)
      } catch (error: any) {
        toast.error(error.message || "Action failed")
      }
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">User Identity</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted">Overarching Role</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted text-center">The Muzzle</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted text-center">Kill Switch</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted text-right">Nuclear</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member) => (
            <tr 
              key={member.id} 
              className={`group transition-colors duration-200 hover:bg-slate-50/30 dark:hover:bg-slate-800/20 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground uppercase tracking-tight">
                    {member.name || 'Anonymous User'}
                    {member.id === currentUserId && (
                      <span className="ml-2 text-[8px] bg-brand/10 text-brand px-1.5 py-0.5 rounded border border-brand/20">YOU</span>
                    )}
                  </span>
                  <span className="text-xs text-muted font-mono lowercase">{member.email}</span>
                </div>
              </td>
              
              <td className="px-6 py-4">
                <select
                  value={member.role}
                  onChange={(e) => handleAction(() => updateUserRole(member.id, e.target.value), "Role recalibrated")}
                  disabled={member.id === currentUserId}
                  className="bg-card border border-border text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-all disabled:opacity-50"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>

              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => handleAction(() => toggleUserEditPermission(member.id, !member.canEdit), member.canEdit ? "User muzzled" : "User unmuzzled")}
                  className={`inline-flex items-center justify-center p-2 rounded-xl border transition-all ${
                    member.canEdit 
                      ? 'border-brand/20 bg-brand/5 text-brand hover:bg-brand/10' 
                      : 'border-muted/20 bg-slate-100 dark:bg-slate-800 text-muted hover:text-foreground'
                  }`}
                  title={member.canEdit ? "Revoke Edit Access" : "Grant Edit Access"}
                >
                  {member.canEdit ? <Shield size={16} /> : <ShieldAlert size={16} />}
                </button>
              </td>

              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => handleAction(() => toggleUserActivation(member.id, !member.isActive), member.isActive ? "User identity suspended" : "User identity restored")}
                  disabled={member.id === currentUserId}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    member.isActive 
                      ? 'border-[var(--primary)]/20 bg-[var(--primary)]/5 text-[var(--primary)] dark:text-[var(--primary)] hover:bg-[var(--primary-muted)]' 
                      : 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                  }`}
                >
                  {member.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  {member.isActive ? 'ACTIVE' : 'LOCKED'}
                </button>
              </td>

              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => {
                    if (confirm("Initiate nuclear purge sequence? This cannot be undone if logs exist.")) {
                      handleAction(() => deleteUserForever(member.id), "User identity vaporized")
                    }
                  }}
                  disabled={member.id === currentUserId}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all disabled:opacity-30"
                  title="Purge Identity"
                >
                  <UserMinus size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && (
        <div className="absolute inset-0 bg-white/30 dark:bg-background/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
        </div>
      )}
    </div>
  )
}
