import { Suspense } from "react";
import TenantGrid from "./TenantGrid";
import { TableSkeleton } from "@/components/ui/SovereignSkeleton";

export default async function TenantRegistryPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6 w-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-1">
            Asset Intelligence
          </h1>
          <h2 className="text-display font-weight-display text-foreground leading-none">
            Occupant Registry
          </h2>
        </div>
      </header>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <TenantGrid />
      </Suspense>
    </div>
  );
}
