'use client'

import { useState } from 'react'
import { Shield, Power, Trash2, X, AlertCircle } from 'lucide-react'
import { deleteUserForever, toggleUserActivation, toggleUserEditPermission, updateUserRole } from '@/actions/team.actions'
import { Badge, Button, Input, Select } from '@/components/ui-finova'
import { cn } from '@/lib/utils'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isActive: boolean
  canEdit: boolean
}

export default function UserTable({ users, currentUserId }: { users: User[], currentUserId?: string }) {
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, user: User | null }>({ open: false, user: null })
  const [confirmEmail, setConfirmEmail] = useState('')

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role)
      alert(`Role recalibrated to ${role}`)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserActivation(userId, !currentStatus)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleToggleEdit = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserEditPermission(userId, !currentStatus)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.user) return
    if (confirmEmail !== 'CONFIRM') return

    try {
      await deleteUserForever(deleteModal.user.id)
      setDeleteModal({ open: false, user: null })
      setConfirmEmail('')
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div className="w-full relative">
      <div className="w-full overflow-x-auto border border-border rounded-[8px] bg-card">
        <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase">Identity</th>
              <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase">Role Allocation</th>
              <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase text-center">Perms</th>
              <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase text-center">Status</th>
              <th className="px-4 py-3 text-[12px] font-bold text-muted-foreground uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="h-[52px] hover:bg-foreground/[0.02] group transition-none cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-foreground tracking-tight">
                      {user.name || 'UNNAMED OPERATOR'}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold lowercase">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select 
                    value={user.role}
                    disabled={user.id === currentUserId}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="w-32 py-1 h-8 text-[11px] font-bold"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                  </Select>
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => handleToggleEdit(user.id, user.canEdit)}
                    className={cn(
                      "p-1.5 rounded-[6px] border transition-none",
                      user.canEdit 
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : "border-border bg-muted/50 text-muted-foreground"
                    )}
                  >
                    <Shield size={14} fill={user.canEdit ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    disabled={user.id === currentUserId}
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={cn(
                      "inline-flex items-center gap-2 px-2 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase transition-none disabled:opacity-10",
                      user.isActive 
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400'
                    )}
                  >
                    {user.isActive ? 'ACTIVE' : 'LOCKED'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    disabled={user.id === currentUserId}
                    onClick={() => setDeleteModal({ open: true, user })}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-[6px] transition-none disabled:opacity-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MERCURY MODAL (DUAL-THEME) ─────────────────────────────────────────── */}
      {deleteModal.open && deleteModal.user && (
        <>
          <div className="fixed inset-0 z-50 bg-background/80" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-[12px] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-foreground uppercase">Authorize Nuclear Purge</h2>
              <button 
                onClick={() => setDeleteModal({ open: false, user: null })} 
                className="text-muted-foreground hover:text-foreground transition-none"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 p-4 mb-8 rounded-[8px] flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground">Vaporizing identity: {deleteModal.user.email}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-tight leading-relaxed font-bold">This action is irreversible. All access tokens will be invalidated immediately.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase block mb-2">
                  Type "CONFIRM" to validate
                </label>
                <Input 
                  type="text" 
                  placeholder="CONFIRM"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="font-mono text-[13px] uppercase h-12"
                />
              </div>
              
              <Button 
                variant="primary"
                disabled={confirmEmail !== 'CONFIRM'}
                onClick={handleDelete}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 rounded-[8px]"
              >
                EXECUTE PURGE
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
