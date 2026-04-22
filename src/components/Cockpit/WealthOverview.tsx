'use client'

import React, { Suspense } from 'react'
import { useFinancialMetrics } from '@/src/hooks/useWorkspaceData'
import TrendChart from './TrendChart'
import HoldingsMatrix from './HoldingsMatrix'
import { ArrowUpRight, ArrowDownRight, Activity, Zap, Shield, Wallet, TrendingUp as TrendingUpIcon } from 'lucide-react'

const MOCK_TREND_DATA = [
    { date: 'JAN', value: 420000 },
    { date: 'FEB', value: 435000 },
    { date: 'MAR', value: 410000 },
    { date: 'APR', value: 460000 },
    { date: 'MAY', value: 485000 },
    { date: 'JUN', value: 510000 },
]

export default function WealthOverview() {
  const { data: metrics, isLoading } = useFinancialMetrics()

  // High-Fidelity Calculations (Simulated for this workspace)
  const netWorth = metrics?.current?.revenue ? (metrics.current.revenue * 5) : 1250000 
  const burnRate = metrics?.current?.opex || 4500
  const savingsDelta = metrics?.deltas?.revenue || 12.5

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* ── MACRO HUD (WEALTH EDITION) ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard 
          label="Net Worth" 
          value={isLoading ? "Loading..." : `$${(netWorth / 1000000).toFixed(2)}M`} 
          delta="+4.2%" 
          isPositive={true}
          icon={<Wallet className="w-4 h-4" />}
          loading={isLoading}
        />
        <KpiCard 
          label="Monthly Burn" 
          value={isLoading ? "Loading..." : `$${burnRate.toLocaleString()}`} 
          delta="-0.8%" 
          isPositive={true} 
          icon={<Zap className="w-4 h-4" />}
          loading={isLoading}
        />
        <KpiCard 
          label="Savings Delta" 
          value={isLoading ? "Loading..." : `${savingsDelta.toFixed(1)}%`} 
          delta="+2.1%" 
          isPositive={true}
          icon={<TrendingUpIcon className="w-4 h-4" />}
          loading={isLoading}
        />
        <KpiCard 
          label="Protection Coverage" 
          value="98%" 
          delta="STABLE" 
          isPositive={true}
          icon={<Shield className="w-4 h-4" />}
        />
      </div>

      {/* ── CORE ANALYTICS STRATUM ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <Suspense fallback={<WidgetSkeleton title="Growth Trajectory" />}>
            <TrendChart data={MOCK_TREND_DATA} title="Growth Trajectory" />
          </Suspense>
        </div>
        <div className="xl:col-span-1">
          <Suspense fallback={<WidgetSkeleton title="Holdings Matrix" />}>
            <HoldingsMatrix />
          </Suspense>
        </div>
      </div>

      {/* ── SYSTEM ADVISORY ──────────────────────────────────────────────── */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-6 flex gap-4 items-start">
        <div className="p-2 bg-amber-500/20 rounded-lg">
            <Activity className="w-5 h-5 text-amber-500" />
        </div>
        <div>
            <h4 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-1">Noble Advisory</h4>
            <p className="text-sm text-amber-500/80 leading-relaxed max-w-2xl">
                Liquidity is currently 15% above target. Consider rebalancing $42,000 into the Growth Index Fund 
                to maintain your Sovereign Equity stance. Tax-loss harvesting opportunities detected in Vanguard holdings.
            </p>
        </div>
      </div>
    </div>
  )
}

function WidgetSkeleton({ title }: { title: string }) {
    return (
        <div className="bg-card border border-border/50 rounded-xl p-6 shadow-sm animate-pulse">
            <h3 className="text-xs font-bold text-clinical-muted uppercase tracking-widest mb-6">{title}</h3>
            <div className="h-[240px] w-full bg-white/5 rounded-lg"></div>
        </div>
    )
}

function KpiCard({ label, value, delta, isPositive, icon, loading }: { label: string, value: string, delta: string, isPositive: boolean, icon: any, loading?: boolean }) {
  return (
    <div className="bg-card border border-border/50 p-6 rounded-xl shadow-sm hover:border-amber-500/30 transition-all group overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg text-clinical-muted group-hover:text-amber-500 transition-colors">
            {icon}
        </div>
        {!loading && (
            <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                delta === 'STABLE' ? 'bg-white/5 text-clinical-muted' :
                isPositive ? 'bg-mercury-green/10 text-mercury-green' : 'bg-destructive/10 text-destructive'
            }`}>
                {delta !== 'STABLE' && (isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />)}
                {delta}
            </div>
        )}
      </div>
      <div>
        <p className="text-[11px] font-bold text-clinical-muted uppercase tracking-widest mb-1">{label}</p>
        <div className={loading ? "h-8 w-24 bg-white/5 rounded animate-pulse" : ""}>
            {!loading && <p className="text-2xl font-mono font-bold text-white tracking-tight">{value}</p>}
        </div>
      </div>
    </div>
  )
}
