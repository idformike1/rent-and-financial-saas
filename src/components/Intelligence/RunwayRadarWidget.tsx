import React from 'react';
import { getRunwayForecast } from '@/src/actions/intelligence.actions';

export default async function RunwayRadarWidget() {
    const response = await getRunwayForecast();

    if (!response.success || !response.data) {
        return null; // Silent fail if no data
    }

    const { monthlyBurnRate, runwayMonths, isProfitable, netCashFlow } = response.data;

    const formatCurrency = (val: number) => 
        new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD',
            maximumFractionDigits: 0 
        }).format(val);

    // Runway Styling Logic
    let runwayLabel = Math.floor(runwayMonths).toString();
    let runwayColor = 'text-white/80';
    let runwayGlow = '';

    if (runwayMonths >= 99) {
        runwayLabel = 'INFINITE';
        runwayColor = 'text-emerald-400';
        runwayGlow = 'drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]';
    } else if (runwayMonths >= 12) {
        runwayColor = 'text-emerald-400';
        runwayGlow = 'drop-shadow-[0_0_10px_rgba(52,211,153,0.2)]';
    } else if (runwayMonths < 6) {
        runwayColor = 'text-amber-500';
        runwayGlow = 'animate-pulse drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            
            {/* NODE 1: 30D BURN */}
            <div className="p-6 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl flex flex-col justify-between">
                <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">
                    Trailing 30D Burn
                </h4>
                <div>
                    <span className="text-2xl font-mono text-white/80">{formatCurrency(monthlyBurnRate)}</span>
                    <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Velocity Baseline</p>
                </div>
            </div>

            {/* NODE 2: LIQUID RUNWAY */}
            <div className="p-6 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl flex flex-col justify-between">
                <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">
                    Liquid Runway
                </h4>
                <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-mono ${runwayColor} ${runwayGlow} transition-all duration-700`}>
                        {runwayLabel}
                    </span>
                    {runwayLabel !== 'INFINITE' && (
                        <span className="text-[10px] text-white/20 uppercase tracking-widest">Months</span>
                    )}
                </div>
            </div>

            {/* NODE 3: CASH FLOW STATUS */}
            <div className="p-6 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-xl flex flex-col justify-between">
                <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">
                    Fiscal Standing
                </h4>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${isProfitable ? 'bg-emerald-400' : 'bg-amber-500'}`} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isProfitable ? 'text-emerald-400' : 'text-amber-500'}`}>
                            {isProfitable ? 'Surplus' : 'Deficit'}
                        </span>
                    </div>
                    <span className="text-2xl font-mono text-white/80">{formatCurrency(netCashFlow)}</span>
                </div>
            </div>

        </div>
    );
}
