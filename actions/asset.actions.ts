'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { 
  createPropertyService, 
  updatePropertyService,
  deletePropertyService,
  createUnitService,
  updateUnitService
} from '@/src/services/mutations/asset.services'
import { getAvailableUnitsService } from '@/src/services/queries/asset.services'
import { MaintenanceStatus } from '@/src/schema/enums'

/**
 * ASSET DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 * 
 * Centralized gatekeeper for all physical inventory mutations: 
 * Properties, Units, and Maintenance Lifecycle.
 */

/* ── 1. PROPERTY MANAGEMENT ─────────────────────────────────────────────── */

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

      revalidatePath('/assets');
      revalidatePath('/assets/[propertyId]', 'page');
      return { success: true, data: property };
    } catch (e: any) {
      console.error('[ASSET_PROPERTY_CREATE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function updateProperty(propertyId: string, data: { name?: string, address?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const property = await updatePropertyService(
        propertyId,
        data,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath(`/assets/${propertyId}`);
      revalidatePath('/assets');
      revalidatePath('/assets/[propertyId]', 'page');
      return { success: true, data: property };
    } catch (e: any) {
      console.error('[ASSET_PROPERTY_UPDATE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

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

      revalidatePath('/assets');
      revalidatePath('/assets/[propertyId]', 'page');
      revalidatePath(`/properties/${propertyId}`);
      return { success: true };
    } catch (e: any) {
      console.error('[ASSET_PROPERTY_DELETE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/* ── 2. UNIT MANAGEMENT ─────────────────────────────────────────────────── */

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

      revalidatePath(`/assets/${data.propertyId}`);
      return { success: true, data: { ...unit, marketRent: Number(unit.marketRent) } };
    } catch (e: any) {
      console.error('[ASSET_UNIT_CREATE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function updateUnit(unitId: string, data: { maintenanceStatus?: MaintenanceStatus, marketRent?: number, propertyId?: string, unitNumber?: string, type?: string, category?: string }) {
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
      revalidatePath('/assets');
      revalidatePath('/assets/[propertyId]', 'page');
      
      return { success: true, data: { ...unit, marketRent: Number(unit.marketRent) } };
    } catch (e: any) {
      console.error('[ASSET_UNIT_UPDATE_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function updateUnitStatus(unitId: string, status: MaintenanceStatus) {
  return updateUnit(unitId, { maintenanceStatus: status });
}

/* ── 3. ASSET QUERIES & INVENTORY ───────────────────────────────────────── */

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
    console.error('[ASSET_INVENTORY_SCAN_FATAL]', e);
    return [];
  }
}

export async function getUnitLedgerFeed(unitId: string) {
  try {
    return await runSecureServerAction('MANAGER', async (session) => {
      // Lazy import to prevent circular dependencies if any
      const { getUnitLedgerFeedService } = await import('@/src/services/queries/assets.services');
      const feed = await getUnitLedgerFeedService(unitId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return JSON.parse(JSON.stringify(feed || []));
    });
  } catch (e) {
    console.error('[ASSET_LEDGER_FEED_FATAL]', e);
    return [];
  }
}
