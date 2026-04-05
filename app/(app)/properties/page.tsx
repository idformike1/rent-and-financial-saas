import prisma from '@/lib/prisma'
import PropertyDashboardClient from './PropertyDashboardClient'

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({
    include: {
      _count: {
        select: { units: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="py-8 px-4 sm:px-6 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-border pb-10">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Portfolio Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Parent-level oversight of all managed physical assets.</p>
        </div>
      </div>

      <PropertyDashboardClient initialProperties={properties} />
    </div>
  )
}
