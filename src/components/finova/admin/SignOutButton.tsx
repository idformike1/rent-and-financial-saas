"use client";
import { terminateSession } from "@/actions/auth.actions";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button 
      disabled={isPending}
      onClick={() => startTransition(async () => {
        try {
          await terminateSession();
        } catch (e) {
          // Normal redirect throw is handled by Next.js
        }
      })}
      className="w-full mt-auto p-4 rounded-xl border border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-widest text-neutral-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-left flex items-center justify-between"
    >
      <span>{isPending ? "Terminating..." : "Terminate Session"}</span>
      {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
    </button>
  );
}
