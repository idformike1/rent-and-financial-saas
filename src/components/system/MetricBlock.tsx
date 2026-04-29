import { cn } from "@/lib/utils"

export function MetricBlock({ label, value, trend, status }: { label: string, value: string, trend?: string, status?: 'positive' | 'negative' | 'warning' }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-label">{label}</span>
      <span className="text-value">{value}</span>
      {trend && (
        <span className={cn("text-xs", status === "positive" && "data-positive", status === "negative" && "data-negative", status === "warning" && "data-warning")}>
          {trend}
        </span>
      )}
    </div>
  )
}
