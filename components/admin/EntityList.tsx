"use client";
import { useTransition, useState, useMemo, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toggleUserStatus, deleteUser, updateUserRole } from "@/actions/management.actions";
import { impersonateUser, adminResetUserPassword, deleteOrganization } from "@/actions/system.actions";
import { Eye, Key, UserPlus, ChevronDown, ChevronRight, Shield, Trash2, Power } from "lucide-react";
import SudoDeleteModal from "./SudoDeleteModal";
import AddUserModal from "./AddUserModal";

interface Entity {
  id: string;
  name: string;
  users: {
    id: string;
    email: string;
    role: string;
    accountStatus: string;
  }[];
}

interface EntityListProps {
  entities: Entity[];
}

export function EntityList({ entities }: EntityListProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [resetModal, setResetModal] = useState<{email: string, tempPassword: string} | null>(null);
  const [sudoModal, setSudoModal] = useState<{id: string, name: string, type: 'USER' | 'ORG'} | null>(null);
  const [addUserOrg, setAddUserOrg] = useState<{id: string, name: string} | null>(null);
  
  // ACCORDION STATE: Track expanded organizations
  const [expandedOrgIds, setExpandedOrgIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    const newSet = new Set(expandedOrgIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedOrgIds(newSet);
  };

  const filteredEntities = useMemo(() => {
    return entities.filter(org => {
      const searchStr = searchQuery.toLowerCase();
      const matchOrg = org.name.toLowerCase().includes(searchStr);
      const matchUser = org.users.some(u => u.email.toLowerCase().includes(searchStr));
      return matchOrg || matchUser;
    });
  }, [entities, searchQuery]);

  const handleToggleStatus = (userId: string, currentStatus: string) => {
    const action = currentStatus === 'ACTIVE' ? 'suspend' : 'reactivate';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      startTransition(async () => {
        await toggleUserStatus(userId, currentStatus);
        router.refresh();
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string, currentRole: string) => {
    if (confirm(`Elevate/Demote this identity to ${newRole}?`)) {
      startTransition(async () => {
        const res = await updateUserRole(userId, newRole as any);
        if (!res.success) {
          alert(res.error || "Failed to update role.");
          router.refresh(); // Sync UI back to DB state
        } else {
          router.refresh();
        }
      });
    } else {
      router.refresh(); // Reset selection if cancelled
    }
  };

  const handleResetPassword = (userId: string, email: string) => {
    if (confirm(`Are you sure you want to reset the password for ${email}?`)) {
      startTransition(async () => {
        try {
          const res = await adminResetUserPassword(userId);
          if (res.success && res.tempPassword) {
            setResetModal({ email, tempPassword: res.tempPassword });
            router.refresh();
          }
        } catch (error) {
          alert("Failed to reset password.");
        }
      });
    }
  };

  const handleTerminate = async (id: string, type: 'USER' | 'ORG') => {
    if (type === 'ORG') {
      await deleteOrganization(id);
    } else {
      await deleteUser(id);
    }
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
      {/* Header Section: Fixed */}
      <div className="p-8 border-b border-white/5 bg-black/20 backdrop-blur-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-1">Entity Registry</h3>
            <p className="text-sm text-neutral-400">Orchestrate organizations and their administrative staff.</p>
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search registry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 rounded-xl bg-black border border-white/5 text-xs text-white focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-neutral-700"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-widest text-neutral-600 font-mono">
              {filteredEntities.length} ENTITIES
            </div>
          </div>
        </div>
      </div>

      {/* Table Container: Scrollable with sticky header */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20 bg-neutral-950/80 backdrop-blur-md">
            <tr className="border-b border-white/5">
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Organization</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Staff Composition</th>
              <th className="px-8 py-4 text-[10px] uppercase tracking-widest text-neutral-500 font-medium text-right">Global Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredEntities.map((org) => (
              <Fragment key={org.id}>
                {/* ORGANIZATION ROW */}
                <tr className={`group transition-colors ${expandedOrgIds.has(org.id) ? 'bg-white/[0.03]' : 'hover:bg-white/[0.01]'}`}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleExpand(org.id)}
                        className="p-1 rounded bg-white/5 hover:bg-white/10 text-neutral-500 transition-colors"
                      >
                        {expandedOrgIds.has(org.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <div>
                        <div className="text-sm font-medium text-white">{org.name}</div>
                        <div className="text-[10px] font-mono text-neutral-600 mt-1 uppercase tracking-tighter">{org.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                        {org.users.length} Administrative Staff
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => setAddUserOrg({ id: org.id, name: org.name })}
                        className="p-2 rounded-lg border border-white/5 text-neutral-500 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                        title="Add Staff"
                      >
                        <UserPlus size={14} />
                      </button>
                      <button 
                        onClick={() => setSudoModal({ id: org.id, name: org.name, type: 'ORG' })}
                        className="px-4 py-2 rounded-lg border border-red-500/20 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        Terminate Vault
                      </button>
                    </div>
                  </td>
                </tr>

                {/* EXPANDED DRAWER: USER LIST */}
                {expandedOrgIds.has(org.id) && (
                  <tr>
                    <td colSpan={3} className="bg-black/40 px-8 py-0">
                      <div className="border-l-2 border-emerald-500/20 ml-2 my-4">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/5">
                              <th className="pl-12 pr-4 py-3 text-[9px] uppercase tracking-widest text-neutral-600">Identity Email</th>
                              <th className="px-4 py-3 text-[9px] uppercase tracking-widest text-neutral-600">System Role</th>
                              <th className="px-4 py-3 text-[9px] uppercase tracking-widest text-neutral-600">Account Status</th>
                              <th className="pl-4 pr-0 py-3 text-[9px] uppercase tracking-widest text-neutral-600 text-right">Identity Controls</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {org.users.map((user) => (
                              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="pl-12 pr-4 py-4">
                                  <span className="text-sm text-neutral-300 font-light">{user.email}</span>
                                </td>
                                <td className="px-4 py-4">
                                  <select 
                                    value={user.role}
                                    disabled={isPending}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value, user.role)}
                                    className="bg-transparent text-[10px] font-mono text-neutral-400 uppercase tracking-widest border-none focus:ring-0 cursor-pointer hover:text-white transition-colors"
                                  >
                                    <option value="OWNER" className="bg-neutral-900">OWNER</option>
                                    <option value="MANAGER" className="bg-neutral-900">MANAGER</option>
                                    <option value="VIEWER" className="bg-neutral-900">VIEWER</option>
                                  </select>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${user.accountStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    <span className={`text-[10px] uppercase tracking-tighter font-mono ${user.accountStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-red-500'}`}>
                                      {user.accountStatus}
                                    </span>
                                  </div>
                                </td>
                                <td className="pl-4 pr-0 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => startTransition(async () => {
                                        const res = await impersonateUser(user.id);
                                        if (res.success) router.push('/home');
                                      })}
                                      className="p-1.5 rounded bg-white/5 text-neutral-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                      title="Impersonate"
                                    >
                                      <Eye size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleResetPassword(user.id, user.email)}
                                      className="p-1.5 rounded bg-white/5 text-neutral-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                                      title="Reset Access"
                                    >
                                      <Key size={12} />
                                    </button>
                                    <button 
                                      onClick={() => handleToggleStatus(user.id, user.accountStatus)}
                                      className={`p-1.5 rounded bg-white/5 transition-all ${
                                        user.accountStatus === 'ACTIVE' ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'
                                      }`}
                                      title={user.accountStatus === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                                    >
                                      <Power size={12} />
                                    </button>
                                    <button 
                                      onClick={() => setSudoModal({ id: user.id, name: user.email, type: 'USER' })}
                                      className="p-1.5 rounded bg-white/5 text-neutral-600 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                      title="Terminate Identity"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {resetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-2">Access Key Materialized</h3>
            <p className="text-sm text-neutral-400 mb-6">
              A temporary password has been generated for <span className="text-emerald-500">{resetModal.email}</span>.
            </p>
            <div className="relative p-4 rounded-xl bg-black border border-white/5 mb-6">
              <code className="text-emerald-500 font-mono tracking-widest text-lg">{resetModal.tempPassword}</code>
            </div>
            <button
              onClick={() => setResetModal(null)}
              className="w-full h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
      {sudoModal && (
        <SudoDeleteModal 
          isOpen={!!sudoModal}
          onClose={() => setSudoModal(null)}
          entityName={sudoModal.name}
          onConfirm={() => handleTerminate(sudoModal.id, sudoModal.type)}
        />
      )}
      {addUserOrg && (
        <AddUserModal
          isOpen={!!addUserOrg}
          onClose={() => setAddUserOrg(null)}
          orgId={addUserOrg.id}
          orgName={addUserOrg.name}
        />
      )}
    </div>
  );
}
