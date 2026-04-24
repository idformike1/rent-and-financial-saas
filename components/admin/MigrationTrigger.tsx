"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { executeGlobalIdentityMigration } from "@/actions/system.actions";
import { Zap } from "lucide-react";

export function MigrationTrigger() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleMigration = async () => {
    if (confirm("Initiate Global Identity Migration? This will sync all legacy user assignments to the new Many-to-Many bridge.")) {
      startTransition(async () => {
        const result = await executeGlobalIdentityMigration();
        if (result.success) {
          alert(`⚡ Migration Complete! Identitites Synchronized: ${result.migratedCount}`);
          router.refresh();
        } else {
          alert(`❌ Migration Failed: ${result.error}`);
        }
      });
    }
  };

  return (
    <button
      onClick={handleMigration}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-500 text-xs font-mono tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50"
    >
      <Zap className={`w-3 h-3 ${isPending ? 'animate-pulse' : ''}`} />
      {isPending ? "MIGRATING..." : "RUN DATA MIGRATION"}
    </button>
  );
}
