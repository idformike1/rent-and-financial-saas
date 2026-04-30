import { Suspense } from "react";
import AssetGrid from "@/src/components/modules/assets/AssetGrid";
import { PortfolioSkeleton } from "@/src/components/finova/ui/SovereignSkeleton";
import { assetService } from "@/src/services/asset.service";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function AssetsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  // Fetch data at the page level to enforce Client/Server boundary
  const properties = await assetService.getPropertiesWithContext(session.organizationId);

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col gap-6 w-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-1">
            Asset Intelligence
          </h1>
          <h2 className="text-display font-weight-display text-foreground leading-none">
            Property Portfolio
          </h2>
        </div>
      </header>

      <Suspense fallback={<PortfolioSkeleton />}>
        <AssetGrid initialProperties={JSON.parse(JSON.stringify(properties))} role={session.role} />
      </Suspense>
    </div>
  );
}
