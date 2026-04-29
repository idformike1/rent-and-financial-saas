import React from 'react';
import { cn } from "@/lib/utils";

interface DashboardKPIProps {
  title: string;
  value: number;
  type: 'currency' | 'percentage';
  trend?: string;
  alert?: boolean;
}

/**
 * DASHBOARD KPI CARD (AXIOM CLINICAL LUXURY)
 * 
 * A high-density analytical component designed for executive monitoring.
 * Aesthetic: Monochromatic, monochromatic translucent borders, and monospaced numerical data.
 */
const DashboardKPI: React.FC<DashboardKPIProps> = ({ 
  title, 
  value, 
  type, 
  trend, 
  alert 
}) => {
  const formattedValue = type === 'currency' 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    : `${value.toFixed(2)}%`;

  return (
    <div className={cn(
      "relative group overflow-hidden rounded-lg border p-5 transition-all duration-300",
      "bg-zinc-950/50 backdrop-blur-sm",
      alert 
        ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
        : "border-white/5 hover:border-white/10"
    )}>
      {/* Decorative Corner Accent */}
      <div className={cn(
        "absolute top-0 right-0 h-16 w-16 opacity-10 transition-opacity group-hover:opacity-20",
        alert ? "bg-red-500 blur-2xl" : "bg-emerald-500 blur-2xl"
      )} />

      <div className="flex flex-col space-y-1">
        <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          {title}
        </h3>
        
        <div className="flex items-baseline space-x-2">
          <span className={cn(
            "font-mono text-3xl font-bold tracking-tight",
            alert ? "text-red-400" : "text-zinc-100"
          )}>
            {formattedValue}
          </span>
          
          {trend && (
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
              alert 
                ? "border-red-500/20 text-red-500 bg-red-500/10" 
                : "border-emerald-500/20 text-emerald-500 bg-emerald-500/10"
            )}>
              {trend}
            </span>
          )}
        </div>
      </div>

      {/* Forensic Border Flare */}
      <div className={cn(
        "absolute bottom-0 left-0 h-[2px] transition-all duration-500 group-hover:w-full",
        alert ? "w-1/3 bg-red-500" : "w-0 bg-white/20"
      )} />
    </div>
  );
};

export default DashboardKPI;
