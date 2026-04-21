'use client';

import React from 'react';
import LedgerChart from '@/components/insights/LedgerChart';

interface VisualizerProps {
  filteredData: any[];
  chartType: 'area' | 'bar';
  activeTab: 'overview' | 'money-in' | 'money-out';
  semanticNodes: {
    runway: React.ReactNode;
    income: React.ReactNode;
    outflow: React.ReactNode;
  };
}

export function Visualizer({
  filteredData,
  chartType,
  activeTab,
  semanticNodes
}: VisualizerProps) {
  return (
    <div className="w-full">
      {/* Chart Area */}
      <div className="w-full h-[400px] relative overflow-hidden mb-10">
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent opacity-50 blur-2xl"></div>
        <LedgerChart data={filteredData} type={chartType} mode={activeTab} />
      </div>

      {/* Narrative Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-2 mb-16">
        <div className="bg-transparent flex flex-col justify-start">
          <p className="text-mercury-heading text-foreground mb-3 flex items-center gap-2">
            <span className="text-clinical-muted">〰</span> Runway and cash position
          </p>
          <div className="text-mercury-body text-foreground/90 h-[4.5em] overflow-hidden">{semanticNodes.runway}</div>
        </div>
        <div className="bg-transparent flex flex-col justify-start">
          <p className="text-mercury-heading text-foreground mb-3 flex items-center gap-2">
            <span className="text-destructive">▼</span> Money out trends
          </p>
          <div className="text-mercury-body text-foreground/90 h-[4.5em] overflow-hidden">{semanticNodes.outflow}</div>
        </div>
        <div className="bg-transparent flex flex-col justify-start">
          <p className="text-mercury-heading text-foreground mb-3 flex items-center gap-2">
             <span className="text-mercury-green">▲</span> Money in trends
          </p>
          <div className="text-mercury-body text-foreground/90 h-[4.5em] overflow-hidden">{semanticNodes.income}</div>
        </div>
      </div>
    </div>
  );
}
