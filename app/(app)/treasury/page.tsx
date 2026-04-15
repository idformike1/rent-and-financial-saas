'use client'

import { useState } from 'react'
import { Landmark, ShieldCheck, ArrowUpRight, ArrowDownRight, Activity, Wallet, PieChart, Layers } from 'lucide-react'
import DashboardCharts from './DashboardCharts'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ── MOCKED FISCAL TELEMETRY ────────────────────────────────────────────────
const MOCK_TREND = [
  { month: 'Oct 25', income: 84200, expense: 32000 },
  { month: 'Nov 25', income: 89000, expense: 35000 },
  { month: 'Dec 25', income: 92500, expense: 41000 },
  { month: 'Jan 26', income: 87000, expense: 38000 },
  { month: 'Feb 26', income: 98000, expense: 42000 },
  { month: 'Mar 26', income: 104500, expense: 45000 },
]

const MOCK_RECOVERY = [
  { name: 'Core Operations', value: 45000 },
  { name: 'Debt Servicing', value: 25000 },
  { name: 'Capital Reserves', value: 15000 },
  { name: 'Tax Liability', value: 10000 },
  { name: 'System Fees', value: 4500 },
]

export default function TreasuryDashboard() {
  return (
    <div className="space-y-12">
      
      {/* ── HEADER: FISCAL ANCHOR ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[1.75rem] bg-sidebar-primary/10 flex items-center justify-center shadow-inner">
            <Landmark className="w-8 h-8 text-sidebar-primary" />
          </div>
          <div>
            <h1 className="text-display font-weight-display text-foreground leading-none">Treasury Command</h1>
            <p className="text-[11px] font-bold text-muted-foreground mt-3 uppercase tracking-[0.15em]">Sovereign Liquidity Registry — Mercury V.4.0</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Status</span>
            <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-mercury-green/10 border border-mercury-green/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-mercury-green animate-pulse" />
              <span className="text-[10px] font-bold text-mercury-green uppercase">Sync Nominal</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MACRO HUD: KEY FINANCIAL INDICES ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Portfolio Liquidity" 
          value="$1,248,500.00" 
          delta="+4.2%" 
          isPositive={true} 
          icon={Wallet} 
        />
        <StatCard 
          label="Net realization" 
          value="$932,180.40" 
          delta="+12.5%" 
          isPositive={true} 
          icon={Activity} 
        />
        <StatCard 
          label="Active Receivables" 
          value="$44,922.00" 
          delta="-0.8%" 
          isPositive={false} 
          icon={Layers} 
        />
        <StatCard 
          label="System Yield" 
          value="94.2%" 
          delta="+1.1%" 
          isPositive={true} 
          icon={ShieldCheck} 
        />
      </div>

      {/* ── VISUAL ANALYTIC LAYER ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
           <h2 className="text-[15px] font-bold text-foreground">Fiscal Telemetry</h2>
           <div className="h-[1px] flex-1 bg-border/40" />
        </div>
        <DashboardCharts trendData={MOCK_TREND} recoveryData={MOCK_RECOVERY} />
      </div>

      {/* ── FOOTER: SYSTEM INTEGRITY ─────────────────────────────────────── */}
      <div className="pt-8 border-t border-border flex justify-between items-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
         <span>GAAP Compliant Integrity Architecture</span>
         <span>Hash: 8FA2-B9CD-X011</span>
      </div>

    </div>
  )
}

function StatCard({ label, value, delta, isPositive, icon: Icon }: { label: string, value: string, delta: string, isPositive: boolean, icon: any }) {
  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-card border border-border p-6 rounded-[8px] flex flex-col gap-6 group hover:border-sidebar-primary/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-[12px] bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-sidebar-primary/5 group-hover:text-sidebar-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-[4px] text-[10px] font-bold flex items-center gap-1",
          isPositive ? "bg-mercury-green/10 text-mercury-green" : "bg-destructive/10 text-destructive"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {delta}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider leading-none mb-3">{label}</p>
        <p className="font-finance text-2xl font-bold text-foreground tracking-tight">{value}</p>
      </div>
    </motion.div>
  )
}
