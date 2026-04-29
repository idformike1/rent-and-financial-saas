import { Suspense } from "react";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import InsightsGrid from "@/src/components/modules/insights/InsightsGrid";
import { ChartSkeleton } from "@/src/components/finova/ui/SovereignSkeleton";

export const metadata = {
  title: "Insights | Axiom Finova",
  description: "Overview of your financial health.",
};

export default async function InsightsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  return (
    <div className="w-full p-8">
      <header className="mb-10">
        <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-1">
          Analytical Intelligence
        </h1>
        <h2 className="text-display font-weight-display text-foreground leading-none">
          Financial Insights
        </h2>
      </header>

      <Suspense fallback={<ChartSkeleton />}>
        <InsightsGrid />
      </Suspense>
    </div>
  );
}
