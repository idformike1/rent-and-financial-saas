'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function updateTenantDetails(tenantId: string, data: { name: string }) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { name: data.name }
      });
      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      return { success: true, data: tenant };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

/**
 * End Lease / Move-Out Protocol
 * 1. Mark current lease as inactive.
 * 2. Void all future charges (optional) or just mark the unit as OPERATIONAL/vacant.
 * 3. Flip Unit status to OPERATIONAL.
 */
export async function processMoveOut(tenantId: string, leaseId: string, unitId: string) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      await prisma.$transaction([
        // Deactivate Lease
        prisma.lease.update({
          where: { id: leaseId },
          data: { isActive: false, endDate: new Date() }
        }),
        // Reset Unit Occupancy State
        prisma.unit.update({
          where: { id: unitId },
          data: { maintenanceStatus: 'OPERATIONAL' }
        }),
        // Clear remaining unpaid charges (optional cleanup per user req "clear active charges")
        prisma.charge.deleteMany({
           where: { tenantId, leaseId, isFullyPaid: false }
        })
      ]);
      
      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      revalidatePath('/properties');
      return { success: true, message: "Move-out protocol executed successfully." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
