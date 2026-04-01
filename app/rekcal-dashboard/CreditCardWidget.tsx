'use client'

import { Settings, ChevronLeft, Plus, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react'

export function CreditCardWidget() {
  return (
    <div className="flex flex-col flex-1 pb-10">
      <div className="flex justify-between items-center mb-8 pr-4">
        <h2 className="text-[22px] font-bold text-[#1F1D2C] tracking-tight">My cards</h2>
        <div className="flex space-x-3 text-[#A09FB1]">
          <Settings className="w-5 h-5 cursor-pointer hover:text-[#1F1D2C] transition-colors" />
          <ChevronLeft className="w-5 h-5 cursor-pointer hover:text-[#1F1D2C] transition-colors" />
        </div>
      </div>

      {/* Replicated Card styling matching mockup */}
      <div className="w-[320px] h-[200px] mb-8 relative rounded-2xl overflow-hidden shadow-[0_12px_24px_-10px_rgba(26,24,34,0.3)] group select-none transition-transform hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#E2DFFB] to-[#D5D1F6] z-0" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[#2B2936] z-10 clip-path-polygon-[0_20%,_100%_0,_100%_100%,_0_100%]" style={{ clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)' }} />
        
        {/* Card Content Top (Watermark) */}
        <div className="relative z-20 px-6 py-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-2 text-[#1F1D2C]">
               <Globe className="w-6 h-6 stroke-2" />
               <span className="font-bold text-[18px] tracking-tight">PROPERTY FUND</span>
            </div>
            {/* Technical watermark shape abstracting the chip */}
            <div className="w-10 h-8 border border-white/40 rounded-md flex flex-col justify-between p-1 opacity-70">
               <div className="w-full h-[1px] bg-white/40" />
               <div className="w-full h-[1px] bg-white/40" />
               <div className="w-full h-[1px] bg-white/40" />
            </div>
          </div>

          <div className="mt-8 mb-4">
            <p className="text-white font-mono text-[16px] tracking-widest leading-none drop-shadow-sm font-semibold">
              **** **** **** 7865
            </p>
          </div>

          <div className="flex justify-between items-end text-[#858296]">
            <div>
               <p className="text-[10px] uppercase font-bold tracking-wider mb-1 opacity-80">Jeremy Toe</p>
               <p className="text-[12px] font-medium tracking-tight">12/24</p>
            </div>
            {/* Master Card overlaying circles */}
            <div className="flex -space-x-3 opacity-80">
               <div className="w-8 h-8 rounded-full bg-slate-300 mix-blend-multiply" />
               <div className="w-8 h-8 rounded-full bg-slate-400 mix-blend-multiply" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-[320px] bg-white rounded-2xl p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-[#F4F4F6]">
        <p className="text-[#A09FB1] text-[13px] font-medium mb-2 tracking-wide">Your Balance</p>
        <div className="flex items-baseline justify-between mb-8">
           <h1 className="text-[32px] font-black text-[#1F1D2C] tracking-tighter">$120.456<span className="text-[16px] text-[#A09FB1]">,00</span></h1>
           <div className="flex items-center space-x-3 text-xs font-bold tracking-wide">
             <span className="text-[#25C269] flex items-center bg-[#E5F9EF] px-2 py-1 rounded-md"><ArrowUpRight className="w-3 h-3 mr-1" /> 16,60%</span>
             <span className="text-[#F23D5B] flex items-center bg-[#FEECF0] px-2 py-1 rounded-md"><ArrowDownRight className="w-3 h-3 mr-1" /> 10,30%</span>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div>
             <p className="text-[#A09FB1] text-[12px] font-medium mb-1 tracking-wide">Currency</p>
             <p className="text-[#1F1D2C] font-black text-[15px]">USD/UAH</p>
           </div>
           <div>
             <p className="text-[#A09FB1] text-[12px] font-medium mb-1 tracking-wide">Status</p>
             <p className="text-[#1F1D2C] font-black text-[15px]">Active</p>
           </div>
        </div>

        <button className="w-full flex justify-center items-center py-4 rounded-xl border-2 border-[#1F1D2C] text-[#1F1D2C] font-bold text-[14px] hover:bg-[#1F1D2C] hover:text-white transition-all cursor-pointer">
           <Plus className="w-4 h-4 mr-2" strokeWidth={3} /> Add New Card
        </button>
      </div>

      {/* Quick Transfer Component */}
      <div className="w-[320px] mt-10">
        <div className="flex justify-between items-center mb-6 pr-4">
           <h3 className="text-[18px] font-bold text-[#1F1D2C]">Quick Transfer</h3>
           <button className="w-8 h-8 rounded-full border border-dashed border-[#A09FB1] flex items-center justify-center text-[#A09FB1] hover:border-[#1F1D2C] hover:text-[#1F1D2C] transition-colors">
              <Plus className="w-4 h-4" />
           </button>
        </div>
        
        <div className="flex items-center justify-between pr-4 mb-8">
           <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?u=1" className="grayscale w-full h-full object-cover" /></div>
           <div className="w-10 h-10 rounded-full bg-[#E5F9EF] flex items-center justify-center text-[#25C269] font-bold text-sm tracking-tighter relative z-10 ring-4 ring-[#F0F1F3]">Mm</div>
           <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?u=2" className="grayscale w-full h-full object-cover" /></div>
           <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?u=3" className="grayscale w-full h-full object-cover" /></div>
           <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?u=4" className="grayscale w-full h-full object-cover" /></div>
           <button className="text-[#A09FB1] hover:text-[#1F1D2C] ml-2"><ChevronLeft className="w-5 h-5 rotate-180" /></button>
        </div>

        <div>
           <p className="text-[#A09FB1] text-[12px] font-medium mb-3 tracking-wide">Card number</p>
           <div className="bg-white rounded-xl py-4 px-5 border border-[#F4F4F6] shadow-sm flex justify-between items-center">
             <span className="font-semibold text-[#1F1D2C] tracking-widest text-sm font-mono">4143 4567 6788 7689</span>
             <span className="text-[#A09FB1] font-black italic tracking-tighter uppercase text-xs">Visa</span>
           </div>
        </div>
      </div>
    </div>
  )
}
