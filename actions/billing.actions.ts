'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { calculateUtilityCharge, generateRentAccrual } from '@/src/services/billing.services'
import { prisma } from '@/lib/prisma'

/**
 * BILLING DOMAIN ACTIONS
 */

export async function generateUtilityAccrualAction(formData: FormData) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const leaseId = formData.get('leaseId') as string;
      const unitId = formData.get('unitId') as string;
      
      const electricStr = formData.get('electric') as string;
      const waterStr = formData.get('water') as string;
      const waiverStr = formData.get('waiver') as string;

      const electricReading = electricStr ? Number(electricStr) : null;
      const waterReading = waterStr ? Number(waterStr) : null;
      const waiverAmount = waiverStr ? Number(waiverStr) : 0;

      const charges: { type: string, amount: number }[] = [];

      // Add Base Rent dynamically
      const lease = await prisma.lease.findUnique({
        where: { id: leaseId, organizationId: session.organizationId }
      });
      if (!lease) throw new Error("ERR_LEASE_NOT_FOUND");
      
      let baseRent = Number(lease.rentAmount);
      if (waiverAmount > 0) {
        baseRent -= waiverAmount;
      }
      charges.push({ type: 'RENTAL', amount: baseRent });

      // Calculate Utilities
      if (electricReading !== null && !isNaN(electricReading)) {
        const electCharge = await calculateUtilityCharge(unitId, electricReading, 'ELECTRIC', session.organizationId);
        if (electCharge > 0) {
          charges.push({ type: 'ELECTRIC', amount: electCharge });
        }
      }

      if (waterReading !== null && !isNaN(waterReading)) {
        const waterCharge = await calculateUtilityCharge(unitId, waterReading, 'WATER', session.organizationId);
        if (waterCharge > 0) {
          charges.push({ type: 'WATER', amount: waterCharge });
        }
      }

      const tx = await generateRentAccrual(leaseId, new Date(), session.organizationId, charges);

      revalidatePath(`/tenants`);
      revalidatePath(`/reports/master-ledger`);
      
      return { 
        success: true, 
        message: "Utility calculations completed and ledger recorded.",
        transactionId: tx.id
      };
    } catch (e: any) {
      console.error('[BILLING_ACTION_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
