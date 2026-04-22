'use server'

import { runSecureServerAction } from "@/lib/auth-utils"
import { getSovereignClient } from "@/src/lib/db"
import { getActiveWorkspaceId } from "./workspace.actions"

/**
 * FISCAL INTELLIGENCE ENGINE (PHASE 12)
 * Dynamic Balance Sheet & Real-Time Equity Calculations
 */

export async function getWorkspaceBalanceSheet() {
  return runSecureServerAction('VIEWER', async () => {
    const orgId = await getActiveWorkspaceId();
    if (!orgId) throw new Error("UNAUTHORIZED: Active workspace context required.");
    
    const db = getSovereignClient(orgId);

    // 1. Fetch all active wealth accounts with their ledger movements
    const accounts = await db.wealthAccount.findMany({
      where: { 
        organizationId: orgId,
        isArchived: false
      },
      include: {
        ledgerEntries: {
          where: { status: "ACTIVE" },
          select: { amount: true }
        }
      }
    });

    // 2. Aggregate and Categorize
    let totalAssets = 0;
    let totalLiabilities = 0;

    const processedAccounts = accounts.map(acc => {
      // Calculate net sum of amount column
      // amount > 0 is DEBIT (Inflow/Asset Increase)
      // amount < 0 is CREDIT (Outflow/Asset Decrease)
      const rawBalance = acc.ledgerEntries.reduce((sum, entry) => sum + Number(entry.amount), 0);
      
      // ACCOUNTING LOGIC:
      // ASSET: Balance = sum(amount)
      // LIABILITY: Balance = -sum(amount) (to show positive debt)
      const displayBalance = acc.category === "LIABILITY" ? -rawBalance : rawBalance;

      if (acc.category === "LIABILITY") {
        totalLiabilities += displayBalance;
      } else {
        totalAssets += displayBalance;
      }

      return {
        id: acc.id,
        name: acc.name,
        category: acc.category,
        balance: displayBalance
      };
    });

    const assets = processedAccounts.filter(a => a.category === "ASSET");
    const liabilities = processedAccounts.filter(a => a.category === "LIABILITY");
    const netWorth = totalAssets - totalLiabilities;

    return {
      success: true,
      data: {
        assets,
        liabilities,
        summary: {
          totalAssets,
          totalLiabilities,
          netWorth
        }
      }
    };
  });
}

/**
 * PREDICTIVE ENGINE (PHASE 12.3)
 * Trailing 30-Day Burn Rate & Liquid Runway Projections
 */
export async function getRunwayForecast() {
  return runSecureServerAction('VIEWER', async () => {
    const orgId = await getActiveWorkspaceId();
    if (!orgId) throw new Error("UNAUTHORIZED: Active workspace context required.");
    
    const db = getSovereignClient(orgId);

    // 1. Establish 30-Day Forensic Window
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 2. Aggregate 30-Day Movements
    const entries = await db.ledgerEntry.findMany({
      where: {
        organizationId: orgId,
        status: "ACTIVE",
        transactionDate: { gte: thirtyDaysAgo }
      }
    });

    let monthlyBurnRate = 0;
    let monthlyIncome = 0;

    entries.forEach(e => {
      const amt = Math.abs(Number(e.amount));
      if (e.expenseCategoryId) {
        monthlyBurnRate += amt;
      } else if (e.incomeSourceId) {
        monthlyIncome += amt;
      }
    });

    // 3. Retrieve Liquidity via Balance Sheet Engine
    const bsResponse = await getWorkspaceBalanceSheet();
    const totalAssets = bsResponse?.success ? bsResponse.data.summary.totalAssets : 0;

    // 4. Calculate Runway Projection (Months to Zero)
    // If Burn is 0, runway is effectively infinite (clamped at 99 for UI stability)
    let runwayMonths = monthlyBurnRate > 0 ? (totalAssets / monthlyBurnRate) : (totalAssets > 0 ? 99 : 0);

    return {
      success: true,
      data: {
        monthlyBurnRate,
        monthlyIncome,
        totalAssets,
        runwayMonths,
        isProfitable: monthlyIncome > monthlyBurnRate,
        netCashFlow: monthlyIncome - monthlyBurnRate
      }
    };
  });
}
