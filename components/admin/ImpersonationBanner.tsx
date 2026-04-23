"use client";

import { useSession } from "next-auth/react";
import { revertImpersonation } from "@/actions/system.actions";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function ImpersonationBanner() {
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!(session?.user as any)?.isImpersonating) return null;

  const handleRevert = () => {
    startTransition(async () => {
      const res = await revertImpersonation();
      if (res.success) {
        router.push("/admin");
      }
    });
  };

  return (
    <div className="sticky top-0 z-[100] w-full bg-red-600 text-white px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
          Impersonation Protocol Active: <span className="font-mono ml-2 opacity-80">{session?.user?.email}</span>
        </p>
      </div>

      <button
        onClick={handleRevert}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50"
      >
        <LogOut size={12} />
        {isPending ? "REVERTING..." : "Return to Admin"}
      </button>
    </div>
  );
}
