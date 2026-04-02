'use server'

import prisma from '@/lib/prisma'

export async function getAvailableUnits() {
  const units = await prisma.unit.findMany({
    where: {
      maintenanceStatus: 'OPERATIONAL',
      leases: {
        none: {
          isActive: true
        }
      }
    },
    include: {
      property: true
    }
  });
  return units;
}
