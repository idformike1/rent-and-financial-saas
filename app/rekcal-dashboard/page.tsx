'use client'

import { Search, Bell, SlidersHorizontal } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { CreditCardWidget } from './CreditCardWidget'
import { MetricsGrid } from './MetricsGrid'
import { AnalyticsChart } from './AnalyticsChart'
import { TotalActivityChart } from './TotalActivityChart'

export default function RekcalDashboard() {
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F4F4F6] p-4 font-sans tracking-tight">
      <div className="flex w-full h-full bg-white rounded-[32px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Isolated Sidebar Column */}
        <Sidebar />

        {/* Global Blueprint Main Area */}
        <main className="flex-1 flex overflow-y-auto overflow-x-hidden relative scroll-smooth">
           {/* Left Blueprint Column (Middle Column in Mockup) */}
           <div className="w-[420px] pt-12 pl-12 pr-6 border-r border-[#F4F4F6] flex-shrink-0 flex flex-col">
              <h1 className="text-[32px] font-bold text-[#1F1D2C] tracking-tighter mb-12">Dashboard</h1>
              <CreditCardWidget />
           </div>

           {/* Right Blueprint Column */}
           <div className="flex-1 flex flex-col pt-12 px-10 pb-12 w-full max-w-[900px]">
              {/* Telemetry Header */}
              <header className="flex justify-between items-center w-full mb-12">
                 <div className="relative w-full max-w-[400px]">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#A09FB1]" />
                   <input 
                     type="text" 
                     placeholder="Search" 
                     className="w-full bg-[#FAFAFB] border border-[#F4F4F6] rounded-full py-3.5 pl-14 pr-6 text-[14px] font-bold text-[#1F1D2C] outline-none hover:bg-white focus:bg-white focus:shadow-sm focus:border-[#E2DFFB] transition-all"
                   />
                 </div>
                 <div className="flex items-center space-x-6">
                    <button className="relative text-[#A09FB1] hover:text-[#1F1D2C] transition-colors">
                       <Bell className="w-6 h-6" />
                       <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#F23D5B] ring-2 ring-white" />
                    </button>
                    <button className="w-12 h-12 rounded-full border border-[#F4F4F6] flex items-center justify-center text-[#A09FB1] hover:text-[#1F1D2C] hover:border-[#E2DFFB] transition-colors bg-white shadow-sm">
                       <SlidersHorizontal className="w-[18px] h-[18px]" />
                    </button>
                 </div>
              </header>

              {/* Top Right Grid (Metrics + Analytics) */}
              <div className="flex space-x-8 mb-4 w-full h-[360px]">
                 <div className="flex-1 max-w-[500px]">
                    <MetricsGrid />
                 </div>
                 <div className="w-[300px] flex-shrink-0">
                    <AnalyticsChart />
                 </div>
              </div>

              {/* Bottom Right Span (Total Activity) */}
              <div className="w-full pt-8">
                <TotalActivityChart />
              </div>
           </div>
        </main>
      </div>
    </div>
  )
}
