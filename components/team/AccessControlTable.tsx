'use client'

import { useTransition } from 'react'
import { 
  updateUserRole, 
  toggleUserActivation, 
  toggleUserEditPermission, 
  deleteUserForever 
} from "@/actions/team.actions"
import { Button, Badge } from '@/components/ui-finova'
import { toast } from 'react-hot-toast'
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
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase">User Identity</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase">Overarching Role</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase text-center">Permissions</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase text-center">Status</th>
            <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase text-right">Actions</th>
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
                <Button
                  type="button"
                  variant="ghost"
                  disabled={false}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(() => toggleUserEditPermission(member.id, !member.canEdit), member.canEdit ? "Muzzled" : "Unmuzzled")
                  }}
                  className={cn(
                    "p-1.5 rounded-[6px] border transition-none h-auto min-w-[32px]",
                    member.canEdit 
                      ? "border-mercury-green/20 bg-mercury-green/10 text-mercury-green" 
                      : "border-border bg-muted/50 text-muted-foreground"
                  )}
                >
                  {member.canEdit ? "✓" : "⚠️"}
                </Button>
              </td>

              <td className="px-4 py-3 text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(() => toggleUserActivation(member.id, !member.isActive), member.isActive ? "Suspended" : "Restored")
                  }}
                  disabled={member.id === currentUserId}
                  className={cn(
                    "inline-flex items-center gap-2 px-2 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase transition-none disabled:opacity-30 h-auto",
                    member.isActive 
                      ? 'border-mercury-green/20 bg-mercury-green/10 text-mercury-green' 
                      : 'border-destructive/20 bg-destructive/10 text-destructive'
                  )}
                >
                  {member.isActive ? 'ACTIVE' : 'LOCKED'}
                </Button>
              </td>

              <td className="px-4 py-3 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("Purge identity forever?")) {
                      handleAction(() => deleteUserForever(member.id), "Vaporized")
                    }
                  }}
                  disabled={member.id === currentUserId}
                  className="p-1.5 text-destructive hover:bg-destructive/10 rounded-[6px] transition-none disabled:opacity-10 h-auto"
                >
                  [⌫]
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 font-bold text-primary animate-pulse">
          ...
        </div>
      )}
    </div>
  )
}
