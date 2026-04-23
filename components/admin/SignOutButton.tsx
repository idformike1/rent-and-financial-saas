"use client";
import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full mt-auto p-4 rounded-xl border border-white/5 bg-white/[0.02] text-[10px] uppercase tracking-widest text-neutral-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all text-left"
    >
      Terminate Session
    </button>
  );
}
