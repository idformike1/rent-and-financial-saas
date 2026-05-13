'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressCardProps {
  title: string
  value: string
  subtitle?: string
  progress: number
  progressColor: string
  details: { label: string; value: string; color: string }[]
}

function ProgressCard({ title, value, subtitle, progress, progressColor, details }: ProgressCardProps) {
  return (
    <div className="group p-6 rounded-2xl bg-[#1E1E2A] border border-white/5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-base font-semibold text-neutral-200 mb-1">
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-medium text-white tracking-tight">{value}</span>
            {subtitle && <span className="text-base font-medium text-neutral-500">{subtitle}</span>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full", progressColor)}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between gap-4">
          {details.map((detail, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-sm text-neutral-400 font-medium mb-0.5">{detail.label}</span>
              <span className={cn("text-sm font-medium", detail.color)}>{detail.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProgressTrackerCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ProgressCard
        title="Projected collections"
        value="$89,420"
        progress={68}
        progressColor="bg-blue-500"
        details={[
          { label: "Likely collected", value: "$61,200", color: "text-neutral-300" },
          { label: "Delinquent risk", value: "$28,220", color: "text-neutral-300" }
        ]}
      />
      <ProgressCard
        title="Rent collected vs due"
        value="$112,400"
        subtitle="/ $128,450"
        progress={87.5}
        progressColor="bg-emerald-500"
        details={[
          { label: "Collected 87.5%", value: "$112,400", color: "text-neutral-300" },
          { label: "Remaining due", value: "$16,050", color: "text-neutral-300" }
        ]}
      />
      <ProgressCard
        title="Utility payments"
        value="$18,670"
        subtitle="/ $23,220"
        progress={80.4}
        progressColor="bg-cyan-500"
        details={[
          { label: "Recovery rate", value: "80.4%", color: "text-neutral-300" },
          { label: "Outstanding", value: "$4,550", color: "text-neutral-300" }
        ]}
      />
    </div>
  )
}
