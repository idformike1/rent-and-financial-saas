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
    <div className="border-4 border-black bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <table className="w-full text-left border-collapse">
        <thead className="bg-black text-white uppercase text-xs tracking-widest font-black">
          <tr>
            <th className="p-4 border-r-2 border-zinc-800">User</th>
            <th className="p-4 border-r-2 border-zinc-800">Role</th>
            <th className="p-4 text-center border-r-2 border-zinc-800">The Muzzle</th>
            <th className="p-4 text-center border-r-2 border-zinc-800">The Kick</th>
            <th className="p-4 text-center">Nuclear</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-black">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-zinc-50 transition-colors group">
              <td className="p-4 border-r-2 border-black">
                <div className="flex flex-col">
                  <span className="font-black uppercase tracking-tight text-sm">{user.name || 'UNNAMED OPERATOR'}</span>
                  <span className="text-xs text-zinc-500 font-mono tracking-tighter">{user.email}</span>
                </div>
              </td>
              <td className="p-4 border-r-2 border-black">
                <select 
                  value={user.role}
                  disabled={user.id === currentUserId}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="bg-zinc-100 border-2 border-black p-1 text-xs font-black uppercase tracking-tighter cursor-pointer focus:ring-0"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MANAGER">MANAGER</option>
                </select>
              </td>
              <td className="p-4 text-center border-r-2 border-black">
                <button 
                  onClick={() => handleToggleEdit(user.id, user.canEdit)}
                  className={`p-2 border-2 border-black transition-all ${user.canEdit ? 'bg-black text-white' : 'bg-white text-zinc-300'}`}
                  title={user.canEdit ? "Can Edit (Shield Active)" : "View-Only (Muzzled)"}
                >
                  <Shield size={18} fill={user.canEdit ? "white" : "none"} />
                </button>
              </td>
              <td className="p-4 text-center border-r-2 border-black">
                <button 
                  disabled={user.id === currentUserId}
                  onClick={() => handleToggleActive(user.id, user.isActive)}
                  className={`p-2 border-2 border-black transition-all ${user.isActive ? 'bg-green-500 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-red-500 text-white opacity-50'} disabled:opacity-20`}
                >
                  <Power size={18} />
                </button>
              </td>
              <td className="p-4 text-center">
                <button 
                  disabled={user.id === currentUserId}
                  onClick={() => setDeleteModal({ open: true, user })}
                  className="p-2 border-2 border-black hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none disabled:opacity-20 group-hover:bg-red-50"
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
          <div className="bg-white border-8 border-black p-8 max-w-md w-full shadow-[16px_16px_0px_0px_rgba(255,0,0,0.5)]">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-black uppercase tracking-tighter leading-none italic text-red-600">
                NUCLEAR STRIKE
              </h2>
              <button onClick={() => setDeleteModal({ open: false, user: null })} className="p-1 hover:bg-zinc-100">
                <X size={32} />
              </button>
            </div>
            
            <p className="font-black uppercase text-sm mb-4 leading-tight">
              You are about to permanently purge <span className="underline decoration-red-600 decoration-4">{deleteModal.user.email}</span> from the organization.
            </p>
            
            <div className="bg-red-100 border-4 border-red-600 p-4 mb-6 text-xs font-bold leading-relaxed">
              WARNING: This action cannot be undone. All access will be revoked immediately. If historical records exist, this operation will fail.
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Verify target email to authorize purge:
              </label>
              <input 
                type="text" 
                placeholder={deleteModal.user.email}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full border-4 border-black p-3 font-mono text-sm uppercase placeholder:opacity-30 focus:outline-none focus:ring-4 focus:ring-red-600/20"
              />
              
              <button 
                disabled={confirmEmail !== deleteModal.user.email}
                onClick={handleDelete}
                className="w-full bg-red-600 text-white font-black py-4 uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-700 disabled:bg-zinc-300 disabled:shadow-none transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
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
