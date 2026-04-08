import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Insights | Axiom Finova",
  description: "Overview of your financial health.",
};

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#090A0E] text-white p-8">
      
      {/* ── TASK 1: THE METRIC HEADER ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-6 sm:gap-14 mb-10 pb-8 border-b border-[#2D2E39]">
        <div className="space-y-1">
          <p className="text-[13px] uppercase tracking-wider text-[#9D9DA8] font-medium mb-2">Net cashflow</p>
          <p className="text-4xl md:text-5xl font-semibold text-white tracking-tight">-$4,436.34</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-[#9D9DA8] font-medium mb-1">Money in</p>
          <p className="text-xl md:text-2xl font-medium text-[#6CC08F]">+$54,436.54</p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-[#9D9DA8] font-medium mb-1">Money out</p>
          <p className="text-xl md:text-2xl font-medium text-white">-$0.00</p>
        </div>
      </div>

      {/* ── TASK 2 & 3: THE TELEPORTING GRID & PLACEHOLDERS ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        
        {/* Narrative Text Block Column (Teleports Right -> Bottom) */}
        <div className="order-2 lg:order-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
          <div className="bg-[#1E1E2A] border border-[#2D2E39] rounded-lg p-6 min-h-[160px] shadow-sm flex flex-col justify-start">
            <p className="text-sm text-white mb-3 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↘</span> Runway
            </p>
            <div className="w-full h-3 bg-[#2D2E39]/50 rounded-full mb-3"></div>
            <div className="w-4/5 h-3 bg-[#2D2E39]/50 rounded-full mb-3"></div>
            <div className="w-1/2 h-3 bg-[#2D2E39]/50 rounded-full"></div>
          </div>

          <div className="bg-[#1E1E2A] border border-[#2D2E39] rounded-lg p-6 min-h-[160px] shadow-sm flex flex-col justify-start">
            <p className="text-sm text-white mb-3 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↗</span> Money out trends
            </p>
            <div className="w-11/12 h-3 bg-[#2D2E39]/50 rounded-full mb-3"></div>
            <div className="w-full h-3 bg-[#2D2E39]/50 rounded-full mb-3"></div>
            <div className="w-2/3 h-3 bg-[#2D2E39]/50 rounded-full"></div>
          </div>

          <div className="bg-[#1E1E2A] border border-[#2D2E39] rounded-lg p-6 min-h-[160px] shadow-sm flex flex-col justify-start">
            <p className="text-sm text-white mb-3 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">*</span> Money in trends
            </p>
            <div className="w-full h-3 bg-[#2D2E39]/50 rounded-full mb-3"></div>
            <div className="w-3/4 h-3 bg-[#2D2E39]/50 rounded-full mb-3"></div>
            <div className="w-1/3 h-3 bg-[#2D2E39]/50 rounded-full"></div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="order-1 lg:order-2 bg-[#1E1E2A] border border-[#2D2E39] rounded-lg lg:h-auto md:h-[450px] h-[350px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle grid background to simulate Mercury workstation */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #6C6C8F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="z-10 flex flex-col items-center gap-3">
             <p className="text-[#9D9DA8] font-medium tracking-[0.2em] text-xs uppercase animate-pulse">Visualization Canvas Ready</p>
             <p className="text-[#9D9DA8]/50 text-[10px] font-mono">awaiting bespoke node/line component injection</p>
          </div>
        </div>

      </div>
    </div>
  );
}
