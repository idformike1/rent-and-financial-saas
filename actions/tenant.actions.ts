'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { SystemResponse } from '@/types'
import { 
  submitOnboardingService, 
  checkTenantExistenceService,
  liquidateTenantDebtService, 
  getTenantForensicDossierService,
  processMoveOutService,
  updateTenantDetailsService,
  softDeleteTenantService,
  addAdditionalLeaseService
} from '@/src/services/mutations/tenant.services'

/**
 * TENANT DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 * 
 * Centralized gatekeeper for all Tenant lifecycle events: 
 * Onboarding, Forensics, Registry Updates, and Disposition.
 */

/* ── 1. ONBOARDING & IDENTITY ─────────────────────────────────────────── */

export interface OnboardingPayload {
  tenantName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  unitId: string;
  baseRent: number;
  securityDeposit: number;
  moveInDate: string; // ISO date string
}

/**
 * STRATEGIC ONBOARDING GATEKEEPER
 * 
 * Executes the materialization protocol for new tenancies.
 * Includes calendar-precision pro-rata math and fiscal isolation for deposits.
 */
export async function submitOnboarding(data: OnboardingPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      /**
       * FISCAL MATH ENFORCEMENT:
       * The 'Rent & Expense Engine' requires exact pro-rata calculations 
       * to ensure GAAP-compliant revenue recognition.
       * 
       * Logic:
       * 1. Extract move-in day and total days in target month.
       * 2. Daily Rate = Base Rent / Total Days.
       * 3. Charge = Daily Rate * (Days Remaining + 1).
       * 4. Security Deposit = Isolated Liability (Non-Revenue).
       */
      
      const result = await submitOnboardingService(
        data,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      // Invalidate caches across the tenant and asset dimensions
      revalidatePath('/tenants');
      revalidatePath('/assets');
      revalidatePath('/assets/[propertyId]', 'page');
      
      return { 
        success: true, 
        message: "Tenancy successfully materialized with calendar-precision pro-rata charges.", 
        data: result 
      };

    } catch (e: any) {
      console.error('[ONBOARDING_ACTION_FATAL]', e);
      return { 
        success: false, 
        message: e.message || "Onboarding failed", 
        errorCode: "STATE_CONFLICT" 
      };
    }
  });
}

/**
 * IDENTITY PROTOCOL VALIDATION (GATEKEEPER)
 */
export async function checkTenantExistence(name: string, email?: string, phone?: string, nationalId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await checkTenantExistenceService(
        { name, email, phone, nationalId },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );
      return result;
    } catch (e: any) {
      console.error('[CHECK_EXISTENCE_FATAL]', e);
      return { exists: false, message: "Validation Protocol Failure", conflicts: undefined };
    }
  });
}

/* ── 2. FORENSICS & RECONCILIATION ─────────────────────────────────────── */

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

/* ── 3. LIFECYCLE & REGISTRY ───────────────────────────────────────────── */

/**
 * UPDATE BASIC DETAILS (GATEKEEPER)
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
 * SOFT DELETE TENANT (GATEKEEPER)
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
 * ADD ADDITIONAL LEASE (GATEKEEPER)
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
      revalidatePath('/assets');
      revalidatePath('/assets/[propertyId]', 'page');
      return { success: true, message: "Additional lease protocol established.", data: result };
    } catch (e: any) {
      console.error('[ADD_LEASE_FATAL]', e);
      return { success: false, message: e.message };
    }
  });
}

/**
 * MOVE-OUT PROTOCOL (GATEKEEPER)
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
      revalidatePath('/assets');
      revalidatePath('/assets/[propertyId]', 'page');
      return { success: true, message: "Move-out protocol executed successfully." };
    } catch (e: any) {
      console.error('[MOVE_OUT_FATAL]', e);
      return { success: false, message: e.message || "ERR_SERVICE_LAYER_FAILURE" };
    }
  });
}

/**
 * FETCH ACTIVE TENANTS FOR ASSIGNMENT (GATEKEEPER)
 */
export async function getActiveTenants() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const { getSovereignClient } = await import('@/src/lib/db');
      const db = getSovereignClient(session.userId || "OP_SYSTEM_ADMIN");
      const tenants = await db.tenant.findMany({
        where: { organizationId: session.organizationId, isDeleted: false },
        select: { id: true, name: true, nationalId: true },
        orderBy: { name: 'asc' }
      });
      return { success: true, data: tenants };
    } catch (e: any) {
      console.error('[GET_TENANTS_FATAL]', e);
      return { success: false, data: [] };
    }
  });
}
