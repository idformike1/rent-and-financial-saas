"use client";

import { useState } from "react";
import { setupNewPassword } from "@/actions/auth.actions";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export default function SetupPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }

    try {
      const result = await setupNewPassword(password);
      if (result.success) {
        toast.success("Password secured. Redirecting to login...");
        // Forced Sign Out to ensure session parity and middleware bypass
        await signOut({ callbackUrl: '/login' });
      } else {
        setError(result.error || "Failed to update password.");
        setLoading(false);
      }
    } catch (e: any) {
      console.error("[SETUP_PASSWORD_SUBMIT_ERROR]", e);
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 selection:bg-emerald-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-emerald-500/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[20%] h-[20%] bg-blue-500/[0.02] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 text-black font-bold text-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] mb-8">
            S
          </div>
          <h1 className="text-2xl font-light tracking-tight text-white mb-2">Secure Credential Setup</h1>
          <p className="text-neutral-500 text-sm font-light">Your account requires a mandatory password calibration before proceeding.</p>
        </div>

        <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-3xl shadow-2xl space-y-6">
          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">New Password</label>
              <input 
                name="password"
                type="password"
                required
                className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Confirm Password</label>
              <input 
                name="confirmPassword"
                type="password"
                required
                className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm focus:border-emerald-500/50 focus:outline-none transition-all duration-300"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full h-12 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? "SECURING IDENTITY..." : "FINALIZE SETUP"}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest text-center font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-neutral-600 font-medium">End-to-End Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
