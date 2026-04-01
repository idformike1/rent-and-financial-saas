'use client'

import {
  Activity,
  Home,
  Calendar,
  Briefcase,
  PlayCircle,
  BarChart2,
  Settings,
  HelpCircle,
  LogOut,
  Orbit
} from 'lucide-react'

export function Sidebar() {
  const navItems = [
    { name: 'Activity', icon: Activity, isActive: true, badge: '5' },
    { name: 'Home', icon: Home },
    { name: 'Schedule', icon: Calendar },
    { name: 'Courses', icon: Briefcase },
    { name: 'Videos', icon: PlayCircle },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Settings', icon: Settings },
  ]

  return (
    <aside className="w-[260px] h-full bg-[#1A1822] text-[#868494] flex flex-col pt-12 pb-10 flex-shrink-0 relative overflow-hidden rounded-l-[32px]">
      <div className="flex flex-col items-center mb-12">
        {/* Abstract Logo */}
        <div className="w-10 h-10 border-[3px] border-white rounded-full flex items-center justify-center relative mb-8 text-white">
           <Orbit className="w-6 h-6 absolute" />
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-4 w-full px-8">
           <div className="w-10 h-10 bg-slate-400 rounded-full overflow-hidden shrink-0">
             <img src="https://i.pravatar.cc/150?u=jeremy" alt="Avatar" className="w-full h-full object-cover grayscale" />
           </div>
           <div>
             <h3 className="text-white text-[15px] font-semibold leading-tight tracking-wide">Jeremy Toe</h3>
             <p className="text-[#868494] text-[11px] font-medium tracking-wider">Administrator</p>
           </div>
        </div>
      </div>

      <nav className="flex-1 w-full flex flex-col space-y-2 px-6">
        {navItems.map((item) => (
          <button
             key={item.name}
             className={`flex justify-between items-center w-full px-5 py-4 rounded-xl transition-all duration-300 ${
               item.isActive ? 'bg-[#2B2936] text-white' : 'hover:bg-[#201E2A] hover:text-[#C5C3D2]'
             }`}
          >
             <div className="flex items-center space-x-5">
               <item.icon className="w-[18px] h-[18px]" strokeWidth={2.5} />
               <span className="font-semibold text-[13px] tracking-wide">{item.name}</span>
             </div>
             {item.badge && (
               <span className="bg-white text-[#1A1822] text-[10px] font-black px-2 py-0.5 rounded-full">
                 {item.badge}
               </span>
             )}
          </button>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-6 flex flex-col space-y-2 mt-auto">
        <button className="flex items-center space-x-5 w-full px-5 py-4 rounded-xl hover:bg-[#201E2A] hover:text-[#C5C3D2] transition-colors">
          <HelpCircle className="w-[18px] h-[18px]" strokeWidth={2.5} />
          <span className="font-semibold text-[13px] tracking-wide">Support</span>
        </button>
        <button className="flex items-center space-x-5 w-full px-5 py-4 rounded-xl hover:bg-[#201E2A] hover:text-[#C5C3D2] transition-colors">
          <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
          <span className="font-semibold text-[13px] tracking-wide">Log Out</span>
        </button>
      </div>
    </aside>
  )
}
