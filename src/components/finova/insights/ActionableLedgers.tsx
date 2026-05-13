'use client'

import React from 'react'
import { AlertCircle, Zap, Bell, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/src/components/finova/ui-finova'

const RENT_DATA = [
  { id: 1, tenant: "Olivia Chen", unit: "Harbor #4B", date: "May 01, 2026", amount: "$2,450", status: "Overdue 10d", risk: "high" },
  { id: 2, tenant: "Marcus Thorne", unit: "The Pines #12", date: "May 01, 2026", amount: "$1,895", status: "Overdue 10d", risk: "high" },
  { id: 3, tenant: "Sophia Ramirez", unit: "Maple Street #8C", date: "May 05, 2026", amount: "$3,100", status: "Due in 5d", risk: "medium" },
  { id: 4, tenant: "James Kim", unit: "Westside Loft", date: "May 10, 2026", amount: "$2,200", status: "Upcoming", risk: "low" },
  { id: 5, tenant: "Patricia Okafor", unit: "Central #3A", date: "May 15, 2026", amount: "$1,750", status: "Upcoming", risk: "low" },
]

const UTILITY_DATA = [
  { id: 1, unit: "Harbor Loft - #212", type: "Water/Sewer", billed: "$245", paid: "$245", status: "Paid" },
  { id: 2, unit: "The Pines - Unit 4B", type: "Electricity", billed: "$189", paid: "$0", status: "Unpaid" },
  { id: 3, unit: "Maple Street - 8C", type: "Gas & Electric", billed: "$312", paid: "$312", status: "Paid" },
  { id: 4, unit: "Central Avenue #3A", type: "Trash/Water", billed: "$98", paid: "$98", status: "Paid" },
  { id: 5, unit: "Westside Loft - 2C", type: "Electricity", billed: "$277", paid: "$0", status: "Due soon" },
]

export default function ActionableLedgers() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* RENT LEDGER */}
      <div className="flex flex-col rounded-2xl bg-[#1E1E2A] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-neutral-200">Rent due & overdue</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-sm font-medium text-red-400">
            3 overdue • 5 upcoming
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Tenant / Unit</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Due date</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300 text-right">Amount</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {RENT_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-white">{item.tenant}</span>
                      <span className="text-[12px] text-neutral-400">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] text-neutral-400">{item.date}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[14px] font-medium text-white">{item.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "text-[12px] font-medium",
                      item.risk === 'high' ? "text-red-400" :
                      item.risk === 'medium' ? "text-amber-400" :
                      "text-neutral-400"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-[12px] font-medium text-neutral-400 hover:text-white transition-colors">
                      {item.risk === 'high' ? 'Remind' : 'Notify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-white/5 flex justify-between items-center">
          <span className="text-sm text-neutral-300">Total outstanding rent: <span className="text-white font-medium">$16,050</span></span>
          <Button variant="ghost" size="sm" className="text-sm text-neutral-400">View all</Button>
        </div>
      </div>

      {/* UTILITY LEDGER */}
      <div className="flex flex-col rounded-2xl bg-[#1E1E2A] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-neutral-200">Utility payments</h3>
          </div>
          <div className="flex gap-2">
             {['Water', 'Electric', 'Gas'].map(t => (
               <span key={t} className="px-2.5 py-1 rounded-full bg-white/5 text-sm text-neutral-300 font-medium">{t}</span>
             ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Unit / Property</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300">Type</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300 text-right">Billed</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300 text-right">Paid</th>
                <th className="px-6 py-4 text-sm font-semibold text-neutral-300 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {UTILITY_DATA.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-medium text-white">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] text-neutral-400">{item.type}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[14px] text-neutral-300">{item.billed}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={cn("text-[14px] font-medium", item.paid === '$0' ? "text-neutral-500" : "text-white")}>
                      {item.paid}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[12px] font-medium text-neutral-400">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/5 flex justify-between items-center mt-auto">
          <span className="text-sm text-neutral-300">Total unpaid utilities: <span className="text-white font-medium">$4,550</span></span>
          <Button variant="ghost" size="sm" className="text-sm text-neutral-400">
            Record payment
          </Button>
        </div>
      </div>
    </div>
  )
}
