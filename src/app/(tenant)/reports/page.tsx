import { prisma } from '@/src/lib/prisma';
import ReportClient from "./ReportClient";
import { getActiveWorkspaceId } from "@/src/actions/workspace.actions";
import { getCurrentSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function StrategicReportsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const activeOrgId = (await getActiveWorkspaceId()) || session.organizationId;

  const entries = await prisma.ledgerEntry.findMany({
    where: {
      organizationId: activeOrgId,
      status: "ACTIVE",
    },
    include: {
      expenseCategory: true,
      account: true,
      wealthAccount: true, // Include wealthAccount
    },
  });

  const businessIncome = entries
    .filter((e) => (e.account?.category === "INCOME" || e.wealthAccount?.category === "INCOME") && !e.expenseCategory?.isPersonal)
    .reduce((acc, e) => acc + Number(e.amount), 0);

  const allExpenses = entries
    .filter((e) => (e.account?.category === "EXPENSE" || e.wealthAccount?.category === "EXPENSE"));

  const personalExpenses = allExpenses
    .filter((e) => e.expenseCategory?.isPersonal)
    .reduce((acc, e) => acc + Number(e.amount), 0);

  const businessExpenses = allExpenses
    .filter((e) => !e.expenseCategory?.isPersonal)
    .reduce((acc, e) => acc + Number(e.amount), 0);

  // NOI Calculation: Business Income - Business Operating Expenses
  const noi = businessIncome - businessExpenses;

  const stats = {
    totalIncome: businessIncome,
    totalExpenses: businessExpenses + personalExpenses,
    noi,
    personalExpenses,
    businessExpenses,
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6 w-full">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-[10px] font-bold uppercase tracking-[0.15em] text-foreground/40 mb-1">
            God-View Telemetry
          </h1>
          <h2 className="text-display font-weight-display text-foreground leading-none">
            Strategic Analytics
          </h2>
        </div>
        <div className="text-[10px] font-bold tabular-nums text-foreground/40 uppercase tracking-[0.15em]">
          Fiscal_Nodes: {entries.length}
        </div>
      </header>

      <ReportClient stats={stats} />
    </div>
  );
}
