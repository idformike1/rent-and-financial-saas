"use client";

import { useState, useTransition } from "react";
import { changeMyPassword } from "@/actions/user.actions";
import { KeyRound, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function SecuritySettingsPage() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await changeMyPassword(formData);
      
      if (result.error) {
        setError(result.error);
        toast.error("Credential update failed");
      } else if (result.success) {
        toast.success("Credentials securely updated");
        // Clear form by resetting the actual DOM element
        const form = document.getElementById("password-change-form") as HTMLFormElement;
        if (form) form.reset();
      }
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheck size={20} />
          </div>
          <h2 className="text-3xl font-light tracking-tight text-white">Security & Access</h2>
        </div>
        <p className="text-neutral-500 font-light">Manage your cryptographic credentials and access control parameters.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <h3 className="text-sm font-medium text-white">Identity Credentials</h3>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Your password secures your administrative access to the Sovereign OS. Ensure it utilizes high-entropy characteristics.
          </p>
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] uppercase tracking-widest text-amber-500/80">
            Never disclose your password. Support personnel will never ask for it.
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
              <div className="w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-[80px]" />
            </div>

            <form id="password-change-form" action={handleSubmit} className="space-y-6 relative z-10">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                <KeyRound size={16} className="text-neutral-500" />
                <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-medium">Update Password</h3>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Current Password</label>
                <input 
                  name="currentPassword"
                  type="password"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">New Password</label>
                  <input 
                    name="newPassword"
                    type="password"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Confirm New Password</label>
                  <input 
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest text-center font-medium animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <div className="pt-6">
                <button 
                  disabled={isPending}
                  type="submit"
                  className="w-full sm:w-auto px-8 h-12 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "CALIBRATING..." : "SAVE CREDENTIALS"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
