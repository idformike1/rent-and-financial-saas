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
      <div className="w-full overflow-x-auto border border-[#23252A] rounded-[6px]">
        <table className="w-full text-sm text-left whitespace-nowrap border-collapse">
          <thead className="border-b border-[#23252A]">
            <tr className="bg-transparent">
              <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A]">Identity</th>
              <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A]">Role Allocation</th>
              <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A] text-center">Perms</th>
              <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A] text-center">Status</th>
              <th className="px-4 py-3 text-xs font-normal text-[#8A919E] bg-transparent border-b border-[#23252A] text-right">Nuclear</th>
            </tr>
          </thead>
          <tbody className="divide-none">
            {users.map((user) => (
              <tr key={user.id} className="border-b border-[#23252A] hover:bg-[#14161A] group transition-none cursor-pointer">
                <td className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white tracking-tight">
                      {user.name || 'UNNAMED OPERATOR'}
                    </span>
                    <span className="text-[10px] text-[#8A919E] font-mono lowercase">{user.email}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Select 
                    value={user.role}
                    disabled={user.id === currentUserId}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="w-32 py-1 h-8"
                  >
                    <option value="OWNER">OWNER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="MANAGER">MANAGER</option>
                  </Select>
                </td>
                <td className="px-4 py-4 text-center">
                  <button 
                    onClick={() => handleToggleEdit(user.id, user.canEdit)}
                    className={cn(
                      "p-1.5 rounded-[4px] border transition-none",
                      user.canEdit 
                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" 
                        : "border-[#23252A] bg-transparent text-[#8A919E]"
                    )}
                  >
                    <Shield size={14} fill={user.canEdit ? "currentColor" : "none"} />
                  </button>
                </td>
                <td className="px-4 py-4 text-center">
                  <button 
                    disabled={user.id === currentUserId}
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={cn(
                      "inline-flex items-center gap-2 px-2 py-0.5 rounded-[4px] border text-[10px] font-bold uppercase transition-none disabled:opacity-10",
                      user.isActive 
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                        : 'border-rose-500/20 bg-rose-500/5 text-rose-500'
                    )}
                  >
                    {user.isActive ? 'ACTIVE' : 'LOCKED'}
                  </button>
                </td>
                <td className="px-4 py-4 text-right">
                  <button 
                    disabled={user.id === currentUserId}
                    onClick={() => setDeleteModal({ open: true, user })}
                    className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-[4px] transition-none disabled:opacity-10"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── STEP 10: MERCURY MODAL ─────────────────────────────────────────── */}
      {deleteModal.open && deleteModal.user && (
        <>
          <div className="fixed inset-0 z-50 bg-[#0B0D10]/90" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-[#14161A] border border-[#23252A] rounded-[8px] shadow-none p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Authorize Nuclear Purge</h2>
              <button 
                onClick={() => setDeleteModal({ open: false, user: null })} 
                className="text-[#8A919E] hover:text-white transition-none"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 mb-6 rounded-[6px] flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-white italic tracking-tight">Vaporizing identity: {deleteModal.user.email}</p>
                <p className="text-[10px] text-[#8A919E] uppercase tracking-widest leading-relaxed">This action is irreversible. All access tokens will be invalidated immediately.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-medium text-[#8A919E] uppercase tracking-widest block mb-2">
                  Type "CONFIRM" to validate
                </label>
                <Input 
                  type="text" 
                  placeholder="CONFIRM"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="font-mono text-xs uppercase"
                />
              </div>
              
              <Button 
                variant="primary"
                disabled={confirmEmail !== 'CONFIRM'}
                onClick={handleDelete}
                className="w-full bg-rose-500 text-[#0B0D10] hover:bg-rose-400 border-none h-12"
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
