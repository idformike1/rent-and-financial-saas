'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import {
  getGlobalPortfolioTelemetryService,
  getProfitAndLossService,
  getRentRollService,
  getTaxPrepService,
  saveReportSnapshotService,
  getPropertyAssetPulseService,
  getPropertyLedgerEntriesService,
  getMasterLedgerService
} from '@/src/services/queries/analytics.services'
import { getLedgerFilterMetadataService } from '@/src/services/queries/metadata.services'

/**
 * ANALYTICS DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 *
 * Centralized gatekeeper for all read-only analytics operations:
 * Macro Dashboard Telemetry, Financial Reports, and Asset Pulse.
 */

/* ── 1. MACRO DASHBOARD ─────────────────────────────────────────────────── */

/**
 * GLOBAL PORTFOLIO TELEMETRY (GATEKEEPER)
 */
export async function getGlobalPortfolioTelemetry() {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      const result = await getGlobalPortfolioTelemetryService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return { success: true, data: result };
    } catch (e: any) {
      console.error('[ANALYTICS_TELEMETRY_FATAL]', e);
      return { success: false, message: e.message || "System Reconciliation Failure" };
    }
  }, false);
}

/* ── 2. FINANCIAL REPORTS ───────────────────────────────────────────────── */

/**
 * GAAP PROFIT & LOSS ENGINE GATEKEEPER
 */
export async function getProfitAndLoss(dateRange: string, scope: string, propertyId?: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
// ... lines 51-54
      const data = await getProfitAndLossService(propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return data;
    } catch (e: any) {
      console.error('[ANALYTICS_PL_FATAL]', e);
      return {
        revenue: { grossPotentialRent: 0, effectiveGrossRevenue: 0, vacancyLoss: 0 },
        expenses: { operating: { total: 0, categories: {} } },
        metrics: { netOperatingIncome: 0, operatingExpenseRatio: 0 }
      };
    }
  }, false);
}

/**
 * RENT ROLL GATEKEEPER
 */
export async function getRentRoll(propertyId?: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await getRentRollService(propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[ANALYTICS_RENTROLL_FATAL]', e);
      return [];
    }
  }, false);
}

/**
 * TAX PREP GATEKEEPER
 */
export async function getTaxPrep(year: number, propertyId?: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await getTaxPrepService(year, propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[ANALYTICS_TAXPREP_FATAL]', e);
      return [];
    }
  }, false);
}

/**
 * REPORT SNAPSHOT GATEKEEPER
 */
export async function saveReportSnapshot(payload: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      return await saveReportSnapshotService(payload, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[ANALYTICS_SNAPSHOT_FATAL]', e);
      throw e;
    }
  });
}

/* ── 3. ASSET ANALYTICS ─────────────────────────────────────────────────── */

/**
 * ASSET PULSE GATEKEEPER
 */
export async function getPropertyAssetPulse(propertyId: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      const data = await getPropertyAssetPulseService(propertyId, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
      return { success: true, data };
    } catch (e: any) {
      console.error('[ANALYTICS_PULSE_FATAL]', e);
      return { success: false, message: e.message };
    }
  }, false);
}

/**
 * ASSET LEDGER DRILL-DOWN GATEKEEPER
 */
export async function getPropertyLedgerEntries(propertyId: string, type: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await getPropertyLedgerEntriesService(propertyId, type, {
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[ANALYTICS_LEDGER_DRILL_FATAL]', e);
      return [];
    }
  }, false);
}

/**
 * MASTER LEDGER GATEKEEPER
 */
export async function getMasterLedger(filters?: {
// ... filters definition
  query?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  propertyId?: string;
  tenantId?: string;
  accountId?: string;
  categoryId?: string;
  minAmount?: number;
  maxAmount?: number;
  skip?: number;
  take?: number;
}) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await getMasterLedgerService(
        {
          operatorId: session.userId || "OP_SYSTEM_ADMIN",
          organizationId: session.organizationId
        },
        {
          ...filters,
          startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
          endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
        }
      );
    } catch (e: any) {
      console.error('[ANALYTICS_MASTER_LEDGER_FATAL]', e);
      return [];
    }
  }, false);
}

/**
 * LEDGER FILTER METADATA GATEKEEPER
 */
export async function getLedgerFilterMetadata() {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await getLedgerFilterMetadataService({
        operatorId: session.userId || "OP_SYSTEM_ADMIN",
        organizationId: session.organizationId
      });
    } catch (e: any) {
      console.error('[ANALYTICS_METADATA_FATAL]', e);
      return { properties: [], tenants: [], accounts: [], categories: [] };
    }
  }, false);
}
