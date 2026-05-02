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
      console.error('[ANALYTICS_PULSE_FATAL]', e);
      return { success: false, error: e.message || "ERR_TELEMETRY_FAILURE" };
    }
  }, false);
}

export async function getPropertyLedgerEntries(propertyId: string, type: string) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      // 1. Semantic Mapping Layer (UI -> DB)
      const filters: any = { propertyId };
      
      switch (type) {
        case 'NOI':
          filters.category = ['INCOME', 'EXPENSE'];
          break;
        case 'GROSS_POTENTIAL':
        case 'LEAKAGE':
        case 'COLLECTION':
          filters.category = 'INCOME';
          break;
        case 'ALL':
        default:
          // No specific category filter
          break;
      }

      const data = await treasuryService.getMasterLedger(session.organizationId, filters);
      
      // EXPLICIT SERIALIZATION (Surgical Decimal & Date conversion)
      const serializedData = data.map((entry: any) => ({
        ...entry,
        amount: Number(entry.amount),
        transactionDate: entry.transactionDate.toISOString(),
        createdAt: entry.createdAt?.toISOString(),
        updatedAt: entry.updatedAt?.toISOString(),
        deletedAt: entry.deletedAt?.toISOString() || null
      }));

      return { success: true, data: serializedData };
    } catch (e: any) {
      console.error('[ANALYTICS_LEDGER_FATAL]', e);
      return { success: false, error: e.message || "ERR_LEDGER_RECONCILIATION" };
    }
  }, false);
}

export async function getMasterLedger(filters?: any) {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      const data = await treasuryService.getMasterLedger(session.organizationId, filters);
      
      // EXPLICIT SERIALIZATION
      const serializedData = data.map((entry: any) => ({
        ...entry,
        amount: Number(entry.amount),
        transactionDate: entry.transactionDate.toISOString(),
        createdAt: entry.createdAt?.toISOString(),
        updatedAt: entry.updatedAt?.toISOString(),
        deletedAt: entry.deletedAt?.toISOString() || null
      }));

      return { success: true, data: serializedData };
    } catch (e: any) {
      console.error('[ANALYTICS_MASTER_LEDGER_FATAL]', e);
      return { success: false, error: e.message || "ERR_MASTER_QUERY_FAILURE" };
    }
  }, false);
}

export async function getLedgerFilterMetadata() {
  return runSecureServerAction('VIEWER', async (session) => {
    try {
      const data = await treasuryService.getGovernanceMetadata(session.organizationId);
      return { success: true, data };
    } catch (e: any) {
      console.error('[ANALYTICS_METADATA_FATAL]', e);
      return { success: false, error: e.message || "ERR_METADATA_ABSENT" };
    }
  }, false);
}
