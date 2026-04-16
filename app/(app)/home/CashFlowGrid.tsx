'use client'

import { Card } from '@/components/ui-finova'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'

// ─── MOCK DATA ────────────────────────────────────────────────────────────
const moneyInSources = [
  { name: 'ACH Deposits (Stripe)', amount: 110500.00 },
  { name: 'Wire Transfers (Intl)', amount: 32000.50 },
  { name: 'Cash Deposits (Branch)',amount: 8500.00 },
  { name: 'Inter-Account Transfer',amount: 3608.79 },
]

const moneyOutSources = [
  { name: 'Payroll (Gusto)',       amount: -125400.00 },
  { name: 'Tax Liability (IRS)',   amount: -45000.00 },
  { name: 'Vendor Payments (AWS)', amount: -28500.60 },
  { name: 'Office Leasing (WeWork)',amount:-12760.62 },
]

const sparklineData = [
  { value: 400 },
  { value: 450 },
  { value: 500 },
  { value: 480 },
  { value: 550 },
  { value: 650, current: true },
]

export default function CashFlowGrid() {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-[16px] font-[380] text-foreground tracking-tight">Cash Flow Dynamics</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/[0.08] rounded-[6px]">
           <button className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-3.5 h-3.5" /></button>
           <span className="text-[12px] font-[400] text-foreground">Apr 2026</span>
           <button className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ── CARD A: MONEY IN ────────────────────────────────────────────────── */}
        <div className="mercury-card">
          <div className="space-y-1">
            <h3 className="text-[15px] font-[400] text-white/50 tracking-tight font-sans">Money in</h3>
            <p className="text-[28px] leading-[42px] font-[400] text-mercury-green tracking-tight font-sans">$154,609.29</p>
          </div>

          <div className="mt-8 flex-1">
            <h4 className="text-[11px] font-[400] text-muted-foreground tracking-wider mb-4 border-b border-border pb-2">Top sources</h4>
            <div className="space-y-3">
              {moneyInSources.map((source, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[6px] bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                       {source.name.charAt(0)}
                    </div>
                    <span className="text-[15px] font-[400] text-white font-sans">{source.name}</span>
                  </div>
                  <span className="text-[15px] font-[400] text-mercury-green font-sans">${source.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-between items-center">
            <span className="text-[12px] font-[400] text-white/40 font-sans">Last 3 months average $585K</span>
            <div className="w-[80px] h-[30px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sparklineData}>
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {sparklineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.current ? "var(--foreground)" : "var(--muted)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── CARD B: MONEY OUT ───────────────────────────────────────────────── */}
        <div className="mercury-card">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                  <p className="text-[15px] font-[400] text-white/50 tracking-tight font-sans">Money out</p>
               <Info className="w-3.5 h-3.5 text-white/20" />
            </div>
            <p className="text-[28px] leading-[42px] font-[400] text-white tracking-tight font-sans">-$211,661.22</p>
          </div>

          <div className="mt-8 flex-1">
            <h4 className="text-[11px] font-[400] text-muted-foreground tracking-wider mb-4 border-b border-border pb-2">Top spend</h4>
            <div className="space-y-3">
              {moneyOutSources.map((source, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[6px] bg-muted flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                       {source.name.charAt(0)}
                    </div>
                    <span className="text-[15px] font-[400] text-white/80 font-sans">{source.name}</span>
                  </div>
                  <span className="text-[15px] font-[400] text-white font-sans">
                     {source.amount < 0 ? '−' : ''}${Math.abs(source.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.04] flex justify-between items-center">
            <span className="text-[12px] font-[400] text-white/40 font-sans">Last 3 months average -$220K</span>
            <div className="w-[80px] h-[30px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sparklineData}>
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {sparklineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.current ? "var(--foreground)" : "var(--muted)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
