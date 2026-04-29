import { prisma } from "@/lib/prisma";
import LedgerClient from "./LedgerClient";
import { getActiveWorkspaceId } from "@/src/actions/workspace.actions";
import { getCurrentSession } from "@/lib/auth-utils";

export default async function TreasuryGrid() {
  const session = await getCurrentSession();
  const activeOrgId = (await getActiveWorkspaceId()) || session?.organizationId;

  const entries = await prisma.ledgerEntry.findMany({
    where: { 
      organizationId: activeOrgId 
    },
    include: {
      expenseCategory: true,
    },
    orderBy: {
      date: "desc",
    },
  });

  return <LedgerClient initialData={JSON.parse(JSON.stringify(entries))} />;
}
