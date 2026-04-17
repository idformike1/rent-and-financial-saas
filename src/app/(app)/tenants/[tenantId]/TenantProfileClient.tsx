'use client'

import { useState } from 'react'
import PaymentDrawer from '@/components/PaymentDrawer'
import { ChargeDTO, TenantDTO } from '@/types'
import { CreditCard, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function TenantProfileClient({ tenant, charges }: { tenant: TenantDTO, charges: ChargeDTO[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    setDrawerOpen(false)
    router.refresh() // Refresh the server component to pull new ledger data
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Left Column: Profile */}
      <div className="w-full md:w-1/3 bg-card border border-border sm:rounded-[var(--radius)] p-6 h-fit">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{tenant.name}</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-[var(--radius)] text-xs bg-[var(--primary-muted)] text-[var(--primary)]  tracking-wider border border-[var(--primary)]/20">
            Active
          </span>
        </div>
        
        <div className="space-y-4">
          <button 
            onClick={() => setDrawerOpen(true)}
            className="w-full bg-[var(--primary)] hover:bg-[var(--primary-dark,var(--destructive))] text-foreground flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-[var(--radius)] transition-colors"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Receive Payment
          </button>
        </div>
      </div>

      {/* Right Column: Ledger / Charges */}
      <div className="w-full md:w-2/3 bg-card border border-border sm:rounded-[var(--radius)] overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-muted">
          <h3 className="text-lg leading-6 font-medium text-foreground flex items-center">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
            Outstanding Charges
          </h3>
          <span className="text-sm font-medium text-muted-foreground">
            Total Due: ${charges.reduce((acc, c) => acc + (c.amount - c.amountPaid), 0).toFixed(2)}
          </span>
        </div>
        
        <ul className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
          {charges.length === 0 ? (
            <li className="px-6 py-10 text-center text-muted-foreground text-sm">
              No outstanding charges found.
            </li>
          ) : (
            charges.map((charge) => (
              <li key={charge.id} className="px-6 py-4 hover:bg-muted transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground truncate  tracking-wider">
                      {charge.type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(charge.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${(charge.amount - charge.amountPaid).toFixed(2)}
                    </p>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <PaymentDrawer 
        tenant={tenant} 
        activeCharges={charges} 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onSuccess={handleSuccess} 
      />
    </div>
  )
}
