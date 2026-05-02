import { prisma } from '@/src/lib/prisma';
import LedgerClient from "./LedgerClient";
import { getActiveWorkspaceId } from "@/src/actions/workspace.actions";
import { getCurrentSession } from "@/lib/auth-utils";
import { AccountCategory } from '@prisma/client';

export default async function TreasuryGrid({ filterType }: { filterType?: string }) {
  const session = await getCurrentSession();
  const activeOrgId = (await getActiveWorkspaceId()) || session?.organizationId;

  const where: any = { organizationId: activeOrgId };
  
  if (filterType === 'INCOME') {
    where.account = { category: AccountCategory.INCOME };
  } else if (filterType === 'EXPENSE') {
    where.account = { category: AccountCategory.EXPENSE };
  }

  const entries = await prisma.ledgerEntry.findMany({
    where,
    include: {
      expenseCategory: true,
      account: true
    },
    orderBy: {
      date: "desc",
    },
  });

  return <LedgerClient initialData={JSON.parse(JSON.stringify(entries))} />;
}
