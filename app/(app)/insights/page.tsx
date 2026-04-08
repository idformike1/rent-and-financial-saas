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

      {/* ── TASK 1: CONTROL STRATUM ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-6 border-b border-white/5 pb-1">
          <span className="text-[14px] text-white border-b-2 border-white pb-2 font-medium cursor-pointer tracking-wide">Overview</span>
          <span className="text-[14px] text-white/50 hover:text-white pb-2 font-medium cursor-pointer transition-colors tracking-wide">Money in</span>
          <span className="text-[14px] text-white/50 hover:text-white pb-2 font-medium cursor-pointer transition-colors tracking-wide">Money out</span>
        </div>
        <div className="flex gap-3">
          <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2 font-medium shadow-sm">
            <span>Dec 29 - Today</span>
            <span className="text-[10px]">▼</span>
          </button>
          <button className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-md text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-2 font-medium shadow-sm">
            <span>Compare to</span>
            <span className="text-[10px]">▼</span>
          </button>
        </div>
      </div>

      {/* ── TASK 2: HERO METRICS ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-12 mb-8 border-b border-[#2D2E39]/50 pb-8">
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Net cashflow</p>
          <p className="text-[40px] font-semibold text-white tracking-tight font-arcadia leading-none">
            {netCashflow < 0 ? '−' : ''}${Math.abs(netCashflow).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Money in</p>
          <p className="text-[36px] font-semibold text-white tracking-tight font-arcadia leading-none">
            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Money out</p>
          <p className="text-[36px] font-semibold text-white tracking-tight font-arcadia leading-none">
            −${Math.abs(totalExpense).toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      {/* ── TASK 3: THE MAIN WORKSTATION GRID ────────────────────────────── */}
      <div className="flex flex-col gap-10">

        {/* Main Chart Area (Top) - UNBOXED for Mercury Parity */}
        <div className="w-full h-[400px] relative overflow-hidden">
          {/* The subtle atmospheric glow stays, but the dotted grid is gone */}
          <div className="absolute inset-0 bg-gradient-radial from-[#6C6C8F]/10 to-transparent opacity-50 blur-2xl"></div>

          <LedgerChart data={chartData} />
        </div>

        {/* Narrative Text Block Row (Bottom, Flat layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-2">
          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[14px] text-white mb-2 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↘</span> Runway and cash position
            </p>
            <div className="text-[14px] text-[#A1A1AA] leading-relaxed">
              {runwayNode}
            </div>
          </div>

          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[14px] text-white mb-2 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">↗</span> Money out trends
            </p>
            <div className="text-[14px] text-[#A1A1AA] leading-relaxed">
              {outflowNode}
            </div>
          </div>

          <div className="bg-transparent flex flex-col justify-start">
            <p className="text-[14px] text-white mb-2 font-medium flex items-center gap-2">
              <span className="text-[#9D9DA8]">*</span> Money in trends
            </p>
            <div className="text-[14px] text-[#A1A1AA] leading-relaxed">
              {incomeNode}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
