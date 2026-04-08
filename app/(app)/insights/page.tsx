import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LedgerChart from "@/components/insights/LedgerChart";
import prisma from "@/lib/prisma";
import { 
  generateRunwayNarrative, 
  generateIncomeNarrative, 
  generateOutflowNarrative 
} from "./semanticGenerator";

export const metadata = {
  title: "Insights | Axiom Finova",
  description: "Overview of your financial health.",
};

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const organizationId = (session.user as any).organizationId;

  // --- Secure Data Pipeline ---
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { organizationId },
    include: { account: true, expenseCategory: true },
    orderBy: { transactionDate: 'asc' }
  });

  // Serialize Decimal -> Number to prevent Client Component hydration errors
  const sanitizedEntries = ledgerEntries.map((e: any) => ({
    ...e,
    amount: Number(e.amount)
  }));

  let totalIncome = 0;
  let totalExpense = 0;
  let totalAssets = 0;

  sanitizedEntries.forEach((e: any) => {
    if (e.account?.category === "INCOME") totalIncome += e.amount;
    if (e.account?.category === "EXPENSE") totalExpense += e.amount;
    if (e.account?.category === "ASSET") totalAssets += e.amount;
  });

  const netCashflow = totalIncome - totalExpense;

  // Generate Array for LedgerChart (Grouped by month, simulating a daily/monthly series)
  const chartDataMap: Record<string, { income: number, expense: number }> = {};
  
  sanitizedEntries.forEach((e: any) => {
    // Format to "Jan 25" style
    const month = new Date(e.transactionDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!chartDataMap[month]) chartDataMap[month] = { income: 0, expense: 0 };
    
    if (e.account?.category === "INCOME") chartDataMap[month].income += e.amount;
    if (e.account?.category === "EXPENSE") chartDataMap[month].expense += e.amount;
  });

  const chartData = Object.entries(chartDataMap).map(([month, data]) => ({
    date: month,
    netCashflow: data.income - data.expense,
    moneyIn: data.income,
    moneyOut: -data.expense
  }));

  // Ensure there's at least one data point to render the chart grid
  if (chartData.length === 0) {
     chartData.push({ date: 'Today', netCashflow: 0, moneyIn: 0, moneyOut: 0 });
  }

  // Simplified burn rate for demonstration (total expenses / months active)
  const activeMonths = chartData.length > 0 ? chartData.length : 1;
  const burnRate = totalExpense / activeMonths;

  // --- Semantic Engine Generators ---
  const runwayNode = generateRunwayNarrative(burnRate, totalAssets);
  const incomeNode = generateIncomeNarrative(totalIncome, sanitizedEntries);
  const outflowNode = generateOutflowNarrative(totalExpense, sanitizedEntries);

  return (
    <div className="min-h-screen bg-[#090A0E] text-white p-8">
      
      {/* ── TASK 1: THE METRIC HEADER ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-baseline gap-6 sm:gap-14 mb-10 pb-8 border-b border-[#2D2E39]">
        <div className="space-y-1">
          <p className="text-[13px] uppercase tracking-wider text-[#9D9DA8] font-medium mb-2">Net cashflow</p>
          <p className="text-4xl md:text-5xl font-semibold text-white tracking-tight">
            {netCashflow < 0 ? '−' : ''}${Math.abs(netCashflow).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-[#9D9DA8] font-medium mb-1">Money in</p>
          <p className="text-xl md:text-2xl font-medium text-[#6CC08F]">
            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-[#9D9DA8] font-medium mb-1">Money out</p>
          <p className="text-xl md:text-2xl font-medium text-white">
            −${Math.abs(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* ── TASK 2: THE TELEPORTING GRID ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
        
        {/* Narrative Text Block Column (Teleports Right -> Bottom) */}
        <div className="order-2 lg:order-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6">
          <div className="bg-[#1E1E2A] border border-[#2D2E39] rounded-lg p-6 min-h-[160px] shadow-sm flex flex-col justify-start">
            <p className="text-sm text-white mb-3 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↘</span> Runway
            </p>
            <div className="text-[14px] text-[#DDE1E5] leading-relaxed">
              {runwayNode}
            </div>
          </div>

          <div className="bg-[#1E1E2A] border border-[#2D2E39] rounded-lg p-6 min-h-[160px] shadow-sm flex flex-col justify-start">
            <p className="text-sm text-white mb-3 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↗</span> Money out trends
            </p>
            <div className="text-[14px] text-[#DDE1E5] leading-relaxed">
              {outflowNode}
            </div>
          </div>

          <div className="bg-[#1E1E2A] border border-[#2D2E39] rounded-lg p-6 min-h-[160px] shadow-sm flex flex-col justify-start">
            <p className="text-sm text-white mb-3 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">*</span> Money in trends
            </p>
            <div className="text-[14px] text-[#DDE1E5] leading-relaxed">
              {incomeNode}
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="order-1 lg:order-2 bg-[#1E1E2A] border border-[#2D2E39] rounded-lg lg:h-[450px] md:h-[450px] h-[350px] flex items-center justify-center relative overflow-hidden shadow-lg">
          {/* Subtle grid background to simulate Mercury workstation */}
          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at center, #8a8b94 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="absolute inset-0 bg-gradient-radial from-[#6C6C8F]/10 to-transparent opacity-50 blur-2xl"></div>
          
          <LedgerChart data={chartData} />
        </div>

      </div>
    </div>
  );
}
