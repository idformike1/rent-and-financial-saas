'use client'

import React from 'react'

export default function IntelligenceHeader() {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-white mb-1">
          Treasury Overview
        </h1>
        <p className="text-neutral-400 text-sm">
          Cash flow and collections metrics.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <select className="bg-transparent border border-white/10 text-sm text-neutral-300 rounded-lg px-3 py-1.5 outline-none hover:bg-white/5 transition-colors appearance-none cursor-pointer">
          <option value="last_7_days">Last 7 days</option>
          <option value="last_30_days">Last 30 days</option>
          <option value="last_90_days">Last 90 days</option>
          <option value="ytd">Year to date</option>
          <option value="all">All time</option>
        </select>
      </div>
    </header>
  )
}
