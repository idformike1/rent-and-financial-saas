'use client';

import { InsightsDashboard } from "./index";

interface InsightsGridProps {
  entries: any[];
  telemetry: any;
}

export default function InsightsGrid({ entries, telemetry }: InsightsGridProps) {
  return (
    <InsightsDashboard 
      entries={entries}
      telemetry={telemetry}
      totalAssets={telemetry?.current?.revenue || 0} // Using revenue as proxy for dashboard context
    />
  );
}
