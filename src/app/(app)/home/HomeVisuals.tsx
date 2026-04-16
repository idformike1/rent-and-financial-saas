'use client'

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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* ── COMPONENT A: TREASURY CHART CARD (2-COLUMN) ────────────────────── */}
      <Card className="lg:col-span-1 min-h-[380px]">
        
        <div className="flex justify-between items-start">
            <div className="space-y-1">
               <h3 className="text-[15px] font-[400] text-white tracking-tight font-sans">Mercury balance</h3>
               <div className="flex items-baseline gap-3 mt-1">
                  <span className="text-[28px] leading-[42px] font-[400] text-white tracking-tight font-sans">
                    $5,216,471.18
                  </span>
                 <span className="text-[13px] font-[400] text-mercury-green flex items-center gap-1">
                    ↑ $1.8M
                 </span>
              </div>
           </div>

           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-[6px] border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
              <span className="text-[12px] font-[400] text-white/60 tracking-tight font-sans">Last 30 days</span>
              <span className="text-[11px] opacity-40">✕</span>
           </div>
        </div>

        <div className="flex-1 mt-8 -mx-6 -mb-6 rounded-b-[12px] overflow-hidden">
           <ResponsiveContainer width="100%" height={260}>
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
        </div>
      </Card>

      {/* ── COMPONENT B: LEDGER BALANCES CARD (1-COLUMN) ───────────────────── */}
       <div className="lg:col-span-1 mercury-card">
          
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-[15px] font-[400] text-white tracking-tight font-sans">Accounts</h3>
            <div className="flex items-center gap-2">
               <Button type="button" variant="ghost" disabled={false} className="p-1 h-7 w-7 bg-transparent hover:bg-white/5 rounded-[6px] transition-colors border-none group text-muted-foreground/40 hover:text-white">
                  +
               </Button>
               <Button type="button" variant="ghost" disabled={false} className="p-1 h-7 w-7 bg-transparent hover:bg-white/5 rounded-[6px] transition-colors border-none group text-muted-foreground/40 hover:text-white font-bold">
                  •••
               </Button>
            </div>
         </div>

         <div className="flex-1 space-y-4">
            {ledgers.map((ledger) => (
               <div key={ledger.name} className="flex items-center justify-between group cursor-pointer h-10 px-2 -mx-2 hover:bg-white/[0.03] rounded-[6px] transition-all">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-[6px] bg-white/5 border border-white/5 flex items-center justify-center text-white/30 group-hover:text-white/60 transition-colors shrink-0 text-[10px] font-bold">
                        {ledger.name.charAt(0)}
                     </div>
                     <span className="text-[15px] font-[400] text-white tracking-tight font-sans">{ledger.name}</span>
                  </div>
                  <span className={cn(
                    "text-[14px] font-[400] font-sans tracking-tight",
                    ledger.balance < 0 ? "text-white/40" : "text-white"
                  )}>
                     {ledger.balance < 0 ? '−' : ''}${Math.abs(ledger.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
               </div>
            ))}
         </div>

          <div className="mt-auto pt-4 border-t border-white/[0.04]">
             <Button type="button" variant="ghost" disabled={false} className="h-auto p-0 text-[15px] font-[400] text-white/40 hover:text-white transition-colors tracking-tight bg-transparent hover:bg-transparent border-none">
                View all accounts
             </Button>
          </div>
       </div>

    </div>
  )
}
