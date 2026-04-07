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
        <h2 className="text-[16px] font-[380] text-foreground tracking-tight">Master Ledger Feed</h2>
        <button className="text-[13px] font-[380] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* FILTER PILLS */}
      <div className="flex items-center gap-2 mb-6">
        <button className="bg-muted text-foreground rounded-full px-4 py-1.5 text-[13px] font-[400] transition-colors">
          Recent
        </button>
        <button className="border border-border text-muted-foreground hover:text-foreground rounded-full px-4 py-1.5 text-[13px] font-[400] transition-colors">
          My transactions
        </button>
        <button className="border border-border text-muted-foreground hover:text-foreground rounded-full px-4 py-1.5 text-[13px] font-[400] transition-colors mb-0.5">
          Operating expenses
        </button>
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
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold shrink-0">
                      {txn.toFrom.charAt(0)}
                    </div>
                    <span className="font-[380] tracking-tight">{txn.toFrom}</span>
                  </div>
                </TD>
                <TD className="text-right">
                  <span className={txn.amount > 0 ? "text-[#37CC73] font-[380] font-finance" : "text-foreground font-[380] font-finance"}>
                    {txn.amount < 0 ? '−' : ''}${Math.abs(txn.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </TD>
                <TD>
                  <span className="text-muted-foreground/60 font-[380] tracking-tight">{txn.account}</span>
                </TD>
                <TD>
                  <span className="text-muted-foreground/60 font-[380] tracking-tight">{txn.method}</span>
                </TD>
              </TR>
            ))}
          </TBody>
        </MercuryTable>
      </div>
    </div>
  )
}
