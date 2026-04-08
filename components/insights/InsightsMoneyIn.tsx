'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#161821] border border-white/[0.08] shadow-2xl p-3 rounded-lg flex flex-col gap-1 z-50">
        <p className="text-[11px] text-[#9D9DA8] uppercase tracking-widest">{label}</p>
        <p className="text-[15px] text-white font-[400] font-finance">
          +${Math.abs(payload[0].value).toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function InsightsMoneyIn({ data }: { data: any[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [subTab, setSubTab] = useState('Source');
  const primaryColor = '#5C61E6'; // Mercury Indigo

  // --- Analytical Calculations ---
  const { total, average } = React.useMemo(() => {
    const sum = data.reduce((acc, curr) => acc + curr.moneyIn, 0);
    const avg = data.length > 0 ? sum / data.length : 0;
    return { total: sum, average: avg };
  }, [data]);

  const mockTableData = [
    { name: 'Stripe Payments', percent: 45.2, amount: 471800.00 },
    { name: 'Shopify Payouts', percent: 25.5, amount: 266169.51 },
    { name: 'Wire Transfers', percent: 15.3, amount: 159701.71 },
    { name: 'Check Deposits', percent: 10.0, amount: 104380.20 },
    { name: 'Other Income', percent: 4.0, amount: 41750.58 },
  ];

  const subTabs = ['Source', 'Category', 'GL Code'];

  return (
    <div className="flex flex-col gap-10">
      
      {/* ── HERO METRICS ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-12 mb-0 border-b border-[#2D2E39]/50 pb-8 px-4">
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Total money in</p>
          <p className="text-[36px] font-semibold text-white tracking-tight font-arcadia leading-none">
            +${total.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] text-white/60 font-medium">Monthly average</p>
          <p className="text-[36px] font-semibold text-white tracking-tight font-arcadia leading-none uppercase">
            +${average.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
        </div>
      </div>

      <div className="w-full h-[320px] min-h-[300px] p-4 relative z-20">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#8a8b94', fontSize: 12 }}
              dy={10}
            />
            <YAxis hide={true} />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
            />
            <Bar
              dataKey="moneyIn"
              radius={[4, 4, 0, 0]}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={primaryColor}
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.3}
                  className="transition-all duration-300"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* --- TASK 1: SUB-NAVIGATION STRATUM --- */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center p-1 bg-white/[0.02] border border-white/[0.05] rounded-lg w-fit ml-4">
          {subTabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setSubTab(tab)}
              className={`text-[12px] px-3 py-1 rounded-md cursor-pointer transition-all font-medium ${
                subTab === tab ? "bg-[#2D2E39] text-white shadow-sm" : "text-[#8A8B94] hover:text-white"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* --- TASK 2 & 3: ANALYTICAL TABLE --- */}
        <div className="px-4 pb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="text-left text-[12px] text-[#8A8B94] uppercase tracking-wider font-medium pb-3 w-1/3">Name</th>
                <th className="text-left text-[12px] text-[#8A8B94] uppercase tracking-wider font-medium pb-3 w-1/3">% of total</th>
                <th className="text-right text-[12px] text-[#8A8B94] uppercase tracking-wider font-medium pb-3 w-1/3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockTableData.map((row) => (
                <tr key={row.name} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                  <td className="py-4 text-[14px] text-white font-medium">{row.name}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-[4px] w-[100px] bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${row.percent}%`, backgroundColor: primaryColor }}
                        />
                      </div>
                      <span className="text-[13px] text-[#8A8B94] font-mono">{row.percent}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-right text-[14px] text-white font-mono">
                    ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
