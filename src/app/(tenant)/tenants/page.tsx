import { Suspense } from "react";
import Link from "next/link";
import TenantGrid from "@/src/components/modules/tenants/TenantGrid";
import { TableSkeleton } from "@/src/components/finova/ui/SovereignSkeleton";

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
        <Link 
          href="/tenant-register" 
          className="h-10 px-6 bg-amber-500 text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-amber-400 transition-all flex items-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          Onboard New Tenant
        </Link>
      </header>

      <Suspense fallback={<TableSkeleton rows={10} />}>
        <TenantGrid />
      </Suspense>
    </div>
  );
}
