"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { provisionTargetedUser } from "@/actions/system.actions";
import { UserPlus, ShieldCheck, Mail, Key, Loader2, X } from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgId: string;
  orgName: string;
}

export default function AddUserModal({ isOpen, onClose, orgId, orgName }: AddUserModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ email: string, tempPassword: string, role: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const canAccessRent = formData.get("canAccessRent") === "true";
    const canAccessWealth = formData.get("canAccessWealth") === "true";

    try {
      const res = await provisionTargetedUser(orgId, email, role, canAccessRent, canAccessWealth);
      if (res.success) {
        setSuccessData({ 
          email: res.email!, 
          tempPassword: res.tempPassword!, 
          role: res.role! 
        });
      } else {
        setError(res.error || "Provisioning failure.");
      }
    } catch (err) {
      setError("A critical communication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  // CONDITIONAL RENDERING: SUCCESS UI CARD
  if (successData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-neutral-900 border border-emerald-500/20 rounded-2xl shadow-2xl p-8 space-y-6 scale-in-center">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-black mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-light text-white">Identity Provisioned</h3>
            <p className="text-neutral-500 text-sm">New administrative access generated for <span className="text-emerald-400">{orgName}</span>.</p>
          </div>

          <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
              <span>Account Email</span>
              <span className="text-white">{successData.email}</span>
            </div>
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
              <span>System Role</span>
              <span className="text-emerald-500 font-bold">{successData.role}</span>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Temporary Access Key</label>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                <p className="text-2xl font-mono font-bold tracking-wider text-emerald-400 select-all">
                  {successData.tempPassword}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccessData(null);
              router.refresh();
              onClose();
            }}
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Inject Identity</h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-tighter">Target: {orgName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Identity Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                name="email"
                type="email"
                required
                placeholder="admin@organization.com"
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-black border border-white/10 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">System Role</label>
            <select
              name="role"
              required
              className="w-full h-12 px-4 rounded-xl bg-black border border-white/10 text-sm text-white focus:border-emerald-500/50 focus:outline-none appearance-none transition-all"
            >
              <option value="MANAGER">MANAGER (Standard Admin)</option>
              <option value="OWNER">OWNER (Full Sovereign Access)</option>
              <option value="VIEWER">VIEWER (Read-Only Audit)</option>
            </select>
          </div>

          <div className="space-y-4 pt-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Module Entitlements</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-black border border-white/5 cursor-pointer hover:bg-white/[0.02] transition-all">
                <input type="checkbox" name="canAccessRent" value="true" defaultChecked className="w-4 h-4 accent-emerald-500 bg-neutral-900 border-white/10 rounded" />
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Rent Module</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-black border border-white/5 cursor-pointer hover:bg-white/[0.02] transition-all">
                <input type="checkbox" name="canAccessWealth" value="true" defaultChecked className="w-4 h-4 accent-emerald-500 bg-neutral-900 border-white/10 rounded" />
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Wealth Module</span>
              </label>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full h-12 rounded-xl bg-emerald-500 text-black font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Materializing...
              </span>
            ) : (
              "Authorize & Inject"
            )}
          </button>

          {error && (
            <p className="text-[10px] text-red-500 font-medium text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}
        </form>

        <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
          <p className="text-[8px] text-neutral-600 uppercase tracking-widest">
            Identity Persistence Service • Sovereign RBAC Standard
          </p>
        </div>
      </div>
    </div>
  );
}
