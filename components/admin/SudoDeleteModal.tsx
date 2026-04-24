"use client";

import { useState } from "react";
import { verifySudoPassword } from "@/actions/auth.actions";
import { AlertCircle, ShieldAlert, Lock, Loader2 } from "lucide-react";

interface SudoDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  entityName: string;
}

export default function SudoDeleteModal({ isOpen, onClose, onConfirm, entityName }: SudoDeleteModalProps) {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError(null);

    try {
      const res = await verifySudoPassword(password);
      
      if (res.success) {
        await onConfirm();
        onClose();
        setPassword("");
      } else {
        setError(res.error || "Authentication failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred during verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-neutral-900 border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden scale-in-center">
        {/* HEADER */}
        <div className="p-6 bg-red-500/10 border-b border-red-500/10 flex items-center gap-4">
          <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Critical Operation</h3>
            <p className="text-xs text-red-400 uppercase tracking-widest font-mono">Destructive Action Protocol</p>
          </div>
        </div>

        {/* CONTENT */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="p-4 bg-black/40 rounded-xl border border-white/5 flex gap-4">
            <AlertCircle className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
            <p className="text-sm text-neutral-400">
              You are about to permanently purge <span className="text-white font-bold">{entityName}</span> from the system. This action cannot be undone.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold ml-1">
              Confirm Superadmin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="password"
                required
                autoFocus
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-black border border-white/10 text-sm text-white focus:border-red-500/50 focus:outline-none transition-all"
              />
            </div>
            {error && (
              <p className="text-[10px] text-red-500 font-medium ml-1 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500" /> {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 h-12 rounded-xl bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest hover:bg-neutral-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password}
              className="flex-[2] h-12 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-red-50 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50 disabled:grayscale"
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Verify & Purge"
              )}
            </button>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
          <p className="text-[9px] text-neutral-600 uppercase tracking-tighter">
            Zero-Trust Verification Mode Active • Sovereign Security Standard
          </p>
        </div>
      </div>
    </div>
  );
}
