'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { AccountCategory } from '@prisma/client'

/**
 * REPORTING ACTION: LIVE WATERFALL (SANKEY) DATA AGGREGATION
 */
export async function getLiveWaterfallData() {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const ledgers = await prisma.financialLedger.findMany({
        where: { organizationId: session.organizationId },
        include: {
          categories: {
            include: {
              entries: {
                select: { amount: true }
              }
            }
          }
        }
      });

      type SankeyNode = { id: string; name: string; color?: string };
      type SankeyLink = { source: string; target: string; value: number; color?: string };

      const nodes: SankeyNode[] = [
        { id: 'GROSS_REVENUE', name: 'GROSS REVENUE', color: '#10b981' },
        { id: 'OPERATING_EXPENSES', name: 'TOTAL EXPENSES', color: '#f43f5e' },
        { id: 'NOI', name: 'NET OPERATING INCOME', color: '#6366f1' }
      ];

      const links: SankeyLink[] = [];
      let totalRevenue = 0;
      let totalExpense = 0;

      ledgers.forEach((ledger: any) => {
        let ledgerTotal = 0;
        ledger.categories.forEach((cat: any) => {
          const catTotal = cat.entries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);
          ledgerTotal += catTotal;
          if (catTotal > 0) {
            if (!nodes.find(n => n.id === cat.id)) nodes.push({ id: cat.id, name: cat.name.toUpperCase() });
            links.push({ 
              source: cat.id, 
              target: ledger.id, 
              value: catTotal,
              color: ledger.class === 'REVENUE' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'
            });
          }
        });
        if (!nodes.find(n => n.id === ledger.id)) nodes.push({ id: ledger.id, name: ledger.name.toUpperCase() });
        if (ledgerTotal > 0) {
          if (ledger.class === 'REVENUE') {
            totalRevenue += ledgerTotal;
            links.push({ source: ledger.id, target: 'GROSS_REVENUE', value: ledgerTotal, color: '#10b981' });
          } else if (ledger.class === 'EXPENSE') {
            totalExpense += ledgerTotal;
            links.push({ source: ledger.id, target: 'OPERATING_EXPENSES', value: ledgerTotal, color: '#f43f5e' });
          }
        }
      });

      if (totalRevenue > 0) links.push({ source: 'GROSS_REVENUE', target: 'NOI', value: totalRevenue, color: 'rgba(99, 102, 241, 0.4)' });
      if (totalExpense > 0) links.push({ source: 'OPERATING_EXPENSES', target: 'NOI', value: totalExpense, color: 'rgba(244, 63, 94, 0.4)' });

      return { success: true, data: { nodes, links, stats: { totalRevenue, totalExpense, noi: totalRevenue - totalExpense } } };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
}

/**
 * RESTORED: GAAP PROFIT & LOSS ENGINE
 */
export async function getProfitAndLoss(dateRange: string, scope: string, propertyId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    const entries = await prisma.ledgerEntry.findMany({
      where: { 
        organizationId: session.organizationId,
        propertyId: propertyId || undefined
      },
      include: { account: true, expenseCategory: { include: { ledger: true } } }
    });

    const revenue = entries.filter((e: any) => e.account.category === AccountCategory.INCOME || e.expenseCategory?.ledger?.class === 'REVENUE');
    const expenses = entries.filter((e: any) => e.account.category === AccountCategory.EXPENSE || e.expenseCategory?.ledger?.class === 'EXPENSE');

    const totalRevenue = revenue.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const totalExpense = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    return {
      revenue: { grossPotentialRent: totalRevenue, effectiveGrossRevenue: totalRevenue, vacancyLoss: 0 },
      expenses: { operating: { total: totalExpense, categories: {} } },
      metrics: { netOperatingIncome: totalRevenue - totalExpense, operatingExpenseRatio: (totalExpense / totalRevenue) * 100 || 0 }
    };
  });
}

/**
 * PROPERTY_ASSET_PULSE: ASYMMETRIC ANALYTIC ENGINE
 * Computes NOI, Adjusted NOI (OPEX-only), Leakage, and Risk Profiles.
 */
export async function getPropertyAssetPulse(propertyId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
          units: {
            include: {
              leases: {
                where: { isActive: true },
                include: { tenant: true, charges: true }
              }
            }
          },
          ledgerEntries: {
            include: { 
              expenseCategory: { include: { ledger: true } }
            }
          }
        }
      });

      if (!property) throw new Error("Property Context Nullified");

      // FISCAL HUD AGGREGATION
      const entries = property.ledgerEntries;
      
      const revenueEntries = entries.filter((e: any) => e.expenseCategory?.ledger?.class === 'REVENUE');
      const opexEntries = entries.filter((e: any) => e.expenseCategory?.ledger?.class === 'EXPENSE');
      const capexEntries = entries.filter((e: any) => e.expenseCategory?.ledger?.class === 'CAPEX');

      const grossRevenue = revenueEntries.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      const operatingExpense = Math.abs(opexEntries.reduce((sum: number, e: any) => sum + Number(e.amount), 0));
      const capitalExpense = Math.abs(capexEntries.reduce((sum: number, e: any) => sum + Number(e.amount), 0));

      const noi = grossRevenue - operatingExpense - capitalExpense;
      const adjustedNoi = grossRevenue - operatingExpense; // True Operational Health

      // REVENUE LEAKAGE (GAP ANALYSIS)
      let totalMarketPotential = 0;
      let totalContractRevenue = 0;

      property.units.forEach((u: any) => {
        totalMarketPotential += Number(u.marketRent || 0);
        const activeLease = u.leases[0];
        if (activeLease) {
          totalContractRevenue += Number(activeLease.rentAmount || 0);
        }
      });

      const revenueLeakage = totalMarketPotential > 0 
        ? ((totalMarketPotential - totalContractRevenue) / totalMarketPotential) * 100 
        : 0;

      // COLLECTION EFFICIENCY (CURRENT MONTH)
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let expectedRent = 0;
      
      property.units.forEach((u: any) => {
        const activeLease = u.leases[0];
        if (activeLease) {
          expectedRent += Number(activeLease.rentAmount || 0);
        }
      });
      
      const currentMonthRevenue = revenueEntries.filter((re: any) => new Date(re.transactionDate) >= currentMonthStart);
      const totalCollectedThisMonth = currentMonthRevenue.reduce((sum: number, re: any) => sum + Math.abs(Number(re.amount)), 0);

      const collectionEfficiency = expectedRent > 0 ? (totalCollectedThisMonth / expectedRent) * 100 : 100;

      // RISK HEATMAP (BEHAVIORAL MATRICES)
      const unitRiskGrid = property.units.map((u: any) => {
        const activeLease = u.leases[0];
        let risk: 'GREEN' | 'YELLOW' | 'RED' = 'GREEN';
        
        if (activeLease) {
          const unpaidCharges = activeLease.charges.filter((c: any) => !c.isFullyPaid);
          const hasBalance = unpaidCharges.length > 0;
          
          if (hasBalance) risk = 'RED';
          else {
            const overdue = activeLease.charges.find((c: any) => !c.isFullyPaid && new Date(c.dueDate) < now);
            if (overdue) risk = 'RED';
          }
        } else {
          risk = 'YELLOW'; // Vacant risk
        }

        return {
          id: u.id,
          unitNumber: u.unitNumber,
          tenantName: activeLease?.tenant.name || 'VACANT',
          riskScore: risk,
          occupancy: !!activeLease
        }
      });

      return {
        success: true,
        data: {
          hud: {
            noi,
            adjustedNoi,
            revenueLeakage,
            collectionEfficiency
          },
          waterfall: {
            revenue: grossRevenue,
            opex: operatingExpense,
            capex: capitalExpense,
            netCash: grossRevenue - operatingExpense - capitalExpense
          },
          units: unitRiskGrid
        }
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
}

/**
 * RESTORED: DYNAMIC RENT ROLL
 */
export async function getRentRoll(propertyId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    const leases = await prisma.lease.findMany({
      where: { 
        organizationId: session.organizationId, 
        unit: propertyId ? { propertyId } : undefined,
        isActive: true 
      },
      include: { tenant: true, unit: true }
    });

    return leases.map((l: any) => ({
      tenantName: l.tenant.name,
      unitNumber: l.unit.unitNumber,
      rentAmount: Number(l.rentAmount),
      depositAmount: Number(l.depositAmount)
    }));
  });
}

/**
 * RESTORED: ENTERPRISE TAX PREP
 */
export async function getTaxPrep(year: number, propertyId?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    const entries = await prisma.ledgerEntry.findMany({
      where: { 
        organizationId: session.organizationId,
        propertyId: propertyId || undefined,
        transactionDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31)
        },
        OR: [
          { account: { category: AccountCategory.EXPENSE } },
          { expenseCategory: { ledger: { class: 'EXPENSE' } } }
        ]
      },
      include: { expenseCategory: true }
    });

    const categories: Record<string, number> = {};
    entries.forEach((e: any) => {
       const catName = e.expenseCategory?.name || "Uncategorized Operating Expense";
       categories[catName] = (categories[catName] || 0) + Number(e.amount);
    });

    return Object.entries(categories).map(([category, amount]) => ({ category, amount }));
  });
}

/**
 * RESTORED: MASTER LEDGER DRILL-DOWN
 */
export async function getMasterLedger(query?: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    return prisma.ledgerEntry.findMany({
      where: {
        organizationId: session.organizationId,
        OR: query ? [
          { description: { contains: query, mode: 'insensitive' } },
          { expenseCategory: { name: { contains: query, mode: 'insensitive' } } }
        ] : undefined
      },
      include: { account: true, expenseCategory: true },
      orderBy: { transactionDate: 'desc' },
      take: 50
    });
  });
}

/**
 * RESTORED: REPORT SNAPSHOT PERSISTENCE
 */
export async function saveReportSnapshot(payload: any) {
  return runSecureServerAction('MANAGER', async (session) => {
    const snapshot = await prisma.reportSnapshot.create({
      data: {
        organizationId: session.organizationId,
        payload: payload,
        urlToken: Math.random().toString(36).substring(2, 15),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    return { token: snapshot.urlToken };
  });
}
