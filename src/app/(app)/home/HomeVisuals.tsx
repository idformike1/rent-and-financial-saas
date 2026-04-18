'use client'

import React, { useState, useEffect } from 'react'
import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { Card, Button, cn } from '@/components/ui-finova'


// ─── MOCK FINANCIAL DATA ──────────────────────────────────────────────────
const treasuryData = [
  { date: 'Mar 1', value: 3800000 },
  { date: 'Mar 8', value: 4100000 },
  { date: 'Mar 15', value: 3950000 },
  { date: 'Mar 22', value: 4800000 },
  { date: 'Mar 29', value: 5216471.18 },
]

const ledgers = [
  { name: 'Operating Account', balance: 2840192.44, icon: '[W]' },
  { name: 'Escrow Reserve',   balance: 1450000.00, icon: '[S]' },
  { name: 'Accounts Payable',  balance: -420550.00,  icon: '[P]' },
  { name: 'Accounts Receivable', balance: 1346828.74, icon: '[Ξ]' },
]

// Zap removed for V4 compliance

export default function HomeVisuals() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true) }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* ── COMPONENT A: TREASURY CHART CARD (2-COLUMN) ────────────────────── */}
      <Card className="lg:col-span-1 min-h-[400px] bg-muted/5 border border-border backdrop-blur-sm shadow-2xl relative overflow-hidden">
        
        <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
               <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em] mb-3">Mercury Liquidity Position</h3>
               <div className="flex items-baseline gap-3">
                  <span className="text-display font-weight-display text-foreground text-4xl leading-none">
                    $5,216,471.18
                  </span>
                 <span className="text-[11px] font-bold text-mercury-green uppercase tracking-[0.1em] flex items-center gap-1">
                    ↑ $1.8M
                 </span>
              </div>
           </div>

           <div className="flex items-center gap-2 px-3 py-1.5 bg-muted border border-border rounded-[var(--radius-sm)] cursor-pointer hover:bg-muted/50 transition-colors">
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em]">Interval: 30D</span>
           </div>
        </div>

        <div className="flex-1 mt-8 -mx-6 -mb-6 rounded-b-[var(--radius)] overflow-hidden">
          {mounted && (
           <ResponsiveContainer width="100%" height={260} minWidth={0} debounce={50}>
              <AreaChart data={treasuryData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="var(--sidebar-primary)" stopOpacity={0.28} />
                       <stop offset="100%" stopColor="var(--sidebar-primary)" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                 <XAxis 
                   dataKey="date" 
                   hide={false} 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fill: '#FFFFFF', fontSize: 11, fontWeight: 400 }}
                   interval="preserveStartEnd"
                   ticks={['Mar 13', 'Mar 18', 'Mar 23', 'Mar 28', 'Apr 2']}
                   padding={{ left: 0, right: 0 }}
                 />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#171721', border: '1px solid var(--border)', borderRadius: '8px' }}
                   itemStyle={{ color: 'var(--foreground)' }}
                   cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                 />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--sidebar-primary)" 
                    strokeWidth={1.5}
                    fill="url(#chartGradient)" 
                    animationDuration={1500}
                  />
              </AreaChart>
           </ResponsiveContainer>
            )}
        </div>
      </Card>

      {/* ── COMPONENT B: LEDGER BALANCES CARD (1-COLUMN) ───────────────────── */}
       <div className="lg:col-span-1 bg-muted/5 border border-border p-8 rounded-[var(--radius)] backdrop-blur-sm shadow-2xl flex flex-col">
          
          <div className="flex justify-between items-center mb-10">
             <h3 className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.15em]">Registry Node Balances</h3>
            <div className="flex items-center gap-2">
               <Button type="button" variant="ghost" disabled={false} className="p-0 h-8 w-8 bg-muted border border-border rounded-[var(--radius-sm)] transition-colors hover:bg-muted/50 text-foreground/40 hover:text-foreground">
                  +
               </Button>
               <Button type="button" variant="ghost" disabled={false} className="p-0 h-8 w-8 bg-muted border border-border rounded-[var(--radius-sm)] transition-colors hover:bg-muted/50 text-foreground/40 hover:text-foreground">
                  •••
               </Button>
            </div>
         </div>

         <div className="flex-1 space-y-3">
            {ledgers.map((ledger) => (
               <div key={ledger.name} className="flex items-center justify-between group cursor-pointer h-12 px-3 -mx-3 hover:bg-muted/50 rounded-[var(--radius-sm)] transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-muted border border-border flex items-center justify-center text-foreground/40 group-hover:text-foreground transition-colors shrink-0 text-[10px] font-bold">
                        {ledger.name.charAt(0)}
                     </div>
                     <span className="text-[14px] font-medium text-foreground tracking-tight">{ledger.name}</span>
                  </div>
                  <span className={cn(
                    "text-[15px] font-medium font-sans tracking-tight tabular-nums",
                    ledger.balance < 0 ? "text-destructive/80" : "text-foreground"
                  )}>
                     {ledger.balance < 0 ? '−' : ''}${Math.abs(ledger.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
               </div>
            ))}
         </div>

          <div className="mt-8 pt-6 border-t border-border">
             <Button type="button" variant="ghost" disabled={false} className="h-auto p-0 text-[10px] font-bold text-foreground/40 hover:text-foreground uppercase tracking-[0.15em] transition-colors bg-transparent hover:bg-transparent border-none">
                Expand Ledger Registry
             </Button>
          </div>
       </div>

    </div>
  )
}
