'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { createPropertyService, deletePropertyService } from '@/src/services/mutations/property.services'

/**
 * PROPERTY MATERIALIZATION GATEKEEPER
 */
export async function createProperty(data: { name: string, address: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const property = await createPropertyService(
        data,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath('/properties');
      return { success: true, data: property };
    } catch (e: any) {
      console.error('[PROPERTY_CREATE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * PROPERTY VAPORIZATION GATEKEEPER
 */
export async function deleteProperty(propertyId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await deletePropertyService(
        propertyId,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath('/properties');
      return { success: true };
    } catch (e: any) {
      console.error('[PROPERTY_DELETE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}
