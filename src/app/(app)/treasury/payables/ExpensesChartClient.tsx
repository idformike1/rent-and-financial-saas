import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// Mercury chart palette — intentional semantic data-viz colours.
// Kept as explicit hex values because they represent DATA series, not UI chrome,
// and must remain consistent across both Light and Dark themes.
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function ExpensesChartClient({ data }: { data: any[] }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center border border-dashed border-border rounded-[var(--radius)]">
        <p className="text-[10px] font-bold text-muted-foreground ">No Data Nodes Found</p>
      </div>
    );
  }

  if (!mounted) return null;

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} debounce={50}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={2} stroke="var(--card)" />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)', 
            borderRadius: '8px',
            fontSize: '11px',
            color: 'var(--foreground)',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }} 
          itemStyle={{ color: 'var(--foreground)', fontWeight: 700 }}
          cursor={false} 
        />
        <Legend 
            verticalAlign="bottom" 
            height={36} 
            formatter={(value) => <span className="text-[10px] font-bold  text-muted-foreground ml-2">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
