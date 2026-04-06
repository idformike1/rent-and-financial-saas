'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { 
  processMoveOutService,
  updateTenantDetailsService,
  softDeleteTenantService,
  addAdditionalLeaseService
} from '@/src/services/mutations/tenant.services'

/**
 * TENANT LIFECYCLE ACTION: UPDATE BASIC DETAILS (GATEKEEPER)
 */
export async function updateTenantDetails(tenantId: string, data: { name: string, email?: string, phone?: string, nationalId?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenant = await updateTenantDetailsService(
        tenantId,
        data,
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );

      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      return { success: true, data: tenant };
    } catch (e: any) {
      console.error('[TENANT_UPDATE_FATAL]', e);
      return { success: false, message: e.message };
    }
  });
}

/**
 * Enterprise Protocol: Soft Delete Tenant (GATEKEEPER)
 */
export async function softDeleteTenant(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await softDeleteTenantService(
        tenantId,
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );
      revalidatePath('/tenants');
      return { success: true, message: "Tenant soft-deleted and leases archived." };
    } catch (e: any) {
      console.error('[TENANT_SOFT_DELETE_FATAL]', e);
      return { success: false, message: e.message };
    }
  });
}

/**
 * Add Additional Lease (GATEKEEPER)
 */
export async function addAdditionalLease(data: { 
  tenantId: string, 
  unitId: string, 
  rentAmount: number, 
  depositAmount: number,
  startDate: string 
}) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await addAdditionalLeaseService(
        data,
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );

      revalidatePath(`/tenants/${data.tenantId}`);
      revalidatePath('/properties');
      return { success: true, message: "Additional lease protocol established.", data: result };
    } catch (e: any) {
      console.error('[ADD_LEASE_FATAL]', e);
      return { success: false, message: e.message };
    }
  });
}

/**
 * Move-Out Protocol (GATEKEEPER)
 */
export async function processMoveOut(tenantId: string, leaseId: string, unitId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await processMoveOutService(
        { tenantId, leaseId, unitId },
        { 
          operatorId: session.userId || "OP_SYSTEM_ADMIN", 
          organizationId: session.organizationId 
        }
      );
      
      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      revalidatePath('/properties');
      return { success: true, message: "Move-out protocol executed successfully." };
    } catch (e: any) {
      console.error('[MOVE_OUT_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
