'use server'

import prisma from '@/lib/prisma'

export async function getAvailableUnits() {
  const units = await prisma.unit.findMany({
    where: {
      maintenanceStatus: 'OPERATIONAL'
      // Ideally check if occupied by looking at active leases, but keeping it simple for now.
    }
  });
  return units;
}
