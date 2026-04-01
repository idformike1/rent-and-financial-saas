'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { MoreVertical } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function AnalyticsChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  
  const data = [
    { name: '45%', value: 45, color: '#A7F3D0' }, // Green
    { name: '34%', value: 34, color: '#D4D2F8' }, // Purple
    { name: '21%', value: 21, color: '#1A1822' }, // Dark
  ]

  useEffect(() => {
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "elastic.out(1, 0.7)", delay: 0.2 }
      )
    }
  }, [])

  return (
    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#F4F4F6] w-full h-[340px] flex flex-col items-center select-none">
      <div className="w-full flex justify-between items-center mb-6 px-2">
        <h3 className="font-bold text-[#1F1D2C] text-[18px]">Analytics</h3>
        <MoreVertical className="w-5 h-5 text-[#A09FB1] cursor-pointer" />
      </div>

      <div className="relative w-full flex-1 flex flex-col items-center justify-center p-4">
        <div ref={chartRef} className="w-[160px] h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Central hole background */}
          <div className="absolute inset-0 m-auto w-[100px] h-[100px] bg-white rounded-full shadow-inner" />
          
          {/* Static Chart Labels as modeled */}
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[12px] font-black tracking-tighter text-[#1F1D2C]">45%</span>
          <span className="absolute bottom-2 left-0 -translate-x-2 text-[12px] font-black tracking-tighter text-[#1F1D2C]">21%</span>
          <span className="absolute bottom-2 right-0 translate-x-2 text-[12px] font-black tracking-tighter text-[#1F1D2C]">34%</span>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 mt-4 px-2">
        <div className="flex items-center text-[12px] font-medium text-[#1F1D2C] tracking-wide">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1A1822] mr-2" /> Left
        </div>
        <div className="flex items-center text-[12px] font-medium text-[#1F1D2C] tracking-wide">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D4D2F8] mr-2" /> In progress
        </div>
        <div className="flex items-center text-[12px] font-medium text-[#1F1D2C] tracking-wide mt-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#A7F3D0] mr-2" /> Done
        </div>
      </div>
    </div>
  )
}
