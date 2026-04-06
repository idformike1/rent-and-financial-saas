'use server'

import { runSecureServerAction } from "@/lib/auth-utils"
import { getDetailedOntologyService } from "@/src/services/queries/dashboard.services"

/**
 * DETAILED ONTOLOGY SCRAPER (GATEKEEPER)
 */
export async function fetchDetailedOntology() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const root = await getDetailedOntologyService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });

      return { root };
    } catch (e: any) {
      console.error('[ONTOLOGY_ACTION_FATAL]', e);
      throw e;
    }
  });
}
