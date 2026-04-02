'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { MaintenanceStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createUnit(data: { unitNumber: string, type: string, category: string, propertyId: string }) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      const unit = await prisma.unit.create({
        data: {
          unitNumber: data.unitNumber,
          type: data.type,
          category: data.category,
          propertyId: data.propertyId,
          maintenanceStatus: 'OPERATIONAL'
        }
      });
      revalidatePath(`/properties/${data.propertyId}`);
      return { success: true, data: unit };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function updateUnitStatus(unitId: string, status: MaintenanceStatus) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      if (status === 'DECOMMISSIONED') {
        const activeLeases = await prisma.lease.count({
          where: { unitId, isActive: true }
        });
        if (activeLeases > 0) {
          return { 
            success: false, 
            message: `Protocol Breach: Unit cannot be DECOMMISSIONED while ${activeLeases} active lease(s) exist. Force eviction/move-out first.`,
            errorCode: "STATE_CONFLICT" 
          };
        }
      }

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
