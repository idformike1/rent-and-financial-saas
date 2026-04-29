"use client";
import { useState } from "react";
import { bootstrapOrganization } from "@/actions/system.actions";

export function ProvisioningForm() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ orgName: string, ownerEmail: string, tempPassword: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    
    try {
      const result = await bootstrapOrganization(formData);

      if (result.success) {
        setSuccessData({ 
          orgName: result.orgName!, 
          ownerEmail: result.ownerEmail!, 
          tempPassword: result.tempPassword! 
        });
      } else {
        setError(result.error || "Provisioning failure.");
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
      <div className="p-10 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 backdrop-blur-3xl shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500 text-black mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-light text-white">Entity Activation Successful</h3>
          <p className="text-neutral-500 text-sm">Organizational silo <span className="text-emerald-400 font-mono">{successData.orgName}</span> has been materialized.</p>
        </div>

        <div className="p-6 rounded-xl bg-black/40 border border-white/5 space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500">Owner Identity</label>
            <p className="text-white font-mono">{successData.ownerEmail}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Temporary Access Key</label>
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
              <p className="text-2xl font-mono font-bold tracking-wider text-emerald-400 select-all">
                {successData.tempPassword}
              </p>
            </div>
            <p className="text-[9px] text-neutral-500 uppercase tracking-tighter text-center italic">
              Critical: Copy this key now. It will not be displayed again for security parity.
            </p>
          </div>
        </div>

        <button
          onClick={() => setSuccessData(null)}
          className="w-full h-12 rounded-xl border border-white/10 text-white text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
        >
          Acknowledge & Provision Another
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-1">Provisioning Center</h3>
        <p className="text-sm text-neutral-400">Initialize new organizational entities and assign sovereign ownership.</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Organization Name</label>
            <input
              name="orgName"
              required
              placeholder="e.g. AXIOM CORP"
              className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Owner Name</label>
            <input
              name="ownerName"
              required
              placeholder="e.g. John Doe"
              className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Owner Email</label>
          <input
            name="ownerEmail"
            type="email"
            required
            placeholder="owner@org.com"
            className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full h-12 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "PROVISIONING..." : "ACTIVATE ENTITY"}
        </button>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
