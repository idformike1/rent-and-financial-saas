'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { 
  getWaterfallDataService, 
  getProfitAndLossService,
  getRentRollService,
  getTaxPrepService,
  saveReportSnapshotService,
  getPropertyAssetPulseService,
  getPropertyLedgerEntriesService,
  getMasterLedgerService
} from '@/src/services/queries/reports.services'

/**
 * REPORTING ACTION: LIVE WATERFALL (SANKEY) DATA AGGREGATION
 */
export async function getLiveWaterfallData() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const data = await getWaterfallDataService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return { success: true, data };
    } catch (e: any) {
      console.error('[REPORTS_WATERFALL_FATAL]', e);
      return { success: false, error: "ERR_REPORTING_SERVICE_FAILURE" };
    }
  });
}

/**
 * GAAP PROFIT & LOSS ENGINE
 */
export async function getProfitAndLoss(dateRange: string, scope: string, propertyId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const data = await getProfitAndLossService(propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return data; // Parity with legacy P&L response structure
    } catch (e: any) {
      console.error('[REPORTS_PL_FATAL]', e);
      return {
        revenue: { grossPotentialRent: 0, effectiveGrossRevenue: 0, vacancyLoss: 0 },
        expenses: { operating: { total: 0, categories: {} } },
        metrics: { netOperatingIncome: 0, operatingExpenseRatio: 0 }
      };
    }
  });
}

/**
 * RENT ROLL GATEKEEPER
 */
export async function getRentRoll(propertyId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      return await getRentRollService(propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[REPORTS_RENTROLL_FATAL]', e);
      return [];
    }
  });
}

/**
 * TAX PREP GATEKEEPER
 */
export async function getTaxPrep(year: number, propertyId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      return await getTaxPrepService(year, propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[REPORTS_TAXPREP_FATAL]', e);
      return [];
    }
  });
}

/**
 * SNAPSHOT GATEKEEPER
 */
export async function saveReportSnapshot(payload: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      return await saveReportSnapshotService(payload, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[REPORTS_SNAPSHOT_FATAL]', e);
      throw e;
    }
  });
}

/**
 * ASSET PULSE GATEKEEPER
 */
export async function getPropertyAssetPulse(propertyId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const data = await getPropertyAssetPulseService(propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return { success: true, data };
    } catch (e: any) {
      console.error('[REPORTS_PULSE_FATAL]', e);
      return { success: false, message: e.message };
    }
  });
}

/**
 * ASSET LEDGER DRILL-DOWN GATEKEEPER
 */
export async function getPropertyLedgerEntries(propertyId: string, type: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      return await getPropertyLedgerEntriesService(propertyId, type, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[REPORTS_LEDGER_DRILL_FATAL]', e);
      return [];
    }
  });
}

/**
 * MASTER LEDGER GATEKEEPER
 */
export async function getMasterLedger(query?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      return await getMasterLedgerService(query, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[REPORTS_MASTER_LEDGER_FATAL]', e);
      return [];
    }
  });
}
