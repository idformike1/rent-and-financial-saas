'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { getAvailableUnitsService } from '@/src/services/queries/unit.services'

/**
 * UNIT AVAILABILITY SCANNER (GATEKEEPER)
 */
export async function getAvailableUnits() {
  try {
    return await runSecureServerAction('MANAGER', async (session) => {
      const units = await getAvailableUnitsService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return JSON.parse(JSON.stringify(units || []));
    });
  } catch (e) {
    console.error('[GET_AVAILABLE_UNITS_FATAL]', e);
    return [];
  }
}
