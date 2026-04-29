import { getCurrentSession } from "@/lib/auth-utils";
import { getActiveWorkspaceId } from "@/src/actions/workspace.actions";
import { getMasterLedger, getGlobalPortfolioTelemetry } from "@/actions/analytics.actions";
import { InsightsDashboard } from "./index";

export default async function InsightsGrid() {
  const session = await getCurrentSession();
  if (!session) return null;

  const activeOrgId = (await getActiveWorkspaceId()) || session.organizationId;

  // Execute unified telemetry and ledger archive fetch
  const [ledgerEntries, telemetryResponse] = await Promise.all([
    getMasterLedger({ take: 10000 }),
    getGlobalPortfolioTelemetry()
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

  // Extraction of sovereign telemetry metrics
  const telemetry = telemetryResponse?.success ? telemetryResponse.data : null;

  return (
    <InsightsDashboard 
      entries={sanitizedEntries}
      telemetry={telemetry}
      totalAssets={telemetry?.current?.revenue || 0} // Using revenue as a proxy for asset activity in this view
    />
  );
}
