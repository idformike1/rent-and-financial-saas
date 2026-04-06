'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { executeRevenueSyncService } from '@/src/services/mutations/system.services'

/**
 * SYSTEM INFRASTRUCTURE: REVENUE SYNCHRONIZATION (GATEKEEPER)
 */
export async function executeRevenueSyncFix() {
  return runSecureServerAction('ADMIN', async (session) => {
    try {
      const result = await executeRevenueSyncService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });

      revalidatePath('/settings/categories');

      return { 
        success: true, 
        message: `Sync protocol complete. Refactored ${result.updatedCount} records. AXIOM engine should now reach revenue destination.`,
        data: { updated: result.updatedCount }
      };
    } catch (e: any) {
      console.error('[REVENUE_SYNC_FATAL]', e);
      return { success: false, message: `Sync Failed: ${e.message}` };
    }
  });
}
