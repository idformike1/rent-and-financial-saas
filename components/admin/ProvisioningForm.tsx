"use client";
import { useState } from "react";
import { bootstrapOrganization } from "@/actions/system.actions";

export function ProvisioningForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMessage(null);
    const result = await bootstrapOrganization(formData);

    if (result.success) {
      setMessage({ type: 'success', text: "Organization successfully provisioned." });
      (document.getElementById('provision-form') as HTMLFormElement)?.reset();
    } else {
      setMessage({ type: 'error', text: result.error || "Provisioning failure." });
    }
    setLoading(false);
  }

  return (
    <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-6">
      <div>
        <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-medium mb-1">Provisioning Center</h3>
        <p className="text-sm text-neutral-400">Initialize new organizational entities and assign sovereign ownership.</p>
      </div>

      <form id="provision-form" action={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Organization Name</label>
            <input
              name="orgName"
              required
              placeholder="e.g. AXIOM CORP"
              className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Owner Name</label>
            <input
              name="ownerName"
              required
              placeholder="e.g. John Doe"
              className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors"
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
            className="w-full h-12 px-4 rounded-xl bg-black border border-white/5 text-sm focus:border-emerald-500/50 focus:outline-none transition-colors"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full h-12 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "PROVISIONING..." : "ACTIVATE ENTITY"}
        </button>

        {message && (
          <div className={`p-4 rounded-lg text-xs font-medium text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
            }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
