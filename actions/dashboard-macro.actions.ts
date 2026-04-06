'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { getGlobalPortfolioTelemetryService } from '@/src/services/queries/dashboard.services'

/**
 * GLOBAL PORTFOLIO TELEMETRY (GATEKEEPER)
 */
export async function getGlobalPortfolioTelemetry() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await getGlobalPortfolioTelemetryService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      
      return { success: true, data: result };
    } catch (e: any) {
      console.error('[MACRO_ACTION_ERROR]', e);
      return { 
        success: false, 
        message: e.message || "System Reconciliation Failure" 
      };
    }
  });
}
