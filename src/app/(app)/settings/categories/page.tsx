import { prisma } from '@/lib/prisma'
import { Info } from 'lucide-react'
import ExecutiveLedgerHub from './GovernanceRegistryClient'
import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui-finova'

export default async function CategoriesManagementPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/auth/signin');

  const allLedgers = await prisma.financialLedger.findMany({
    where: { organizationId: session.organizationId },
    include: {
      categories: true
    },
    orderBy: { name: 'asc' }
  });

  const allNodes = await prisma.expenseCategory.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <ExecutiveLedgerHub 
        initialLedgers={allLedgers} 
        initialNodes={allNodes} 
      />

      <Card className="glass-panel border border-[var(--border)] rounded-[8px] p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-[6px] -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
          <div className="w-20 h-20 rounded-[8px] bg-[var(--primary-muted)] flex items-center justify-center shrink-0 border border-[var(--border)] relative z-10">
             <Info className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <div className="space-y-4 relative z-10">
              <h3 className="text-[var(--foreground)]  text-display font-weight-display">Financial Governance Protocol V.3</h3>
              <p className="text-[var(--muted)] font-medium text-[11px] leading-relaxed max-w-3xl ">
                  This hub orchestrates the immutable hierarchy of your Chart of Accounts. 
                  Enforced Strict Depth: Ledgers can contain exactly 2 levels of sub-taxonomy (Root Categories and Child Nodes).
                  Vaporization Check: Global Ledgers cannot be decommissioned while active sub-ledgers exist.
              </p>
          </div>
      </Card>
    </div>
  )
}
