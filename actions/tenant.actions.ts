'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { SystemResponse } from '@/types'
import { tenantService } from '@/src/services/tenant.service'

/**
 * TENANT DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 */

export interface OnboardingPayload {
  tenantName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  unitId: string;
  baseRent: number;
  securityDeposit: number;
  moveInDate: string;
}

export async function submitOnboarding(data: OnboardingPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await tenantService.submitOnboarding(
        data,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/tenants');
      revalidatePath('/assets');
      return { success: true, message: "Tenancy materialized.", data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "Onboarding failed" };
    }
  });
}

export async function checkTenantExistence(name: string, email?: string, phone?: string, nationalId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      return await tenantService.checkTenantExistence(
        { name, email, phone, nationalId },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
    } catch (e: any) {
      return { exists: false, conflicts: null, message: "Validation Protocol Failure" };
    }
  });
}

export async function liquidateTenantDebt(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await tenantService.liquidateTenantDebt(
        tenantId,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath(`/tenants/${tenantId}`);
      return { success: true, message: "RECONCILIATION_SUCCESS", data: result };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function getTenantForensicDossier(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await tenantService.getTenantForensicDossier(
        tenantId,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      return { success: true, data: JSON.parse(JSON.stringify(result)) };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function updateTenantDetails(tenantId: string, data: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenant = await tenantService.updateTenantDetails(
        tenantId,
        data,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      revalidatePath('/assets');
      revalidatePath('/home');
      revalidatePath('/reports/insights');
      return { success: true, data: tenant };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function softDeleteTenant(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await tenantService.softDeleteTenant(
        tenantId,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath('/tenants');
      return { success: true, message: "Tenant soft-deleted." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function addAdditionalLease(data: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await tenantService.addAdditionalLease(
        data,
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath(`/tenants/${data.tenantId}`);
      revalidatePath('/assets');
      return { success: true, message: "Additional lease protocol established.", data: result };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function processMoveOut(tenantId: string, leaseId: string, unitId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await tenantService.processMoveOut(
        { tenantId, leaseId, unitId },
        { operatorId: session.userId || "OP_SYSTEM_ADMIN", organizationId: session.organizationId }
      );
      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      revalidatePath('/assets');
      return { success: true, message: "Move-out protocol executed." };
    } catch (e: any) {
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

export async function getActiveTenants() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenants = await tenantService.getTenantsWithContext(session.organizationId);
      return { success: true, data: tenants.map(t => ({ id: t.id, name: t.name })) };
    } catch (e: any) {
      return { success: false, data: [] };
    }
  }, false);
}

export async function getVacantUnits() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const { assetService } = await import('@/src/services/asset.service');
      const units = await assetService.getAvailableUnits(session.organizationId);
      return { success: true, data: units };
    } catch (e: any) {
      return { success: false, data: [] };
    }
  }, false); // Set isMutation to false for READ operations
}
