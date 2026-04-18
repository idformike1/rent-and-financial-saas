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
      <div className="w-full overflow-x-auto border border-border rounded-[var(--radius-sm)] bg-card">
        <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted">Identity</th>
              <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted">Role Allocation</th>
              <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted text-center">Perms</th>
              <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted text-center">Status</th>
              <th className="px-4 py-3 text-mercury-label-caps text-clinical-muted text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="h-[52px] hover:bg-foreground/[0.02] group transition-none cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="text-mercury-heading text-foreground">
                      {user.name || 'UNNAMED OPERATOR'}
                    </span>
                    <span className="text-mercury-label-caps text-clinical-muted">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select 
                    value={user.role}
                    disabled={user.id === currentUserId}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="w-32 py-1 h-8 text-mercury-label-caps"
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
                      "p-1.5 rounded-[var(--radius-sm)] border transition-none",
                      user.canEdit 
                        ? "border-mercury-green/20 bg-mercury-green/10 text-mercury-green" 
                        : "border-border bg-muted/50 text-clinical-muted"
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
                      "inline-flex items-center gap-2 px-2 py-0.5 rounded-[4px] border text-mercury-label-caps transition-none disabled:opacity-10",
                      user.isActive 
                        ? 'border-mercury-green/20 bg-mercury-green/10 text-mercury-green' 
                        : 'border-destructive/20 bg-destructive/10 text-destructive'
                    )}
                  >
                    {user.isActive ? 'ACTIVE' : 'LOCKED'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button 
                    disabled={user.id === currentUserId}
                    onClick={() => setDeleteModal({ open: true, user })}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-[var(--radius-sm)] transition-none disabled:opacity-10"
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
          <div className="fixed inset-0 z-50 " />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-card border border-border rounded-[var(--radius-sm)] p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-mercury-label-caps text-foreground">Authorize Nuclear Purge</h2>
              <button 
                onClick={() => setDeleteModal({ open: false, user: null })} 
                className="text-clinical-muted hover:text-foreground transition-none"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-destructive/10 border border-destructive/20 p-4 mb-8 rounded-[var(--radius-sm)] flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-mercury-heading text-foreground">Vaporizing identity: {deleteModal.user.email}</p>
                <p className="text-mercury-label-caps text-clinical-muted leading-relaxed">This action is irreversible. All access tokens will be invalidated immediately.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-mercury-label-caps text-clinical-muted block mb-2">
                  Type "CONFIRM" to validate
                </label>
                <Input 
                  type="text" 
                  placeholder="CONFIRM"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="text-mercury-label-caps h-12 rounded-[var(--radius-sm)]"
                />
              </div>
              
              <Button 
                variant="primary"
                disabled={confirmEmail !== 'CONFIRM'}
                onClick={handleDelete}
                className="w-full bg-destructive hover:bg-destructive/90 text-white h-12 rounded-[var(--radius-sm)] text-mercury-label-caps"
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
