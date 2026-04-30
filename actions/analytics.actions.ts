'use server'

import { runSecureServerAction } from '@/lib/auth-utils'
import { assetService } from '@/src/services/asset.service'
import { treasuryService } from '@/src/services/treasury.service'

/**
 * ANALYTICS DOMAIN ACTIONS (SOVEREIGN AUTHORITY)
 *
 * Centralized gatekeeper for all read-only analytics operations.
 */

/* ── 1. MACRO DASHBOARD ─────────────────────────────────────────────────── */

export async function getGlobalPortfolioTelemetry() {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      const data = await treasuryService.getGlobalPortfolioTelemetry(session.organizationId);
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message || "System Reconciliation Failure" };
    }
  }, false);
}

/* ── 2. FINANCIAL REPORTS ───────────────────────────────────────────────── */

export async function getProfitAndLoss(dateRange: string, scope: string, propertyId?: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await treasuryService.getProfitAndLoss(session.organizationId, propertyId);
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

/* ── 3. ASSET ANALYTICS ─────────────────────────────────────────────────── */

export async function getPropertyAssetPulse(propertyId: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      const data = await assetService.getPropertyAssetPulse(propertyId, session.organizationId);
      return { success: true, data };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }, false);
}

export async function getPropertyLedgerEntries(propertyId: string, type: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await treasuryService.getMasterLedger(session.organizationId, {
        propertyId,
        category: type
      });
    } catch (e: any) {
      return [];
    }
  }, false);
}

export async function getMasterLedger(filters?: any) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await treasuryService.getMasterLedger(session.organizationId, filters);
    } catch (e: any) {
      console.error('[ANALYTICS_MASTER_LEDGER_FATAL]', e);
      return [];
    }
  }, false);
}

export async function getLedgerFilterMetadata() {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      return await treasuryService.getGovernanceMetadata(session.organizationId);
    } catch (e: any) {
      return { properties: [], tenants: [], accounts: [], categories: [] };
    }
  }, false);
}
