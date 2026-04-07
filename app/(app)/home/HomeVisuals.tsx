'use client'

import { Area, AreaChart, ResponsiveContainer, XAxis, Tooltip } from 'recharts'
import { Card, Button, cn } from '@/components/ui-finova'
import { Plus, MoreHorizontal, Wallet, Shield, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'

// ─── MOCK FINANCIAL DATA ──────────────────────────────────────────────────
const treasuryData = [
  { date: 'Mar 1', value: 3800000 },
  { date: 'Mar 8', value: 4100000 },
  { date: 'Mar 15', value: 3950000 },
  { date: 'Mar 22', value: 4800000 },
  { date: 'Mar 29', value: 5216471.18 },
]

const ledgers = [
  { name: 'Operating Account', balance: 2840192.44, icon: Wallet },
  { name: 'Escrow Reserve',   balance: 1450000.00, icon: Shield },
  { name: 'Accounts Payable',  balance: -420550.00,  icon: Clock },
  { name: 'Accounts Receivable', balance: 1346828.74, icon: Zap },
]

function Zap({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export default function HomeVisuals() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* ── COMPONENT A: TREASURY CHART CARD (2-COLUMN) ────────────────────── */}
      <Card className="lg:col-span-1 flex flex-col justify-between p-6 bg-card border-border shadow-none rounded-[12px] min-h-[380px]">
        
        <div className="flex justify-between items-start">
            <div className="space-y-1">
               <h3 className="text-[15px] font-[400] text-white tracking-tight">Mercury balance</h3>
               <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-[28px] leading-[42px] font-[380] text-white tracking-[-0.03em] font-display">
                    $5,216,471.18
                  </span>
                 <span className="text-[13px] font-[400] text-mercury-green flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" />
                    $1.8M
                 </span>
              </div>
           </div>

           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-[11px] font-[400] text-foreground/60 tracking-tight">Last 30 Days</span>
              <Plus className="w-3 h-3 opacity-40 shrink-0" rotate={45} />
           </div>
        </div>

        <div className="flex-1 mt-8 -mx-6 -mb-6 rounded-b-[12px] overflow-hidden">
           <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={treasuryData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#8DA4F5" stopOpacity={0.28} />
                       <stop offset="100%" stopColor="#8DA4F5" stopOpacity={0.08} />
                    </linearGradient>
                  </defs>
                 <XAxis 
                   dataKey="date" 
                   hide={false} 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fill: 'var(--muted-foreground)', opacity: 0.4 }}
                   interval={1}
                 />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#171721', border: '1px solid var(--border)', borderRadius: '8px' }}
                   itemStyle={{ color: 'var(--foreground)' }}
                   cursor={{ stroke: 'rgba(255,255,255,0.05)', strokeWidth: 1 }}
                 />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8DA4F5" 
                    strokeWidth={1.5}
                    fill="url(#chartGradient)" 
                    animationDuration={1500}
                  />
              </AreaChart>
           </ResponsiveContainer>
        </div>
      </Card>

      {/* ── COMPONENT B: LEDGER BALANCES CARD (1-COLUMN) ───────────────────── */}
       <Card className="lg:col-span-1 p-6 bg-card border-border shadow-none rounded-[12px] flex flex-col">
          
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[15px] font-[400] text-white tracking-tight">Accounts</h3>
            <div className="flex items-center gap-2">
               <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground/40" />
               </button>
               <button className="p-1 hover:bg-white/5 rounded-full transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground/40" />
               </button>
            </div>
         </div>

         <div className="flex-1 space-y-4">
            {ledgers.map((ledger) => (
               <div key={ledger.name} className="flex items-center justify-between group cursor-pointer h-10 px-2 -mx-2 hover:bg-white/[0.03] rounded-[6px] transition-all">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-muted-foreground/30 group-hover:text-foreground/60 transition-colors shrink-0">
                        <ledger.icon className="w-4 h-4" />
                     </div>
                     <span className="text-[13px] font-[400] text-foreground/80">{ledger.name}</span>
                  </div>
                  <span className={cn(
                    "text-[14px] font-[380] font-finance tracking-tight",
                    ledger.balance < 0 ? "text-foreground/40" : "text-foreground"
                  )}>
                     {ledger.balance < 0 ? '−' : ''}${Math.abs(ledger.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
               </div>
            ))}
         </div>

          <div className="mt-6 pt-4 border-t border-white/[0.04]">
             <button className="text-[13px] font-[400] text-muted-foreground hover:text-foreground transition-colors tracking-tight">
                View all accounts
             </button>
          </div>
      </Card>

    </div>
  )
}
