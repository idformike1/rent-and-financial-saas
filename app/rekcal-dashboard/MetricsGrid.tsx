'use client'

import { Map, Grid, Wallet, FileKey2 } from 'lucide-react'

export function MetricsGrid() {
  const metrics = [
    { label: 'Total Properties', value: '45', subValue: '', icon: Map, highlight: true },
    { label: 'Vacant Units', value: '3', subValue: '', icon: Grid, highlight: false },
    { label: 'Current Rent (Month)', value: '$18.657', subValue: ',00', icon: Wallet, highlight: false },
    { label: 'Active Leases', value: '42', subValue: '', icon: FileKey2, highlight: false },
  ]

  return (
    <div className="grid grid-cols-2 gap-6 w-full mb-10">
      {metrics.map((metric, idx) => (
        <div 
          key={idx} 
          className={`relative p-6 rounded-[24px] h-[160px] flex flex-col justify-between transition-transform select-none hover:scale-[1.02] ${
            metric.highlight ? 'bg-[#EEECFE] border shadow-sm border-[#EEECFE]' : 'bg-white border-[#F4F4F6] border shadow-sm'
          }`}
        >
          {/* Card Icon Container */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F1D2C] to-[#3B384C] flex items-center justify-center text-white mb-4">
             <metric.icon className="w-4 h-4" />
          </div>

          <div>
             <p className="text-[#A09FB1] text-[13px] font-medium tracking-wide mb-1">{metric.label}</p>
             <h3 className="font-black text-[#1F1D2C] text-[28px] tracking-tighter leading-none">
                {metric.value}<span className="text-[#A09FB1] text-[14px]">{metric.subValue}</span>
             </h3>
          </div>
        </div>
      ))}
    </div>
  )
}
