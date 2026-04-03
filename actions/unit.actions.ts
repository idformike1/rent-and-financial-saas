'use server'

import prisma from '@/lib/prisma'

import { runSecureServerAction } from '@/lib/auth-utils'

export async function getAvailableUnits() {
  return runSecureServerAction('MANAGER', async (session) => {
    const units = await prisma.unit.findMany({
      where: {
        organizationId: session.organizationId,
        maintenanceStatus: 'OPERATIONAL',
        leases: {
          none: {
            isActive: true
          }
        }
      },
      include: {
        property: true
      },
      orderBy: {
        unitNumber: 'asc'
      }
    });
    return units;
  });
}
