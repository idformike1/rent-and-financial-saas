import { Card } from "./Card"

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full border-collapse">{children}</table>
    </Card>
  )
}
