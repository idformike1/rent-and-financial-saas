import prisma from '@/lib/prisma'
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
    <div className="py-12 px-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      <ExecutiveLedgerHub 
        initialLedgers={allLedgers} 
        initialNodes={allNodes} 
      />

      <Card className="glass-panel border border-[var(--border)] rounded-[2.5rem] p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full -mr-32 -mt-32 transition-transform duration-700 group-hover:scale-110" />
          <div className="w-20 h-20 rounded-3xl bg-[var(--primary-muted)] flex items-center justify-center shrink-0 border border-[var(--border)] relative z-10">
             <Info className="w-10 h-10 text-[var(--primary)]" />
          </div>
          <div className="space-y-4 relative z-10">
              <h3 className="text-[var(--foreground)] font-black uppercase italic tracking-tighter text-3xl">Financial Governance Protocol V.3</h3>
              <p className="text-[var(--muted)] font-medium text-[11px] tracking-widest leading-relaxed max-w-3xl uppercase">
                  This hub orchestrates the immutable hierarchy of your Chart of Accounts. 
                  Enforced Strict Depth: Ledgers can contain exactly 2 levels of sub-taxonomy (Root Categories and Child Nodes).
                  Vaporization Check: Global Ledgers cannot be decommissioned while active sub-ledgers exist.
              </p>
          </div>
      </Card>
    </div>
  )
}
