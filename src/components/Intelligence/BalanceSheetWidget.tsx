import React from 'react';
import { getWorkspaceBalanceSheet } from '@/src/actions/intelligence.actions';

export default async function BalanceSheetWidget() {
    const response = await getWorkspaceBalanceSheet();

    if (!response.success || !response.data) {
        return (
            <div className="p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-center">
                <p className="text-white/40 text-sm">Waiting for fiscal telemetry data...</p>
            </div>
        );
    }

    const { assets, liabilities, summary } = response.data;
    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 0 
        }).format(val);

    const netWorthColor = summary.netWorth >= 0 ? 'text-emerald-400' : 'text-amber-500';
    const netWorthGlow = summary.netWorth >= 0 
        ? 'drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
        : 'drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]';

    return (
        <div className="p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
            {/* ── HERO METRIC ─────────────────────────────────────────────────── */}
            <div className="flex flex-col items-center justify-center mb-16 text-center">
                <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4">
                    Consolidated Net Worth
                </h3>
                <div className={`text-6xl md:text-7xl font-mono tracking-tighter ${netWorthColor} ${netWorthGlow} transition-all duration-700`}>
                    {formatCurrency(summary.netWorth)}
                </div>
            </div>

            {/* ── SPLIT LEDGER ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/5 pt-12">
                
                {/* ASSETS COLUMN */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <h4 className="text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest">Total Assets</h4>
                        <span className="text-xl font-mono text-emerald-400">{formatCurrency(summary.totalAssets)}</span>
                    </div>
                    <div className="space-y-3">
                        {assets.map((acc: any) => (
                            <div key={acc.id} className="flex justify-between items-center group">
                                <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">{acc.name}</span>
                                <span className="text-sm font-mono text-white/60">{formatCurrency(acc.balance)}</span>
                            </div>
                        ))}
                        {assets.length === 0 && <p className="text-xs text-white/20 italic">No asset nodes detected</p>}
                    </div>
                </div>

                {/* LIABILITIES COLUMN */}
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-white/5 pb-4">
                        <h4 className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest">Total Liabilities</h4>
                        <span className="text-xl font-mono text-amber-500">{formatCurrency(summary.totalLiabilities)}</span>
                    </div>
                    <div className="space-y-3">
                        {liabilities.map((acc: any) => (
                            <div key={acc.id} className="flex justify-between items-center group">
                                <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">{acc.name}</span>
                                <span className="text-sm font-mono text-white/60">{formatCurrency(acc.balance)}</span>
                            </div>
                        ))}
                        {liabilities.length === 0 && <p className="text-xs text-white/20 italic">No liability nodes detected</p>}
                    </div>
                </div>

            </div>

            {/* ── FOOTER TELEMETRY ────────────────────────────────────────────── */}
            <div className="mt-12 pt-6 border-t border-white/5 flex justify-center">
                <span className="text-[9px] text-white/10 uppercase font-mono tracking-[0.4em]">
                    Sovereign Intelligence Engine • Real-Time Synchronization
                </span>
            </div>
        </div>
    );
}
