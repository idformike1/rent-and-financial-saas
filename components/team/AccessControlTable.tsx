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
    <div className="w-full overflow-x-auto relative">
      <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
        <thead className="border-b border-[#23252A]">
          <tr className="bg-transparent">
            <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A]">User Identity</th>
            <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A]">Overarching Role</th>
            <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A] text-center">Permissions</th>
            <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A] text-center">Status</th>
            <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-none">
          {members.map((member) => (
            <tr 
              key={member.id} 
              className={cn(
                "border-b border-[#23252A] hover:bg-[#14161A] group transition-none cursor-pointer",
                isPending && "opacity-50"
              )}
            >
              <td className="px-4 py-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">
                      {member.name || 'Anonymous'}
                    </span>
                    {member.id === currentUserId && (
                      <Badge variant="default" className="text-[9px] px-1.5 py-0 border-[#23252A]/50 lowercase">you</Badge>
                    )}
                  </div>
                  <span className="text-xs text-[#8A919E] font-mono lowercase">{member.email}</span>
                </div>
              </td>
              
              <td className="px-4 py-4">
                <select
                  value={member.role}
                  onChange={(e) => handleAction(() => updateUserRole(member.id, e.target.value), "Role recalibrated")}
                  disabled={member.id === currentUserId}
                  className="bg-transparent border border-[#23252A] text-[11px] font-bold text-white px-2 py-1 rounded-[4px] focus:outline-none focus:border-white transition-none disabled:opacity-30"
                >
                  <option value="OWNER" className="bg-[#0B0D10]">OWNER</option>
                  <option value="MANAGER" className="bg-[#0B0D10]">MANAGER</option>
                  <option value="ADMIN" className="bg-[#0B0D10]">ADMIN</option>
                </select>
              </td>

              <td className="px-4 py-4 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(() => toggleUserEditPermission(member.id, !member.canEdit), member.canEdit ? "Muzzled" : "Unmuzzled")
                  }}
                  className={`p-1.5 rounded-[4px] border transition-none ${
                    member.canEdit 
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                      : 'border-[#23252A] bg-transparent text-[#8A919E]'
                  }`}
                >
                  {member.canEdit ? <Shield size={14} /> : <ShieldAlert size={14} />}
                </button>
              </td>

              <td className="px-4 py-4 text-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAction(() => toggleUserActivation(member.id, !member.isActive), member.isActive ? "Suspended" : "Restored")
                  }}
                  disabled={member.id === currentUserId}
                  className={cn(
                    "inline-flex items-center gap-2 px-2 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase transition-none disabled:opacity-10",
                    member.isActive 
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                      : 'border-rose-500/20 bg-rose-500/5 text-rose-500'
                  )}
                >
                  {member.isActive ? 'ACTIVE' : 'LOCKED'}
                </button>
              </td>

              <td className="px-4 py-4 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm("Purge identity forever?")) {
                      handleAction(() => deleteUserForever(member.id), "Vaporized")
                    }
                  }}
                  disabled={member.id === currentUserId}
                  className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-[4px] transition-none disabled:opacity-10"
                >
                  <UserMinus size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isPending && (
        <div className="absolute inset-0 bg-[#0B0D10]/20 flex items-center justify-center z-10">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      )}
    </div>
  )
}
