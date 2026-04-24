"use client";

import { useSession } from "next-auth/react";
import { revertImpersonation } from "@/actions/system.actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut } from "lucide-react";

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!(session?.user as any)?.isImpersonating) return null;

  const handleRevert = () => {
    startTransition(async () => {
      const res = await revertImpersonation();
      if (res.success) {
        window.location.href = "/admin";
      }
    });
  };


  return (
    <div className="sticky top-0 z-[100] w-full bg-amber-500 text-black px-6 py-2.5 flex items-center justify-between shadow-[0_4px_20px_rgba(245,158,11,0.3)] border-b border-amber-600/20">
      <div className="flex items-center gap-4">
        <ShieldAlert size={16} className="text-black animate-pulse" />
        <p className="text-[11px] uppercase tracking-[0.2em] font-black">
          ⚠️ SUPERADMIN IMPERSONATION ACTIVE: <span className="font-mono ml-2 text-black/70 italic">Viewing as {session?.user?.email}</span>
        </p>
      </div>

      <button
        onClick={handleRevert}
        disabled={isPending}
        className="group flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-amber-500 hover:bg-black/90 text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
      >
        <LogOut size={12} className="group-hover:-translate-x-1 transition-transform" />
        {isPending ? "REVERTING AUTH..." : "Revert to Superadmin"}
      </button>
    </div>
  );
}

