'use client'

import { useTransition } from 'react'
import { 
  updateUserRole, 
  toggleUserActivation, 
  toggleUserEditPermission, 
  deleteUserForever 
} from "@/actions/team.actions"
import { Shield, UserMinus, ShieldAlert, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Badge } from '@/components/ui-finova'
import { cn } from '@/lib/utils'

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
    <div className="w-full overflow-x-auto relative bg-card rounded-[8px] border border-border">
      <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest">User Identity</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest">Overarching Role</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest text-center">Permissions</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {members.map((member) => (
            <tr 
              key={member.id} 
              className={cn(
                "h-[52px] hover:bg-foreground/[0.02] group transition-none cursor-pointer",
                isPending && "opacity-50"
              )}
            >
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-foreground tracking-tight">
                      {member.name || 'Anonymous'}
                    </span>
                    {member.id === currentUserId && (
                      <Badge variant="default" className="text-[9px] px-1.5 py-0 border-primary/20 lowercase bg-primary/10 text-primary">you</Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold lowercase">{member.email}</span>
                </div>
              </td>
              
              <td className="px-4 py-3">
                <select
                  value={member.role}
                  onChange={(e) => handleAction(() => updateUserRole(member.id, e.target.value), "Role recalibrated")}
                  disabled={member.id === currentUserId}
                  className="bg-card border border-border text-[11px] font-bold text-foreground px-2 py-1 rounded-[6px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-none disabled:opacity-30 appearance-none"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(() => toggleUserEditPermission(member.id, !member.canEdit), member.canEdit ? "Muzzled" : "Unmuzzled")
                  }}
                  className={cn(
                    "p-1.5 rounded-[6px] border transition-none",
                    member.canEdit 
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "border-border bg-muted/50 text-muted-foreground"
                  )}
                >
                  {member.canEdit ? <Shield size={14} /> : <ShieldAlert size={14} />}
                </button>
              </td>

              <td className="px-4 py-3 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(() => toggleUserActivation(member.id, !member.isActive), member.isActive ? "Suspended" : "Restored")
                  }}
                  disabled={member.id === currentUserId}
                  className={cn(
                    "inline-flex items-center gap-2 px-2 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase transition-none disabled:opacity-10",
                    member.isActive 
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                  )}
                >
                  {member.isActive ? 'ACTIVE' : 'LOCKED'}
                </button>
              </td>

              <td className="px-4 py-3 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("Purge identity forever?")) {
                      handleAction(() => deleteUserForever(member.id), "Vaporized")
                    }
                  }}
                  disabled={member.id === currentUserId}
                  className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-[6px] transition-none disabled:opacity-10"
                >
                  <UserMinus size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      )}
    </div>
  )
}
