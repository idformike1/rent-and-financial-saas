'use client'

import React from 'react'
import { Calendar, Zap, FileText, ChevronRight, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const UPCOMING_RENT = [
  { unit: "Unit 7B - Waterside", amount: "$2,350", date: "May 12" },
  { unit: "Oakwood #101", amount: "$1,895", date: "May 14" },
  { unit: "Sunset Studios #4", amount: "$2,750", date: "May 10" },
  { unit: "Metro Loft #9A", amount: "$3,425", date: "May 15" },
]

export default function TacticalOverview() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* UPCOMING RENT LIST */}
        <div className="p-6 rounded-2xl bg-[#1E1E2A] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-neutral-200">Upcoming rent due (next 7 days)</h3>
             </div>
             <span className="text-sm text-neutral-400 font-medium">Total: $14,620</span>
          </div>
          
          <div className="space-y-3">
             {UPCOMING_RENT.map((item, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/[0.02] hover:bg-white/10 transition-all">
                  <span className="text-[14px] font-medium text-white">{item.unit}</span>
                  <div className="flex items-center gap-6">
                     <span className="text-[14px] font-medium text-white">{item.amount}</span>
                     <span className="text-[12px] text-neutral-400 min-w-[60px] text-right">Due {item.date}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* UTILITY BILLING SUMMARY */}
        <div className="p-6 rounded-2xl bg-[#1E1E2A] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <h3 className="text-base font-semibold text-neutral-200">Utility billing summary</h3>
             </div>
             <button className="p-1.5 rounded-full hover:bg-white/5 text-neutral-500 transition-colors">
                <FileText size={16} />
             </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-1">
                <span className="text-sm text-neutral-400 font-medium">Total billed (MTD)</span>
                <span className="text-2xl font-medium text-white">$23,220</span>
             </div>
             <div className="p-4 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-1">
                <span className="text-sm text-neutral-400 font-medium">Total collected</span>
                <span className="text-2xl font-medium text-white">$18,670</span>
             </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
             <span className="text-base text-neutral-300">Outstanding: <span className="text-white font-medium ml-1">$4,550</span></span>
             <button className="text-sm font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
                Send bulk invoice <ChevronRight size={16} />
             </button>
          </div>
        </div>
      </div>

      {/* FOOTER SNAPSHOT TEXT */}
      <div className="p-4 px-6 rounded-xl bg-[#1E1E2A] border border-white/5 flex items-center gap-4">
         <BarChart3 className="text-neutral-500 shrink-0" size={20} />
         <p className="text-sm text-neutral-400 leading-relaxed">
            <span className="text-neutral-200 font-medium mr-2">Cash flow snapshot:</span>
            Total cash collected to date (year) is <span className="text-neutral-200 font-medium">$587,230</span>. Remaining projected collectible: <span className="text-neutral-200 font-medium">$89,420</span> over next 60 days. Delinquency rate at 3.2% is below regional benchmark. Focus on the overdue rent list to improve cash position by $16k.
         </p>
      </div>
    </div>
  )
}
