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
    <div className="py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="space-y-1">
          <h1 className="text-[28px] font-[380] text-foreground tracking-tight leading-none">
            Portfolio Management
          </h1>
          <p className="text-[15px] font-[400] text-muted-foreground">
            Parent-level oversight of all managed physical assets
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Actions placeholder if needed */}
        </div>
      </div>

      <PropertyDashboardClient initialProperties={properties} />
    </div>
  )
}
