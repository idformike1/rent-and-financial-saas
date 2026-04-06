'use client'

import { useState } from 'react'
import { Shield, Power, Trash2, X } from 'lucide-react'
import { deleteUserForever, toggleUserActivation, toggleUserEditPermission, updateUserRole } from '@/actions/team.actions'

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

  const stats = {
    total: users.length,
    active: users.filter((m: any) => m.isActive).length,
    viewOnly: users.filter((m: any) => !m.canEdit).length
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUserRole(userId, role)
      alert(`Role updated to ${role}`)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserActivation(userId, !currentStatus)
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleToggleEdit = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserEditPermission(userId, !currentStatus)
      alert(`Permissions updated`)
    } catch (error: any) {
      alert(error.message)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.user) return
    if (confirmEmail !== deleteModal.user.email) return

    try {
      await deleteUserForever(deleteModal.user.id)
      alert('User purged from systems.')
      setDeleteModal({ open: false, user: null })
      setConfirmEmail('')
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div className="glass-panel overflow-hidden rounded-3xl shadow-sm dark:shadow-none">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[var(--background)] text-[var(--muted)] uppercase text-[10px] tracking-widest font-black border-b border-[var(--border)]">
          <tr>
            <th className="p-5 font-bold uppercase tracking-[0.2em]">User</th>
            <th className="p-5 font-bold uppercase tracking-[0.2em]">Role</th>
            <th className="p-5 text-center font-bold uppercase tracking-[0.2em]">The Muzzle</th>
            <th className="p-5 text-center font-bold uppercase tracking-[0.2em]">The Kick</th>
            <th className="p-5 text-center font-bold uppercase tracking-[0.2em]">Nuclear</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[var(--card-raised)] transition-colors group">
              <td className="p-5">
                <div className="flex flex-col">
                  <span className="font-black uppercase tracking-tight text-sm text-[var(--foreground)]">{user.name || 'UNNAMED OPERATOR'}</span>
                  <span className="text-xs text-[var(--muted)] font-mono tracking-tighter">{user.email}</span>
                </div>
              </td>
              <td className="p-5">
                <select 
                  value={user.role}
                  disabled={user.id === currentUserId}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="bg-[var(--background)] border border-[var(--border)] p-2 text-xs font-black uppercase tracking-tighter cursor-pointer focus:ring-1 focus:ring-[var(--primary)] rounded-xl text-[var(--foreground)]"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
              </td>
              <td className="p-5 text-center">
                <button 
                  onClick={() => handleToggleEdit(user.id, user.canEdit)}
                  className={`p-2 rounded-xl border border-transparent transition-all ${user.canEdit ? 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-light)]' : 'bg-[var(--card-raised)] text-[var(--muted)] hover:bg-[var(--background)] hover:border-[var(--border)]'}`}
                  title={user.canEdit ? "Can Edit (Shield Active)" : "View-Only (Muzzled)"}
                >
                  <Shield size={18} fill={user.canEdit ? "currentColor" : "none"} />
                </button>
              </td>
              <td className="p-5 text-center">
                <button 
                  disabled={user.id === currentUserId}
                  onClick={() => handleToggleActive(user.id, user.isActive)}
                  className={`p-2 rounded-xl transition-all ${user.isActive ? 'bg-[var(--primary-muted)] text-[var(--primary)] hover:bg-[var(--primary)]/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'} disabled:opacity-20`}
                >
                  <Power size={18} />
                </button>
              </td>
              <td className="p-5 text-center">
                <button 
                  disabled={user.id === currentUserId}
                  onClick={() => setDeleteModal({ open: true, user })}
                  className="p-2 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-20 hover:shadow-lg hover:shadow-rose-500/30"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel border-rose-500 p-8 max-w-md w-full shadow-lg rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic text-rose-500">
                NUCLEAR STRIKE
              </h2>
              <button onClick={() => setDeleteModal({ open: false, user: null })} className="p-2 rounded-xl hover:bg-[var(--card-raised)] text-[var(--muted)] hover:text-[var(--foreground)]">
                <X size={24} />
              </button>
            </div>
            
            <p className="font-black uppercase text-sm mb-4 leading-tight text-[var(--foreground)]">
              You are about to permanently purge <span className="underline decoration-rose-500 decoration-4">{deleteModal.user.email}</span> from the organization.
            </p>
            
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 mb-6 text-xs font-bold leading-relaxed text-rose-400 rounded-xl">
              WARNING: This action cannot be undone. All access will be revoked immediately. If historical records exist, this operation will fail.
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-[var(--muted)]">
                Verify target email to authorize purge:
              </label>
              <input 
                type="text" 
                placeholder={deleteModal.user.email}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 font-mono text-sm uppercase placeholder:opacity-30 focus:outline-none focus:ring-2 focus:ring-rose-500/50 text-[var(--foreground)]"
              />
              
              <button 
                disabled={confirmEmail !== deleteModal.user.email}
                onClick={handleDelete}
                className="w-full bg-rose-500 text-white font-black py-4 rounded-xl uppercase tracking-[0.2em] shadow-lg shadow-rose-500/30 hover:bg-rose-600 disabled:bg-[var(--card-raised)] disabled:text-[var(--muted)] disabled:shadow-none transition-all"
              >
                EXECUTE PURGE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
