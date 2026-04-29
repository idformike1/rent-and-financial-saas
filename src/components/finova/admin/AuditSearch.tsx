"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function AuditSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [text, setText] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!text) {
        router.push("/admin/audit");
      } else {
        router.push(`/admin/audit?q=${text}`);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [text, router]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-600" />
      <input 
        type="text" 
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search ledger..." 
        className="bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[10px] text-white uppercase tracking-widest focus:border-emerald-500/50 transition-all placeholder:text-neutral-800"
      />
    </div>
  );
}

