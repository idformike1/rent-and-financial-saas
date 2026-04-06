'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { SystemResponse } from '@/types'
import { 
  submitOnboardingService, 
  checkTenantExistenceService 
} from '@/src/services/mutations/tenant.services'

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
 */
export async function submitOnboarding(data: OnboardingPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await submitOnboardingService(
        data,
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      return { 
        success: true, 
        message: "Enterprise Onboarding successfully materialized.", 
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
export async function checkTenantExistence(name: string, email?: string, phone?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await checkTenantExistenceService(
        { name, email, phone },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );
      return result;
    } catch (e: any) {
      console.error('[CHECK_EXISTENCE_FATAL]', e);
      return { exists: false, message: "Validation Protocol Failure" };
    }
  });
}
