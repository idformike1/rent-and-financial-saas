import prisma from '@/lib/prisma'
import { Info } from 'lucide-react'
import ExecutiveLedgerHub from './GovernanceRegistryClient'
import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

export default async function CategoriesManagementPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/auth/signin');

  // Fetch dynamic Financial Ledgers and all Account Nodes (Categories)
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
    <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-16">
      <ExecutiveLedgerHub 
        initialLedgers={allLedgers} 
        initialNodes={allNodes} 
      />

      {/* REGULATORY AUDIT BUMPER V.3 */}
      <div className="bg-indigo-50 border-[6px] border-indigo-200 rounded-[3rem] p-12 flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full -mr-32 -mt-32 opacity-50 group-hover:scale-110 transition-transform duration-700" />
          <Info className="w-20 h-20 text-indigo-600 flex-shrink-0 relative z-10" />
          <div className="space-y-6 relative z-10">
              <h3 className="text-indigo-900 font-black uppercase italic tracking-tighter text-3xl underline decoration-8 decoration-indigo-200 underline-offset-[12px]">Financial Governance Protocol V.3</h3>
              <p className="text-indigo-700/80 font-bold text-sm tracking-widest leading-relaxed max-w-3xl uppercase">
                  This hub orchestrates the immutable hierarchy of your Chart of Accounts. 
                  Enforced Strict Depth: Ledgers can contain exactly 2 levels of sub-taxonomy (Root Categories and Child Nodes).
                  Vaporization Check: Global Ledgers cannot be decommissioned while active sub-ledgers exist.
              </p>
          </div>
      </div>
    </div>
  )
}
