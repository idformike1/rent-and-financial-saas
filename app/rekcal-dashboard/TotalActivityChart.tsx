'use client'

import { PieChart as PieChartIcon, ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export function TotalActivityChart() {
  const barsRef = useRef<HTMLDivElement>(null)

  const chartData = [
    { month: 'May', total: 60, weekly: 30 },
    { month: 'June', total: 50, weekly: 40 },
    { month: 'July', total: 85, weekly: 60, focusLabelTotal: '15.0k', focusLabelWeekly: '6.3k' },
    { month: 'August', total: 70, weekly: 50 },
  ]

  useEffect(() => {
    if (barsRef.current) {
      const bars = barsRef.current.querySelectorAll('.bar-fill')
      gsap.fromTo(
        bars,
        { height: '0%' },
        { height: (i, target) => target.dataset.targetHeight, duration: 1.5, ease: "power4.out", stagger: 0.1 }
      )
    }
  }, [])

  return (
    <div className="w-full bg-white rounded-[24px] p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-[#F4F4F6]">
      <div className="flex justify-between items-start mb-10">
        <h3 className="text-[20px] font-bold text-[#1F1D2C] tracking-tight">Total Activity</h3>
        <button className="text-[#A09FB1] hover:text-[#1F1D2C] transition-colors"><PieChartIcon className="w-6 h-6" /></button>
      </div>

      <div className="flex flex-col lg:flex-row h-[280px]">
        {/* Left Column Text / Legend */}
        <div className="flex flex-col justify-end lg:w-1/3 pb-6 space-y-8">
           <div>
             <div className="flex items-center text-[#A09FB1] text-[13px] font-medium tracking-wide mb-1">
               <div className="w-2.5 h-2.5 rounded-full bg-[#1A1822] mr-2" /> Total income
             </div>
             <p className="font-black text-[#1F1D2C] text-[26px] tracking-tighter leading-none pl-4.5 ml-4">
                $18.657<span className="text-[#A09FB1] text-[15px]">,00</span>
             </p>
           </div>
           
           <div>
             <div className="flex items-center text-[#A09FB1] text-[13px] font-medium tracking-wide mb-1">
               <div className="w-2.5 h-2.5 rounded-full bg-[#E2DFFB] mr-2" /> Weekly income
             </div>
             <p className="font-black text-[#1F1D2C] text-[26px] tracking-tighter leading-none pl-4.5 ml-4">
                $18.657<span className="text-[#A09FB1] text-[15px]">,00</span>
             </p>
           </div>
        </div>

        {/* Right Column Chart */}
        <div className="flex-1 flex" ref={barsRef}>
           {/* Y Axis */}
           <div className="flex flex-col justify-between text-[11px] font-bold text-[#A09FB1] text-right pr-6 pb-8 h-full">
             <span>300k</span>
             <span>250k</span>
             <span>200k</span>
             <span>100k</span>
             <span>0k</span>
           </div>

           {/* X Axis Grid & Bars */}
           <div className="flex-1 flex justify-between items-end h-[calc(100%-2rem)] relative">
              {/* Optional: Add light border-b for X axis if needed, mockup doesn't explicitly show heavy lines */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-[#F4F4F6]" />
              
              {chartData.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center h-full justify-end flex-1 relative group">
                  
                  {/* Total Label specific to July focus */}
                  {data.focusLabelTotal && (
                     <span className="absolute -top-6 text-[11px] font-black text-[#6C5CE7] -ml-6">{data.focusLabelTotal}</span>
                  )}
                  {data.focusLabelWeekly && (
                     <span className="absolute top-[30%] text-[11px] font-bold text-[#A09FB1] ml-8">{data.focusLabelWeekly}</span>
                  )}

                  <div className="flex items-end justify-center space-x-2 w-full z-10">
                    <div className="w-8 md:w-10 h-full flex items-end">
                       <div className={`w-full rounded-t-sm bar-fill ${data.focusLabelTotal ? 'bg-[#D4D2F8]' : 'bg-[#1A1822]'}`} data-target-height={`${data.total}%`} />
                    </div>
                    <div className="w-8 md:w-10 h-full flex items-end">
                       <div className="w-full bg-[#F4F5F8] rounded-t-sm bar-fill" data-target-height={`${data.weekly}%`} />
                    </div>
                  </div>
                  <span className="absolute -bottom-8 text-[12px] font-bold text-[#A09FB1] tracking-wide">{data.month}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="mt-14 mb-2 flex justify-between items-center px-2">
         <h4 className="text-[18px] font-bold text-[#1F1D2C] tracking-tight">Recent transfer</h4>
         <div className="flex space-x-4 bg-white border border-[#F4F4F6] rounded-full p-1 font-bold text-[12px] text-[#A09FB1]">
            <button className="px-4 py-1.5 rounded-full bg-white text-[#1F1D2C] shadow-sm tracking-wide border border-[#1F1D2C]">Today</button>
            <button className="px-4 py-1.5 rounded-full hover:text-[#1F1D2C] transition-colors tracking-wide">Week</button>
            <button className="px-4 py-1.5 rounded-full hover:text-[#1F1D2C] transition-colors tracking-wide">Month</button>
         </div>
      </div>

      {/* List Item beneath Recent Transfer */}
      <div className="flex items-center justify-between mt-6 px-2 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
         <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#F5F6F8] flex items-center justify-center text-[#1F1D2C]">
               <ArrowRight className="w-5 h-5 -rotate-45" />
            </div>
            <div>
               <h5 className="font-bold text-[#1F1D2C] text-[15px] tracking-tight mb-0.5 group-hover:text-[#6C5CE7] transition-colors">Make points on the places</h5>
               <p className="text-[#A09FB1] text-[12px] font-medium">Antoni Petleria</p>
            </div>
         </div>
         <span className="text-[#A09FB1] text-[13px] font-medium">Payment for design</span>
         <div className="text-right">
            <div className="flex items-center justify-end text-[#25C269] text-[13px] font-bold tracking-tight mb-0.5">
               <div className="w-3.5 h-3.5 bg-[#25C269] text-white rounded-full flex items-center justify-center mr-1.5">✓</div> Complete
            </div>
            <p className="text-[#A09FB1] text-[11px] font-bold tracking-widest uppercase">12:34</p>
         </div>
      </div>
    </div>
  )
}
