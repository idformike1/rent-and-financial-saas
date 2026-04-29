export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-[var(--color-surface-elevated)]">
      <div className="h-full rounded-full bg-[var(--color-brand)] transition-all" style={{ width: `${value}%` }} />
    </div>
  )
}
