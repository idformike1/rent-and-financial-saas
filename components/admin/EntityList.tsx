"use client";
import { useTransition, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { deactivateUser, deleteOrganization } from "@/actions/management.actions";
import { impersonateUser, adminResetUserPassword } from "@/actions/system.actions";
import { Eye, Key } from "lucide-react";

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

  const filteredEntities = useMemo(() => {
    return entities.filter(org => {
      const owner = org.users.find(u => u.role === 'OWNER') || org.users[0];
      const searchStr = searchQuery.toLowerCase();
      return org.name.toLowerCase().includes(searchStr) || 
             (owner?.email?.toLowerCase().includes(searchStr));
    });
  }, [entities, searchQuery]);

  const handleSuspend = (userId: string) => {
    if (confirm("Are you sure you want to suspend this user? They will lose all system access immediately.")) {
      startTransition(async () => {
        await deactivateUser(userId);
      });
    }
  };

  const handleResetPassword = (userId: string, email: string) => {
    if (confirm(`Are you sure you want to reset the password for ${email}?`)) {
      startTransition(async () => {
        try {
          const res = await adminResetUserPassword(userId);
          if (res.success && res.tempPassword) {
            setResetModal({ email, tempPassword: res.tempPassword });
          }
        } catch (error) {
          alert("Failed to reset password.");
        }
      });
    }
  };

  const handleTerminate = (orgId: string) => {
    if (confirm("CRITICAL WARNING: This will permanently delete the organization and all its data. This action is IRREVERSIBLE. Proceed?")) {
      startTransition(async () => {
        await deleteOrganization(orgId);
      });
    }
  };

  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-1">Entity Registry</h3>
          <p className="text-sm text-neutral-400">Live directory of provisioned organizations and their administrative owners.</p>
        </div>

        <div className="relative w-full md:w-80">
          <input 
            type="text" 
            placeholder="Filter entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-4 rounded-xl bg-black border border-white/5 text-xs text-white focus:border-emerald-500/50 focus:outline-none transition-all placeholder:text-neutral-700"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-widest text-neutral-600 font-mono">
            {filteredEntities.length} / {entities.length}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-4 text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Organization</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-neutral-500 font-medium">Primary Owner</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-neutral-500 font-medium text-center">Status</th>
              <th className="pb-4 text-[10px] uppercase tracking-widest text-neutral-500 font-medium text-right">Operational Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredEntities.map((org) => {
              const owner = org.users.find(u => u.role === 'OWNER') || org.users[0];
              return (
                <tr key={org.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="py-6">
                    <div className="text-sm font-medium text-white">{org.name}</div>
                    <div className="text-[10px] font-mono text-neutral-600 mt-1">{org.id}</div>
                  </td>
                  <td className="py-6">
                    <div className="text-sm text-neutral-300">{owner?.email || "N/A"}</div>
                    <div className="text-[10px] uppercase tracking-wider text-neutral-600 mt-1">{owner?.id ? 'Verified Identity' : 'No Owner Assigned'}</div>
                  </td>
                  <td className="py-6 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-mono tracking-tighter uppercase ${
                      owner?.accountStatus === 'ACTIVE' 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {owner?.accountStatus || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => owner && startTransition(async () => {
                          const res = await impersonateUser(owner.id);
                          if (res.success) router.push('/home');
                        })}
                        disabled={isPending || !owner}
                        className="p-1.5 rounded-lg border border-white/5 text-neutral-500 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Impersonate User"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => owner && handleResetPassword(owner.id, owner.email)}
                        disabled={isPending || !owner}
                        className="p-1.5 rounded-lg border border-white/5 text-neutral-500 hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Reset Password"
                      >
                        <Key size={14} />
                      </button>
                      <button 
                        onClick={() => owner && handleSuspend(owner.id)}
                        disabled={isPending || !owner || owner.accountStatus !== 'ACTIVE'}
                        className="px-3 py-1.5 rounded-lg border border-amber-500/20 text-[10px] uppercase tracking-widest text-amber-500 hover:bg-amber-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Suspend
                      </button>
                      <button 
                        onClick={() => handleTerminate(org.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-lg border border-red-500/20 text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        Terminate
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredEntities.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-neutral-600 uppercase tracking-widest font-mono">
                  No active entities detected in the Sovereign registry.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {resetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-medium text-white mb-2">Password Reset Successful</h3>
            <p className="text-sm text-neutral-400 mb-6">
              A temporary password has been generated for <span className="text-emerald-500">{resetModal.email}</span>. Please copy and securely transmit this to the user.
            </p>
            
            <div className="relative p-4 rounded-xl bg-black border border-white/5 mb-6 flex items-center justify-between group">
              <code className="text-emerald-500 font-mono tracking-wider">{resetModal.tempPassword}</code>
            </div>

            <button
              onClick={() => setResetModal(null)}
              className="w-full h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
