'use client'

import { Card, MercuryTable, THead, TBody, TR, TD, Badge, Button } from '@/components/ui-finova'
import { ArrowRight } from 'lucide-react'

const MOCK_TRANSACTIONS = [
  { id: 1, date: 'Apr 7', toFrom: 'Mercury Working Capital', amount: -32200.00, account: 'Operating', method: 'Working Capital Loan' },
  { id: 2, date: 'Apr 7', toFrom: 'Payment from NASA', amount: 419.00, account: 'AR', method: 'Invoice Payment' },
  { id: 3, date: 'Apr 7', toFrom: 'Payment from Acme Corp', amount: 200.00, account: 'AR', method: 'Invoice Payment' },
  { id: 4, date: 'Apr 7', toFrom: 'To Ops / Payroll', amount: -55810.45, account: 'Payroll', method: 'Transfer' },
]

export default function MasterTable() {
  return (
    <div className="mt-10 mb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[16px] font-normal text-foreground tracking-clinical">Master Ledger Feed</h2>
        <Button type="button" variant="ghost" disabled={false} className="h-auto p-0 text-[13px] font-normal text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 bg-transparent hover:bg-transparent border-none">
          View all <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

      {/* FILTER PILLS */}
    <div className="flex items-center gap-2 mb-6">
      <Button type="button" variant="secondary" disabled={false} className="bg-muted text-foreground rounded-[var(--radius)] px-4 py-1.5 h-8 text-[13px] font-[400] transition-colors border-none">
        Recent
      </Button>
      <Button type="button" variant="ghost" disabled={false} className="border border-border text-muted-foreground hover:text-foreground rounded-[var(--radius)] px-4 py-1.5 h-8 text-[13px] font-[400] transition-colors bg-transparent">
        My transactions
      </Button>
      <Button type="button" variant="ghost" disabled={false} className="border border-border text-muted-foreground hover:text-foreground rounded-[var(--radius)] px-4 py-1.5 h-8 text-[13px] font-[400] transition-colors mb-0.5 bg-transparent">
        Operating expenses
      </Button>
    </div>

      {/* DENSE DATA GRID */}
      <div className="overflow-x-auto">
        <MercuryTable>
          <THead>
            <TR isHeader>
              <TD isHeader className="w-[100px]">Date</TD>
              <TD isHeader>To/From</TD>
              <TD isHeader className="text-right">Amount</TD>
              <TD isHeader>Account</TD>
              <TD isHeader>Method</TD>
            </TR>
          </THead>
          <TBody>
            {MOCK_TRANSACTIONS.map((txn) => (
              <TR key={txn.id}>
                <TD variant="date" className="w-[100px]">{txn.date}</TD>
                <TD>
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[var(--radius)] bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold shrink-0">
                      {txn.toFrom.charAt(0)}
                    </div>
                    <span className="font-[380] tracking-tight">{txn.toFrom}</span>
                  </div>
                </TD>
                <TD className="text-right">
                  <span className={txn.amount > 0 ? "text-mercury-green font-data" : "text-foreground font-data"}>
                    {txn.amount < 0 ? '−' : ''}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </TD>
                <TD>
                  <span className="text-mercury-muted font-normal tracking-clinical">{txn.account}</span>
                </TD>
                <TD>
                  <span className="text-mercury-muted font-normal tracking-clinical">{txn.method}</span>
                </TD>
              </TR>
            ))}
          </TBody>
        </MercuryTable>
      </div>
    </div>
  )
}
