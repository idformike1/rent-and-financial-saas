import { getSovereignClient } from "@/src/lib/db";
import { LedgerEntry, FinancialLedger, Prisma, AccountCategory, EntryStatus } from '@prisma/client';
import { calculatePLMetrics, FINANCIAL_PERIODS, REVENUE_FILTER_CONTEXT } from "@/src/core/algorithms/finance";

/**
 * SOVEREIGN OS DATA ENGINE: TREASURY SERVICE
 * 
 * Centralized data access layer for all ledger and transaction operations.
 */

export const treasuryService = {
  /* ── 1. READ QUERIES ─────────────────────────────────────────────────── */

  /**
   * Retrieves recent ledger entries for the treasury feed.
   */
  async getRecentEntries(organizationId: string, limit = 50): Promise<LedgerEntry[]> {
    const db = getSovereignClient(organizationId);
    return db.ledgerEntry.findMany({
      where: {
        organizationId
      },
      orderBy: { transactionDate: 'desc' },
      take: limit,
      include: {
        account: true,
        tenant: true
      }
    });
  },

  /**
   * Retrieves the master ledger with complex filters.
   */
  async getMasterLedger(organizationId: string, filters: any) {
    const db = getSovereignClient(organizationId);
    
    const where: any = { organizationId };

    if (filters.query) {
      where.description = { contains: filters.query, mode: 'insensitive' };
    }
    if (filters.startDate || filters.endDate) {
      where.transactionDate = {
        gte: filters.startDate,
        lte: filters.endDate
      };
    }
    if (filters.propertyId) where.propertyId = filters.propertyId;
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.accountId) where.accountId = filters.accountId;
    if (filters.category) {
      where.account = { category: filters.category as AccountCategory };
    }

    return db.ledgerEntry.findMany({
      where,
      include: {
        account: true,
        expenseCategory: true,
        property: true,
        tenant: true
      },
      orderBy: { transactionDate: 'desc' },
      skip: filters.skip || 0,
      take: filters.take || 100
    });
  },

  /**
   * Materializes the Profit & Loss statement.
   */
  async getProfitAndLoss(organizationId: string, propertyId?: string) {
    const db = getSovereignClient(organizationId);

    const entries = await db.ledgerEntry.findMany({
      where: {
        organizationId,
        propertyId: propertyId || undefined
      },
      include: {
        account: true,
        expenseCategory: { include: { ledger: true } }
      }
    });

    const revenue = entries.filter((e: any) =>
      e.account?.category === AccountCategory.INCOME ||
      e.expenseCategory?.ledger?.class === 'REVENUE'
    );

    const expenses = entries.filter((e: any) =>
      e.account?.category === AccountCategory.EXPENSE ||
      e.expenseCategory?.ledger?.class === 'EXPENSE'
    );

    const metrics = calculatePLMetrics(revenue, expenses);

    return {
      revenue: {
        grossPotentialRent: metrics.totalRevenue.toNumber(),
        effectiveGrossRevenue: metrics.totalRevenue.toNumber(),
        vacancyLoss: 0
      },
      expenses: {
        operating: {
          total: metrics.totalExpense.toNumber(),
          categories: {}
        }
      },
      metrics: {
        netOperatingIncome: metrics.noi.toNumber(),
        operatingExpenseRatio: metrics.oer.toNumber()
      }
    };
  },

  /**
   * Retrieves all ledgers and expense categories for governance management.
   */
  async getGovernanceMetadata(organizationId: string) {
    const db = getSovereignClient(organizationId);
    const ledgers = await db.financialLedger.findMany({
      where: { organizationId },
      include: { categories: true },
      orderBy: { name: 'asc' }
    });
    const categories = await db.expenseCategory.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' }
    });
    const properties = await db.property.findMany({ where: { organizationId }, select: { id: true, name: true } });
    const tenants = await db.tenant.findMany({ where: { organizationId, isDeleted: false }, select: { id: true, name: true } });


    return { ledgers, categories, properties, tenants };
  },

  /**
   * Retrieves only ledgers and categories for lightweight finance context.
   */
  async getFinanceMetadata(organizationId: string) {
    const db = getSovereignClient(organizationId);
    const ledgers = await db.financialLedger.findMany({
      where: { organizationId },
      include: { categories: true },
      orderBy: { name: 'asc' }
    });
    const categories = await db.expenseCategory.findMany({
      where: { organizationId },
      orderBy: { name: 'asc' }
    });


    return { ledgers, categories };
  },


  /**
   * Materializes the expense registry feed.
   */
  async getExpenseRegistryEntries(organizationId: string, filters: any) {
    const db = getSovereignClient(organizationId);
    return db.ledgerEntry.findMany({
      where: { 
        organizationId,
        account: { category: AccountCategory.EXPENSE }
      },
      include: {
        account: true,
        expenseCategory: true,
        property: true
      },
      orderBy: { transactionDate: 'desc' }
    });
  },

  /**
   * Retrieves all wealth accounts for an organization.
   */
  async getWealthAccounts(organizationId: string) {
    const db = getSovereignClient(organizationId);
    return db.wealthAccount.findMany({
      where: { organizationId, isArchived: false },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Retrieves all expense categories for an organization.
   */
  async getExpenseCategories(organizationId: string) {
    const db = getSovereignClient(organizationId);
    return db.expenseCategory.findMany({
      where: { organizationId, isArchived: false },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Retrieves all income sources for an organization.
   */
  async getIncomeSources(organizationId: string) {
    const db = getSovereignClient(organizationId);
    return db.incomeSource.findMany({
      where: { organizationId, isArchived: false },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Creates a new wealth account.
   */
  async createWealthAccount(organizationId: string, data: any) {
    const db = getSovereignClient(organizationId);
    return db.wealthAccount.create({
      data: { ...data, organizationId }
    });
  },

  /**
   * Orchestrates the materialization of utility consumption charges and ledger entries.
   */
  async logUtilityConsumption(payload: any, context: { operatorId: string, organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    const { createBalancedTransaction } = await import('@/src/services/finance/core');

    return await db.$transaction(async (tx: any) => {
      const settings = await tx.systemSettings.findUnique({
        where: { organizationId: context.organizationId }
      });

      const electricRate = settings ? Number(settings.electricTariff) : 0.15;
      const waterRate = settings ? Number(settings.waterTariff) : 0.05;
      const effectiveRate = payload.utilityType === 'ELECTRIC' ? electricRate : waterRate;

      const previousReading = await tx.meterReading.findFirst({
        where: { unitId: payload.unitId, type: payload.utilityType },
        orderBy: { date: 'desc' }
      });

      if (!previousReading) {
        await tx.meterReading.create({
          data: {
            unitId: payload.unitId,
            type: payload.utilityType,
            value: payload.currentReading,
            date: new Date(payload.date)
          }
        });
        return { success: true, message: "Baseline reading established." };
      }

      if (payload.currentReading <= previousReading.value) {
        throw new Error("ERR_METRIC_VIOLATION");
      }

      const consumption = payload.currentReading - previousReading.value;
      const chargeAmount = consumption * effectiveRate;

      const charge = await tx.charge.create({
        data: {
          organizationId: context.organizationId,
          tenantId: payload.tenantId,
          type: payload.utilityType === 'ELECTRIC' ? 'ELEC_SUBMETER' : 'WATER_SUBMETER',
          amount: chargeAmount,
          dueDate: new Date(payload.date),
          isFullyPaid: false
        }
      });

      const assetAccount = await tx.account.findFirst({ 
        where: { category: 'ASSET', organizationId: context.organizationId } 
      });
      const incomeAccount = await tx.account.findFirst({ 
        where: { category: 'INCOME', organizationId: context.organizationId } 
      });

      await createBalancedTransaction({
        organizationId: context.organizationId,
        description: `Utility Consumption: ${payload.utilityType}`,
        date: new Date(payload.date),
        entries: [
          { accountId: assetAccount?.id || '', type: 'DEBIT', amount: chargeAmount, tenantId: payload.tenantId, chargeId: charge.id },
          { accountId: incomeAccount?.id || '', type: 'CREDIT', amount: chargeAmount }
        ]
      }, tx);

      return { success: true, amount: chargeAmount };
    });
  },

  /* ── 2. MUTATIONS ────────────────────────────────────────────────────── */

  /**
   * Records a new transaction in the ledger (Atomic Double-Entry).
   */
  async createEntry(organizationId: string, transactionId: string, data: any): Promise<LedgerEntry> {
    const db = getSovereignClient(organizationId);
    return db.ledgerEntry.create({
      data: {
        ...data,
        organizationId,
        transactionId
      }
    });
  },

  /**
   * Executes the Global Portfolio Telemetry engine with time-series comparison.
   */
  async getGlobalPortfolioTelemetry(organizationId: string) {
    const db = getSovereignClient(organizationId);
    const now = new Date();

    const thirtyDaysAgo = new Date(now.getTime() - FINANCIAL_PERIODS.TRAILING_MONTH * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - (FINANCIAL_PERIODS.TRAILING_MONTH * 2) * 24 * 60 * 60 * 1000);

    const fetchMetrics = async (start: Date, end: Date) => {
      const [ledgersAgg, arrearsAgg, unitStats] = await Promise.all([
        db.ledgerEntry.groupBy({
          by: ['accountId'],
          _sum: { amount: true },
          where: {
            organizationId,
            transactionDate: { gte: start, lte: end },
            AND: REVENUE_FILTER_CONTEXT
          }
        }),
        db.charge.aggregate({
          _sum: { amount: true, amountPaid: true },
          where: { organizationId, isFullyPaid: false, dueDate: { lte: end } }
        }),
        db.unit.findMany({
          where: { organizationId },
          select: { id: true, leases: { where: { isActive: true }, select: { id: true } } }
        })
      ]);

      const accountIds = ledgersAgg.map(a => a.accountId).filter(Boolean) as string[];
      const accounts = await db.account.findMany({
        where: { id: { in: accountIds } },
        select: { id: true, category: true }
      });
      const accountMap = new Map(accounts.map(a => [a.id, a.category]));

      let rev = 0;
      let opex = 0;
      ledgersAgg.forEach(agg => {
        const cat = accountMap.get(agg.accountId || '');
        const amt = agg._sum.amount ? new Prisma.Decimal(agg._sum.amount).abs().toNumber() : 0;
        if (cat === AccountCategory.INCOME) rev += amt;
        if (cat === AccountCategory.EXPENSE) opex += amt;
      });

      const debt = (arrearsAgg._sum.amount ? new Prisma.Decimal(arrearsAgg._sum.amount) : new Prisma.Decimal(0))
        .minus(arrearsAgg._sum.amountPaid ? new Prisma.Decimal(arrearsAgg._sum.amountPaid) : new Prisma.Decimal(0))
        .toNumber();
      
      const count = unitStats.length;
      const occupiedCount = unitStats.filter(u => u.leases.length > 0).length;
      const yieldRate = count > 0 ? (occupiedCount / count) * 100 : 0;
      
      return { revenue: rev, opex, debt, yieldRate };
    };

    const [current, previous] = await Promise.all([
      fetchMetrics(thirtyDaysAgo, now),
      fetchMetrics(sixtyDaysAgo, thirtyDaysAgo)
    ]);

    const delta = (curr: number, prev: number) =>
      prev === 0 ? (curr > 0 ? 100 : 0) : ((curr - prev) / prev) * 100;

    return {
      current,
      previous,
      deltas: {
        revenue: delta(current.revenue, previous.revenue),
        opex: delta(current.opex, previous.opex),
        debt: delta(current.debt, previous.debt),
        yield: current.yieldRate - previous.yieldRate
      }
    };
  },

  /**
   * Orchestrates the Operational Command KPIs for the dashboard.
   */
  async getDashboardKPIs(orgId: string) {
    const db = getSovereignClient(orgId);
    
    const [totalUnits, unitsWithActiveLeases, ledgerSummaries, arrearsSummary] = await Promise.all([
      db.unit.count({
        where: { organizationId: orgId, deletedAt: null }
      }),
      db.unit.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          leases: { some: { isActive: true, deletedAt: null } }
        }
      }),
      db.ledgerEntry.groupBy({
        by: ['accountId'],
        where: { 
          organizationId: orgId,
          status: 'ACTIVE',
          deletedAt: null,
          NOT: [
            { description: { contains: 'TRANSFER', mode: 'insensitive' } },
            { description: { contains: 'INTERNAL', mode: 'insensitive' } },
            { description: { contains: 'REFUND', mode: 'insensitive' } }
          ]
        },
        _sum: { amount: true }
      }),
      db.charge.aggregate({
        where: {
          organizationId: orgId,
          isFullyPaid: false,
          deletedAt: null
        },
        _sum: { amount: true, amountPaid: true }
      })
    ]);

    const accountIds = ledgerSummaries.map(s => s.accountId).filter(Boolean) as string[];
    const accounts = await db.account.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, category: true }
    });
    const accountMap = new Map(accounts.map(a => [a.id, a.category]));

    let payments = new Prisma.Decimal(0);
    let expenses = new Prisma.Decimal(0);

    ledgerSummaries.forEach(s => {
      const cat = accountMap.get(s.accountId || '');
      const amount = s._sum.amount ? new Prisma.Decimal(s._sum.amount) : new Prisma.Decimal(0);
      if (cat === AccountCategory.INCOME) payments = payments.plus(amount.abs());
      if (cat === AccountCategory.EXPENSE) expenses = expenses.plus(amount.abs());
    });

    const occupancy = totalUnits > 0 ? (unitsWithActiveLeases / totalUnits) * 100 : 0;
    const noi = payments.minus(expenses);

    const totalCharged = arrearsSummary._sum.amount ? new Prisma.Decimal(arrearsSummary._sum.amount) : new Prisma.Decimal(0);
    const totalPaid = arrearsSummary._sum.amountPaid ? new Prisma.Decimal(arrearsSummary._sum.amountPaid) : new Prisma.Decimal(0);
    const arrears = totalCharged.minus(totalPaid);

    return {
      occupancy: Number(occupancy.toFixed(2)),
      noi: Number(noi.toFixed(2)),
      arrears: Number(arrears.toFixed(2))
    };
  }
};
