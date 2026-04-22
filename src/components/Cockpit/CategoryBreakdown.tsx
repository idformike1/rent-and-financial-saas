import React from 'react'

interface CategorySum {
  name: string
  amount: number
  percentage: number
}

export default function CategoryBreakdown({ data }: { data: CategorySum[] }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-6 animate-in fade-in zoom-in-95 duration-700">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Burn Breakdown</h3>
        <span className="text-[10px] text-white/40 uppercase font-mono">Current Month</span>
      </div>
      
      <div className="space-y-6">
        {data.sort((a, b) => b.amount - a.amount).map((item) => (
          <div key={item.name} className="space-y-2 group">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-bold text-white/80 uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                {item.name}
              </span>
              <div className="text-right">
                <span className="text-[12px] font-mono font-bold text-white block">
                  ${Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-white/30 uppercase font-mono">
                  {item.percentage.toFixed(1)}% of burn
                </span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
                <div 
                    className="h-full bg-gradient-to-r from-amber-500/50 to-amber-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                    style={{ width: `${item.percentage}%` }}
                />
            </div>
          </div>
        ))}
        
        {data.length === 0 && (
            <div className="h-48 flex flex-col items-center justify-center text-white/20 border border-dashed border-white/10 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-20">
                    <span className="text-xs">!</span>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em]">No monthly telemetry available</span>
            </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase font-bold">Total Lifestyle Burn</span>
                <span className="text-sm font-mono font-bold text-amber-500">
                    ${data.reduce((acc, curr) => acc + Math.abs(curr.amount), 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            </div>
        </div>
      )}
    </div>
  )
}
