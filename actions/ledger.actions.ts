'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { processPaymentService, reconcileUtilitiesService } from '@/src/services/mutations/ledger.services'
import { PaymentSubmissionPayload, SystemResponse } from '@/types'

/**
 * ALGORITHM A: The Payment Waterfall (Primary-First)
 * 
 * Gatekeeper for the Sovereign Portfolio Payment Service.
 */
export async function processPayment(payload: PaymentSubmissionPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await processPaymentService(
        {
          tenantId: payload.tenantId,
          amountPaid: payload.amountPaid,
          transactionDate: new Date(payload.transactionDate),
          paymentMode: payload.paymentMode,
          referenceText: payload.referenceText
        },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      return { 
        success: true, 
        message: "Waterfall processing complete. Ledger entry immutable.", 
        data: result 
      };
    } catch (e: any) {
      console.error('[PAYMENT_WATERFALL_FATAL]', e);
      return { 
        success: false, 
        message: e.message || "Unknown error", 
        errorCode: "STATE_CONFLICT" 
      };
    }
  });
}

/**
 * ALGORITHM B: Utility Reconciliation Logic
 */
export async function reconcileUtilities(propertyId: string, startDate: Date, endDate: Date) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await reconcileUtilitiesService(
        propertyId,
        { start: startDate, end: endDate },
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        }
      );

      return {
        success: true,
        message: "Reconciliation analysis successful.",
        data: result
      };
    } catch (e: any) {
      console.error('[RECONCILE_UTILITIES_FATAL]', e);
      return { success: false, message: "ERR_RECONCILE_SERVICE_FAILURE" };
    }
  });
}
