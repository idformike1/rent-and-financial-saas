'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

/**
 * Autonomous Ledger Protocol: Monthly Charge Batch Generation
 * 1. Queries all Active Leases.
 * 2. Filters out leases where the associated Unit is DECOMMISSIONED.
 * 3. Checks if a RENT charge already exists for the target period.
 * 4. Generates a new RENT charge for each qualifying lease.
 */
export async function runMonthlyBillingCycle(targetDate: string) {
  return runSecureServerAction('MANAGER', async () => {
    try {
      const targetMonth = new Date(targetDate);
      const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

      // Fetch all active leases with their units
      const activeLeases = await prisma.lease.findMany({
        where: { isActive: true },
        include: { unit: true }
      });

      let count = 0;
      let skipped = 0;

      for (const lease of activeLeases) {
        // Maintenance Status Block: DECOMMISSIONED units are skipped for billing
        if (lease.unit.maintenanceStatus === 'DECOMMISSIONED') {
          skipped++;
          continue;
        }

        // Check for duplicate charges in the target month
        const existingCharge = await prisma.charge.findFirst({
          where: {
            leaseId: lease.id,
            type: 'RENT',
            dueDate: { gte: startOfMonth, lte: endOfMonth }
          }
        });

        if (!existingCharge) {
          await prisma.charge.create({
            data: {
              tenantId: lease.tenantId,
              leaseId: lease.id,
              type: 'RENT',
              amount: lease.rentAmount,
              dueDate: startOfMonth,
              isFullyPaid: false
            }
          });
          count++;
        }
      }

      revalidatePath('/reports/master-ledger');
      revalidatePath('/tenants');
      return { 
        success: true, 
        message: `Billing Cycle Complete: ${count} charges generated, ${skipped} decommissioned units bypassed.` 
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
