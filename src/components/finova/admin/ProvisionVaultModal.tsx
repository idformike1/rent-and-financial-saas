"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { provisionVault } from "@/actions/management.actions";
import { Box, User, Mail, ShieldCheck, Loader2, X, PlusCircle } from "lucide-react";

export default function ProvisionVaultModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ vaultName: string, ownerEmail: string, tempPassword: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await provisionVault(formData);
      if (res.success) {
        setSuccessData({
          vaultName: res.vaultName!,
          ownerEmail: res.ownerEmail!,
          tempPassword: res.tempPassword!
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

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
      >
        <PlusCircle size={14} />
        Provision Vault
      </button>
    );
  }

  if (successData) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="w-full max-w-md bg-neutral-950 border border-emerald-500/20 rounded-2xl shadow-2xl p-8 space-y-6 animate-in zoom-in duration-300">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-black mb-2 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-light text-white">Vault Materialized</h3>
            <p className="text-neutral-500 text-sm uppercase tracking-widest text-[10px]">Access credentials for <span className="text-emerald-400 font-bold">{successData.vaultName}</span></p>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
              <span>Owner Identity</span>
              <span className="text-white">{successData.ownerEmail}</span>
            </div>

            <div className="space-y-2 pt-2 text-center">
              <label className="text-[10px] uppercase tracking-widest text-emerald-500/60 font-bold">Temporary Access Key</label>
              <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                <p className="text-3xl font-mono font-bold tracking-widest text-emerald-400 select-all">
                  {successData.tempPassword}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSuccessData(null);
              setIsOpen(false);
              router.refresh();
            }}
            className="w-full h-12 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] uppercase tracking-[0.2em] font-black hover:bg-white/10 transition-all"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-neutral-950 border border-white/5 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <Box className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Materialize New Vault</h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5 font-light">Provisioning Organizational Silo</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="w-8 h-8 flex items-center justify-center rounded-full border border-white/5 hover:bg-white/5 text-neutral-500 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-1 font-bold">Organizational Identity (Vault Name)</label>
              <div className="relative">
                <Box className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                <input
                  name="vaultName"
                  required
                  placeholder="e.g., Wayne Enterprises"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black border border-white/10 text-sm text-white focus:border-white/40 focus:outline-none transition-all placeholder:text-neutral-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-1 font-bold">Owner First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                  <input
                    name="ownerFirstName"
                    required
                    placeholder="Bruce"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black border border-white/10 text-sm text-white focus:border-white/40 focus:outline-none transition-all placeholder:text-neutral-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-1 font-bold">Owner Last Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                  <input
                    name="ownerLastName"
                    required
                    placeholder="Wayne"
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black border border-white/10 text-sm text-white focus:border-white/40 focus:outline-none transition-all placeholder:text-neutral-800"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 ml-1 font-bold">Owner Email (Root Admin)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-700" />
                <input
                  name="ownerEmail"
                  type="email"
                  required
                  placeholder="bruce@wayne.com"
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-black border border-white/10 text-sm text-white focus:border-white/40 focus:outline-none transition-all placeholder:text-neutral-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full h-14 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-neutral-200 transition-all disabled:opacity-50 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /> Materializing...
                </span>
              ) : (
                "Execute Provisioning"
              )}
            </button>

            {error && (
              <p className="text-[10px] text-red-500 font-bold text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20 uppercase tracking-widest">
                {error}
              </p>
            )}
          </div>
        </form>

        <div className="px-10 py-6 bg-white/[0.01] border-t border-white/5 text-center">
          <p className="text-[8px] text-neutral-600 uppercase tracking-[0.3em] font-medium">
            Sovereign Identity Provisioning Service • Quantum Auth Protocol
          </p>
        </div>
      </div>
    </div>
  );
}
