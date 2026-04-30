import { Suspense } from "react";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import InsightsGrid from "@/src/components/modules/insights/InsightsGrid";
import { ChartSkeleton } from "@/src/components/finova/ui/SovereignSkeleton";
import { treasuryService } from "@/src/services/treasury.service";
import { getActiveWorkspaceId } from "@/src/actions/workspace.actions";

export const metadata = {
  title: "Insights | Axiom Finova",
  description: "Overview of your financial health.",
};

export default async function InsightsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const activeOrgId = (await getActiveWorkspaceId()) || session.organizationId;

  // Parallel fetch for optimal telemetry materialization
  const [ledgerEntries, telemetry] = await Promise.all([
    treasuryService.getMasterLedger(activeOrgId, { take: 10000 }),
    treasuryService.getGlobalPortfolioTelemetry(activeOrgId)
  ]);

  const sanitizedEntries = (ledgerEntries as any[] || []).map((e: any) => ({
    id: e.id,
    amount: Number(e.amount),
    transactionDate: e.transactionDate,
    description: e.description,
    account: {
      category: e.account?.category
    },
    expenseCategory: {
      name: e.expenseCategory?.name
    }
  }));

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
        <InsightsGrid entries={sanitizedEntries} telemetry={telemetry} />
      </Suspense>
    </div>
  );
}
