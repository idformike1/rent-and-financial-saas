'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { waiveChargeService } from '@/src/services/mutations/ledger.services'
import { revalidatePath } from 'next/cache'

/**
 * WAIVE CHARGE ACTION (GATEKEEPER)
 */
export async function waiveCharge(chargeId: string, reasonText: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // 1. Governance Verification
      if (!reasonText || reasonText.length < 10) {
        return { success: false, message: "ERR_PROTOCOL_VIOLATION: Waive-off justification must be at least 10 chars." };
      }

      // 2. Delegation to Sovereign Service Layer
      const result = await waiveChargeService(
        chargeId,
        reasonText,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      // 3. UI Synchronization
      revalidatePath(`/tenants`);

      return { 
        success: true, 
        message: `Charge waived successfully. Fiscal impact: $${result.waived.toFixed(2)}`,
        data: result 
      };

    } catch (e: any) {
      console.error('[CREDIT_WAIVE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
