'use client'

import React, { useState, useEffect } from 'react'
import { Card, Button } from '@/components/ui-finova'

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
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  return (
    <div className="mt-10">
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-mercury-heading text-foreground">Cash Flow Dynamics</h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.02] border border-white/[0.08] rounded-[var(--radius-sm)]">
           <Button type="button" variant="ghost" disabled={false} className="h-6 w-6 p-0 text-clinical-muted hover:text-foreground bg-transparent border-none">
             ◀
           </Button>
           <span className="text-mercury-body text-foreground">Apr 2026</span>
           <Button type="button" variant="ghost" disabled={false} className="h-6 w-6 p-0 text-clinical-muted hover:text-foreground bg-transparent border-none">
             ▶
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ── CARD A: MONEY IN ────────────────────────────────────────────────── */}
        <div className="mercury-card">
          <div className="space-y-1">
            <h3 className="text-mercury-body text-clinical-muted">Money in</h3>
            <p className="text-mercury-headline text-3xl text-mercury-green">$154,609.29</p>
          </div>

          <div className="mt-8 flex-1">
            <h4 className="text-mercury-label-caps text-clinical-muted mb-4 border-b border-border pb-2">Top sources</h4>
            <div className="space-y-3">
              {moneyInSources.map((source, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-mercury-label-caps text-clinical-muted">
                       {source.name.charAt(0)}
                    </div>
                    <span className="text-mercury-body text-foreground">{source.name}</span>
                  </div>
                  <span className="text-mercury-body text-mercury-green">${source.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-mercury-body text-clinical-low">Last 3 months average $585K</span>
            <div className="w-[80px] h-[30px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <BarChart data={sparklineData}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {sparklineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.current ? "var(--foreground)" : "var(--muted)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── CARD B: MONEY OUT ───────────────────────────────────────────────── */}
        <div className="mercury-card">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                  <p className="text-mercury-body text-clinical-muted">Money out</p>
               <span className="text-mercury-label-caps text-clinical-low">(i)</span>
            </div>
            <p className="text-mercury-headline text-3xl text-foreground">-$211,661.22</p>
          </div>

          <div className="mt-8 flex-1">
            <h4 className="text-mercury-label-caps text-clinical-muted mb-4 border-b border-border pb-2">Top spend</h4>
            <div className="space-y-3">
              {moneyOutSources.map((source, i) => (
                <div key={i} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-muted flex items-center justify-center text-mercury-label-caps text-clinical-muted">
                       {source.name.charAt(0)}
                    </div>
                    <span className="text-mercury-body text-foreground/80">{source.name}</span>
                  </div>
                  <span className="text-mercury-body text-foreground">
                     {source.amount < 0 ? '−' : ''}${Math.abs(source.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
            <span className="text-mercury-body text-clinical-low">Last 3 months average -$220K</span>
            <div className="w-[80px] h-[30px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
                  <BarChart data={sparklineData}>
                    <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                      {sparklineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.current ? "var(--foreground)" : "var(--muted)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
