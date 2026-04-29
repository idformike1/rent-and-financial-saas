import { Card } from "../system/Card"
import { MetricBlock } from "../system/MetricBlock"

export function KPISection() {
  return (
    <Card className="flex justify-between">
      <div className="flex gap-10">
        <MetricBlock label="Net Operating Income" value="$0" />
        <MetricBlock label="Gross Potential Rent" value="$0" />
      </div>
      <div className="flex gap-10">
        <MetricBlock label="Revenue Leakage" value="36.04%" trend="↓ 4.2%" status="negative" />
        <MetricBlock label="Collection Ratio" value="0.21%" status="negative" />
      </div>
    </Card>
  )
}
