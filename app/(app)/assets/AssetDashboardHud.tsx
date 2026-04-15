'use client';

interface AssetDashboardHudProps {
  stats: {
    totalAssets: number;
    totalCapacity: number;
    blendedOccupancy: number;
    netCollectedIncome: number;
  }
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function AssetDashboardHud({ stats }: AssetDashboardHudProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 border-b border-[#1F2937] pb-6 mb-8 bg-transparent">
      
      {/* 1. TOTAL ASSETS */}
      <div className="flex flex-col gap-2 px-4 border-r border-[#1F2937]">
        <span className="text-[13px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          Total Assets
        </span>
        <span className="font-mono text-[18px] text-[#F9FAFB] tabular-nums">
          {stats.totalAssets.toString().padStart(2, '0')}
        </span>
      </div>

      {/* 2. CAPACITY */}
      <div className="flex flex-col gap-2 px-4 border-r border-[#1F2937]">
        <span className="text-[13px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          Capacity (Units)
        </span>
        <span className="font-mono text-[18px] text-[#F9FAFB] tabular-nums">
          {stats.totalCapacity.toString().padStart(3, '0')}
        </span>
      </div>

      {/* 3. BLENDED OCCUPANCY */}
      <div className="flex flex-col gap-2 px-4 border-r border-[#1F2937]">
        <span className="text-[13px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          Blended Occupancy %
        </span>
        <span className="font-mono text-[18px] text-[#F9FAFB] tabular-nums">
          {stats.blendedOccupancy.toFixed(1)}%
        </span>
      </div>

      {/* 4. NET COLLECTED INCOME */}
      <div className="flex flex-col gap-2 px-4">
        <span className="text-[13px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          Net Collected Income
        </span>
        <span className="font-mono text-[18px] text-[#F9FAFB] tabular-nums">
          {formatter.format(stats.netCollectedIncome)}
        </span>
      </div>

    </div>
  );
}
