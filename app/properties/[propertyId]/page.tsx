import prisma from '@/lib/prisma'
import UnitManagementClient from './UnitManagementClient'
import Link from 'next/link'
import { ChevronLeft, Building2 } from 'lucide-react'

export default async function PropertyUnitsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  
  const property = await prisma.property.findUnique({
    where: { id: propertyId }
  });

  if (!property) return <div className="p-10 text-xl font-bold bg-white text-red-500 border-2 border-red-500 rounded-3xl">INVALID_RESOURCE: PROPERTY_ID_NOT_FOUND</div>

  const units = await prisma.unit.findMany({
    where: { propertyId },
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
    category: u.category,
    maintenanceStatus: u.maintenanceStatus,
    activeTenant: u.leases[0]?.tenant.name || null,
    isOccupied: u.leases.length > 0
  }));

  return (
    <div className="py-8 px-4 sm:px-6 h-full flex flex-col max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-slate-100 pb-10">
        <div>
          <Link href="/properties" className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mb-4 group">
            <ChevronLeft className="w-3 h-3 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Portfolio
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <Building2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-black italic tracking-tighter text-slate-900 uppercase">{property.name}</h1>
          </div>
          <p className="text-slate-500 font-medium tracking-tight">Managing {units.length} structural assets at {property.address}.</p>
        </div>
      </div>

      <UnitManagementClient 
        initialUnits={unitsWithOccupancy} 
        propertyId={propertyId} 
      />
    </div>
  )
}
