import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Landmark, ShieldCheck, Zap, ArrowLeft, History } from 'lucide-react'
import RegistrySurveillanceClient from './RegistrySurveillanceClient'
import { Badge, Button } from '@/components/ui-finova'

import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'

import { FINANCIAL_PERIODS, getTemporalFragment, REVENUE_FILTER_CONTEXT } from '@/src/core/algorithms/finance'

export default async function ExpenseRegistryPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const entriesRaw = await prisma.ledgerEntry.findMany({
    where: { 
      organizationId: session.organizationId,
      ...getTemporalFragment(FINANCIAL_PERIODS.TRAILING_MONTH),
      AND: REVENUE_FILTER_CONTEXT
    },
    select: {
      id: true,
      amount: true,
      date: true,
      transactionDate: true,
      description: true,
      paymentMode: true,
      referenceText: true,
      expenseCategory: {
        select: {
          id: true,
          name: true,
          parent: {
            select: { id: true, name: true }
          }
        }
      },
      account: {
        select: {
          id: true,
          name: true,
          category: true
        }
      },
      property: {
        select: { id: true, name: true }
      }
    },
    orderBy: { transactionDate: 'desc' }
  });

  const entries = entriesRaw.map((e: any) => ({
    id: e.id,
    amount: Number(e.amount),
    transactionDate: e.transactionDate?.toISOString() || null,
    date: e.date?.toISOString() || null,
    description: e.description,
    paymentMode: e.paymentMode,
    referenceText: e.referenceText,
    expenseCategory: e.expenseCategory ? {
      id: e.expenseCategory.id,
      name: e.expenseCategory.name,
      parent: e.expenseCategory.parent ? { id: e.expenseCategory.parent.id, name: e.expenseCategory.parent.name } : null
    } : null,
    account: e.account ? {
      id: e.account.id,
      name: e.account.name,
      category: e.account.category
    } : null,
    property: e.property ? { id: e.property.id, name: e.property.name } : null
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-[28px] font-[380] text-foreground tracking-clinical leading-none">
            Expense Registry
          </h1>
          <p className="text-[15px] font-[400] text-clinical-muted">
            System audit of operational expenditure and inflow recognized in the portfolio protocol
          </p>
        </div>
        
        <div className="flex gap-4">
          <Link href="/treasury/payables/log">
            <Button type="button" disabled={false} className="h-10 px-6 bg-primary text-primary-foreground font-bold  tracking-widest text-[10px] flex items-center gap-2 rounded-[var(--radius-sm)]">
              <Plus className="w-4 h-4" /> Authorize Entry
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative z-10">
         <RegistrySurveillanceClient entries={entries} />
      </div>
    </div>
  )
}
