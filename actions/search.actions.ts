'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { deepScanSystemService } from '@/src/services/queries/search.services'

/**
 * DEEP SCAN GATEKEEPER
 */
export async function deepScanSystem(query: string) {
  if (!query || query.length < 2) return { success: true, data: [] };

  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const results = await deepScanSystemService(
        query,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      return { success: true, data: results };
    } catch (error: any) {
      console.error('[SEARCH_DEEP_SCAN_FATAL]', error);
      return { success: false, error: 'Quantum Search Failure' };
    }
  });
}
