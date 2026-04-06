'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { runMonthlyBillingCycleService } from '@/src/services/mutations/billing.services'

/**
 * Autonomous Ledger Protocol: Monthly Charge Batch Generation
 * 
 * Gatekeeper for the Sovereign Billing Service.
 */
export async function runMonthlyBillingCycle(targetDate: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // 1. Delegation to Sovereign Service Layer
      const result = await runMonthlyBillingCycleService(
        targetDate,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      // 2. Global Path Synchronization
      revalidatePath('/reports/master-ledger');
      revalidatePath('/tenants');
      
      return { 
        success: true, 
        message: `Billing Cycle Complete: ${result.generated} charges generated, ${result.bypassed} decommissioned units bypassed.`,
        data: result
      };

    } catch (e: any) {
      console.error('[BILLING_CYCLE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
