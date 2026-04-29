export function SectionHeader({ title, right }: { title: string, right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-[var(--space-4)]">
      <h2 className="text-[var(--text-lg)] font-medium">{title}</h2>
      {right}
    </div>
  )
}
