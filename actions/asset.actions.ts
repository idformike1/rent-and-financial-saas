'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { assetService } from '@/src/services/asset.service'
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
      const property = await assetService.createProperty(
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
      const property = await assetService.updateProperty(
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
      await assetService.deleteProperty(
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
      const unit = await assetService.createUnit(
        data,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      revalidatePath(`/assets/${data.propertyId}`);
      revalidatePath('/tenants');
      revalidatePath('/tenant-register');
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
      const unit = await assetService.updateUnit(
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
    return await runSecureServerAction('VIEWER', async (session) => {
      const units = await assetService.getAvailableUnits(session.organizationId);
      return JSON.parse(JSON.stringify(units || []));
    }, false);
  } catch (e) {
    console.error('[ASSET_INVENTORY_SCAN_FATAL]', e);
    return [];
  }
}

export async function getUnitLedgerFeed(unitId: string) {
  try {
    return await runSecureServerAction('VIEWER', async (session) => {
      const feed = await assetService.getUnitLedgerFeed(unitId, session.organizationId);
      return JSON.parse(JSON.stringify(feed || []));
    }, false);
  } catch (e) {
    console.error('[ASSET_LEDGER_FEED_FATAL]', e);
    return [];
  }
}
