'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { 
  liquidateTenantDebtService, 
  getTenantForensicDossierService 
} from '@/src/services/mutations/tenant.services'

/**
 * DEBT LIQUIDATION PROTOCOL (FIFO)
 */
export async function liquidateTenantDebt(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await liquidateTenantDebtService(
        tenantId,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );
      
      revalidatePath(`/tenants/${tenantId}`);
      return { success: true, message: "FIFO_RECONCILIATION_SUCCESS", data: result };
    } catch (e: any) {
      console.error('[LIQUIDATE_DEBT_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * FORENSIC DOSSIER MATERIALIZATION
 */
export async function getTenantForensicDossier(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await getTenantForensicDossierService(
        tenantId,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      // Parity with legacy structure (Data Sanitization included in Service)
      return { 
        success: true, 
        data: JSON.parse(JSON.stringify(result)) 
      };

    } catch (e: any) {
      console.error('[FORENSIC_DOSSIER_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
