'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { MaintenanceStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createUnit(data: { unitNumber: string, type: string, propertyId: string }) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      const unit = await prisma.unit.create({
        data: {
          unitNumber: data.unitNumber,
          type: data.type,
          propertyId: data.propertyId,
          maintenanceStatus: 'OPERATIONAL'
        }
      });
      revalidatePath('/properties');
      return { success: true, data: unit };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function updateUnitStatus(unitId: string, status: MaintenanceStatus) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      const unit = await prisma.unit.update({
        where: { id: unitId },
        data: { maintenanceStatus: status }
      });
      revalidatePath('/properties');
      return { success: true, data: unit };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
