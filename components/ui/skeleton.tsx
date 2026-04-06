import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50 dark:bg-[var(--primary)]/10 text-[var(--primary)]/10 border border-white/5", className)}
      {...props}
    />
  )
}

export { Skeleton }
