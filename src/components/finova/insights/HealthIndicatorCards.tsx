'use client'

import React from 'react'
import { MoreHorizontal } from 'lucide-react'

interface HealthCardProps {
  title: string
  value: string
  decimal?: string
  note?: string
}

function HealthCard({ title, value, decimal, note }: HealthCardProps) {
  return (
    <div className="group relative p-6 rounded-2xl bg-[#1E1E2A] border border-white/5">
      <div className="relative flex justify-between items-center mb-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-200">{title}</h3>
        </div>
        <button className="p-1 rounded-full hover:bg-white/5 text-neutral-500 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="relative flex items-baseline gap-1 mb-4">
        <span className="text-3xl font-medium text-white tracking-tight">{value}</span>
        {decimal && <span className="text-base font-medium text-neutral-400">{decimal}</span>}
      </div>

      {note && (
        <div className="relative pt-4 border-t border-white/5">
          <p className="text-sm text-neutral-400">
            {note}
          </p>
        </div>
      )}
    </div>
  )
}

export default function HealthIndicatorCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <HealthCard
        title="Total Cash Collected"
        value="$114,280"
        decimal=".00"
        note="Includes rent + utility payments"
      />
      <HealthCard
        title="Due to be Collected"
        value="$42,750"
        decimal=".00"
        note="Rent: $38,200 | Utilities: $4,550"
      />
      <HealthCard
        title="Cash Remaining (Reserve)"
        value="$123,890"
        decimal=".00"
        note="Enough to cover 4.2 months of expenses"
      />
    </div>
  )
}
