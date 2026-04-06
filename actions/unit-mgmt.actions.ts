'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { createUnitService, updateUnitService } from '@/src/services/mutations/unit.services'
import { MaintenanceStatus } from '@prisma/client'

/**
 * UNIT MATERIALIZATION ACTION (GATEKEEPER)
 */
export async function createUnit(data: { unitNumber: string, type: string, category: string, propertyId: string, marketRent?: number }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const unit = await createUnitService(
        data,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath(`/properties/${data.propertyId}`);
      return { success: true, data: { ...unit, marketRent: Number(unit.marketRent) } };
    } catch (e: any) {
      console.error('[UNIT_CREATE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * UNIT SYNCHRONIZATION ACTION (GATEKEEPER)
 */
export async function updateUnit(unitId: string, data: { maintenanceStatus?: MaintenanceStatus, marketRent?: number, propertyId?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const unit = await updateUnitService(
        unitId,
        data,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      if (data.propertyId) revalidatePath(`/properties/${data.propertyId}`);
      revalidatePath('/properties');
      
      return { success: true, data: { ...unit, marketRent: Number(unit.marketRent) } };
    } catch (e: any) {
      console.error('[UNIT_UPDATE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * UNIT STATUS RECONCILIATION
 */
export async function updateUnitStatus(unitId: string, status: MaintenanceStatus) {
  return updateUnit(unitId, { maintenanceStatus: status });
}
