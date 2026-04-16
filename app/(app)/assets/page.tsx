import { getCurrentSession } from '@/lib/auth-utils'
import { redirect } from 'next/navigation'
import { getPortfolioSummaryService } from '@/src/services/queries/assets.services'
import AssetDashboardHud from './AssetDashboardHud'
import AssetLedgerTable from './AssetLedgerTable'

/**
 * ASSET COMMAND CENTER
 * 
 * High-performance workstation for portfolio-level asset surveillance.
 * Implements the Axiom 2026 design system with clinical data density.
 */

export default async function AssetsPage() {
  const session = await getCurrentSession();
  if (!session) redirect('/login');

  const summary = await getPortfolioSummaryService({
    operatorId: session.userId,
    organizationId: session.organizationId
  });

  return (
    <div className="animate-in fade-in duration-700">
      
      {/* ── HEADER STRATUM ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 px-1">
        <div className="space-y-2">
          <h1 className="text-[28px] leading-[36px] font-[400] text-white tracking-tight font-sans">
            Asset Command Center
          </h1>
          <p className="text-[13px] font-bold text-white/40 uppercase tracking-[0.2em] font-sans">
            Domain: Unified Asset Portfolio — Surveillance Tier 1
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 border border-[#1F2937] bg-[#1A1A24] text-[11px] font-bold text-white/60 tracking-widest uppercase">
            Data Refresh: Nominal
          </div>
        </div>
      </div>

      {/* ── TELEMETRY HUD ─────────────────────────────────────────────────── */}
      <AssetDashboardHud stats={{
        totalAssets: summary.totalAssets,
        totalCapacity: summary.totalCapacity,
        blendedOccupancy: summary.blendedOccupancy,
        netCollectedIncome: summary.netCollectedIncome
      }} />

      {/* ── MASTER LEDGER ───────────────────────────────────────────────────── */}
      <div className="mt-12 bg-[#171721] border border-[#1F2937] rounded-[4px] overflow-hidden ">
        <div className="px-6 py-4 bg-[#1A1A24] border-b border-[#1F2937] flex items-center justify-between">
           <h3 className="text-[12px] font-bold text-[#E5E7EB] uppercase tracking-[0.1em]">Hierarchical Asset Ledger</h3>
           <span className="text-[10px] font-bold text-[#9CA3AF] opacity-40 uppercase tabular-nums tracking-widest">
             Records: {summary.properties.reduce((sum, p) => sum + p.units.length + 1, 0)} Rows Materialized
           </span>
        </div>
        <AssetLedgerTable properties={summary.properties} />
      </div>

    </div>
  );
}
