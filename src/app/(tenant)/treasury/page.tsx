import { Suspense } from "react";
import TreasuryGrid from "@/src/components/modules/treasury/TreasuryGrid";
import { LedgerSkeleton } from "@/src/components/finova/ui/SovereignSkeleton";

export default async function TreasuryMasterPage({ 
  searchParams 
}: { 
  searchParams: { type?: string } 
}) {
  const params = await searchParams;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8 w-full">
      <header className="flex justify-between items-end border-b border-border pb-8">
        <div>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-3">
             Treasury Governance
          </h1>
          <h2 className="text-display font-weight-display text-foreground leading-none">
            Sovereign Master Ledger
          </h2>
        </div>
      </header>

      <Suspense fallback={<LedgerSkeleton />}>
        <TreasuryGrid filterType={params.type} />
      </Suspense>
    </div>
  );
}
