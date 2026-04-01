import prisma from '@/lib/prisma'
import PropertiesClient from './PropertiesClient'

export default async function PropertiesPage() {
  const units = await prisma.unit.findMany({
    include: {
      leases: {
        where: { isActive: true },
        include: { tenant: true }
      }
    },
    orderBy: { unitNumber: 'asc' }
  });

  // Map to flat structure for the client component
  const unitsWithOccupancy = units.map(u => ({
    id: u.id,
    unitNumber: u.unitNumber,
    type: u.type,
    maintenanceStatus: u.maintenanceStatus,
    activeTenant: u.leases[0]?.tenant.name || null,
    isOccupied: u.leases.length > 0
  }));

  return (
    <div className="py-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8 px-4 sm:px-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 italic">Structural Control Terminal</h1>
          <p className="text-slate-500 font-medium">Real-time unit maintenance registry & occupancy monitoring.</p>
        </div>
      </div>

      <PropertiesClient initialUnits={unitsWithOccupancy} />
    </div>
  )
}
