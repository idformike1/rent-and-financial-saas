import { getSovereignClient } from "@/src/lib/db";
import { recordAuditLog } from "@/lib/audit-logger";
import { validateTaxonomyDepth, rankSearchResults } from "@/src/core/algorithms/governance";
import { AccountCategory, Prisma } from "@prisma/client";

/**
 * SOVEREIGN OS DATA ENGINE: SYSTEM SERVICE
 * 
 * Centralized data access layer for all infrastructure, taxonomy, and search operations.
 */
export const systemService = {
  /**
   * Executes a Revenue Synchronization protocol to repair misclassified ledgers.
   */
  async executeRevenueSync(organizationId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      const misclassified = await tx.financialLedger.findMany({
        where: {
          organizationId,
          class: 'EXPENSE',
          OR: [
            { name: { contains: 'INCOME', mode: 'insensitive' } },
            { name: { contains: 'REVENUE', mode: 'insensitive' } },
            { name: { contains: 'RENT', mode: 'insensitive' } }
          ]
        }
      });

      let updatedCount = 0;
      for (const ledger of misclassified) {
        await tx.financialLedger.updateMany({
          where: { id: ledger.id, organizationId },
          data: { class: 'REVENUE' }
        });
        updatedCount++;

        const account = await tx.account.findFirst({
          where: { name: ledger.name, organizationId }
        });

        if (!account) {
          await tx.account.create({
            data: { name: ledger.name, category: AccountCategory.INCOME, organizationId }
          });
        } else if (account.category !== AccountCategory.INCOME) {
          await tx.account.updateMany({
            where: { id: account.id, organizationId },
            data: { category: AccountCategory.INCOME }
          });
        }
      }

      const hasIncome = await tx.account.findFirst({
        where: { organizationId, category: AccountCategory.INCOME }
      });

      if (!hasIncome) {
        await tx.account.create({
          data: {
            name: "GLOBAL REVENUE (AXIOM)",
            category: AccountCategory.INCOME,
            organizationId
          }
        });
        updatedCount++;
      }

      await recordAuditLog({
        action: 'UPDATE',
        entityType: 'ORGANIZATION',
        entityId: organizationId,
        metadata: { action: 'REVENUE_SYNC', count: updatedCount },
        tx: tx as any
      });

      return { updatedCount };
    });
  },

  /**
   * Materializes a new root Ledger.
   */
  async createLedger(payload: { name: string, class: string }, organizationId: string) {
    const db = getSovereignClient(organizationId);
    const normalized = payload.name.trim().toUpperCase();

    const existing = await db.financialLedger.findFirst({
      where: { name: normalized, organizationId }
    });

    if (existing) throw new Error(`ERR_PROTOCOL_VIOLATION: Alpha Ledger '${normalized}' already materialized.`);

    return await db.$transaction(async (tx: any) => {
      const ledger = await tx.financialLedger.create({
        data: { organizationId, name: normalized, class: payload.class }
      });

      await recordAuditLog({
        action: 'CREATE', entityType: 'LEDGER', entityId: ledger.id,
        metadata: { name: normalized }, tx: tx as any
      });

      return ledger;
    });
  },

  /**
   * Executes a ledger vaporization.
   */
  async deleteLedger(ledgerId: string, organizationId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      const childrenCount = await tx.expenseCategory.count({
        where: { ledgerId, organizationId }
      });

      if (childrenCount > 0) throw new Error("ERR_ENTITY_LOCKED: Ledger contains active taxonomy branches.");

      const result = await tx.financialLedger.deleteMany({
        where: { id: ledgerId, organizationId }
      });

      if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Ledger not found or access denied.");

      await recordAuditLog({
        action: 'DELETE', entityType: 'LEDGER', entityId: ledgerId, tx: tx as any
      });
    });
  },

  /**
   * Materializes an account node.
   */
  async createAccountNode(payload: { name: string, ledgerId: string, parentId?: string | null }, organizationId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      if (payload.parentId) {
        const parent = await tx.expenseCategory.findFirst({
          where: { id: payload.parentId, organizationId }
        });
        const validation = validateTaxonomyDepth(payload.parentId, !!parent?.parentId);
        if (!validation.valid) throw new Error(`ERR_PROTOCOL_VIOLATION: ${validation.error}`);
      }

      const existing = await tx.expenseCategory.findFirst({
        where: {
          organizationId,
          ledgerId: payload.ledgerId,
          parentId: payload.parentId || null,
          name: { equals: payload.name.trim(), mode: 'insensitive' }
        }
      });

      if (existing) throw new Error(`ERR_PROTOCOL_VIOLATION: Node '${payload.name}' already registered in this branch.`);

      const node = await tx.expenseCategory.create({
        data: {
          organizationId,
          name: payload.name.trim(),
          ledgerId: payload.ledgerId,
          parentId: payload.parentId || undefined
        }
      });

      await recordAuditLog({
        action: 'CREATE', entityType: 'CATEGORY', entityId: node.id,
        metadata: { name: payload.name, ledgerId: payload.ledgerId }, tx: tx as any
      });

      return node;
    });
  },

  /**
   * Recalibrates a ledger's label.
   */
  async updateLedger(id: string, name: string, organizationId: string) {
    const db = getSovereignClient(organizationId);
    const normalized = name.trim().toUpperCase();

    return await db.$transaction(async (tx: any) => {
      const result = await tx.financialLedger.updateMany({
        where: { id, organizationId },
        data: { name: normalized }
      });

      if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Ledger not found or access denied.");

      await recordAuditLog({
        action: 'UPDATE', entityType: 'LEDGER', entityId: id,
        metadata: { newName: normalized }, tx: tx as any
      });

      return { id, name: normalized };
    });
  },

  /**
   * Recalibrates an account node's label.
   */
  async updateAccountNode(id: string, label: string, organizationId: string) {
    const db = getSovereignClient(organizationId);
    const normalized = label.trim();

    return await db.$transaction(async (tx: any) => {
      const result = await tx.expenseCategory.updateMany({
        where: { id, organizationId },
        data: { name: normalized }
      });

      if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Category not found or access denied.");

      await recordAuditLog({
        action: 'UPDATE', entityType: 'CATEGORY', entityId: id,
        metadata: { newLabel: normalized }, tx: tx as any
      });

      return { id, name: normalized };
    });
  },

  /**
   * Executes a terminal node vaporization.
   */
  async deleteAccountNode(id: string, organizationId: string) {
    const db = getSovereignClient(organizationId);

    return await db.$transaction(async (tx: any) => {
      const childrenCount = await tx.expenseCategory.count({
        where: { parentId: id, organizationId }
      });

      if (childrenCount > 0) throw new Error("ERR_ENTITY_LOCKED: Node contains active sub-categories.");

      const entriesCount = await tx.ledgerEntry.count({
        where: { accountId: id, organizationId }
      });

      if (entriesCount > 0) throw new Error("ERR_ENTITY_LOCKED: Node associated with active ledger entries.");

      const result = await tx.expenseCategory.deleteMany({
        where: { id, organizationId }
      });

      if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT: Category not found or access denied.");

      await recordAuditLog({
        action: 'DELETE', entityType: 'CATEGORY', entityId: id, tx: tx as any
      });

      return result;
    });
  },

  /**
   * Executes a Deep Scan across the registry.
   */
  async deepScan(query: string, organizationId: string) {
    const db = getSovereignClient(organizationId);

    if (!query || query.length < 2) return [];

    const [tenants, properties, categories, units] = await Promise.all([
      db.tenant.findMany({
        where: {
          organizationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ]
        },
        take: 5
      }),
      db.property.findMany({
        where: {
          organizationId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
          ]
        },
        take: 5
      }),
      db.expenseCategory.findMany({
        where: {
          organizationId,
          name: { contains: query, mode: 'insensitive' }
        },
        take: 3
      }),
      db.unit.findMany({
        where: {
          organizationId,
          unitNumber: { contains: query, mode: 'insensitive' }
        },
        take: 3
      })
    ]);

    const rawResults = [
      ...tenants.map((t: any) => ({ id: t.id, title: t.name, type: 'TENANT', href: `/tenants/${t.id}`, description: t.email })),
      ...properties.map((p: any) => ({ id: p.id, title: p.name, type: 'ASSET', href: `/properties/${p.id}`, description: p.address || 'Property' })),
      ...categories.map((c: any) => ({ id: c.id, title: c.name, type: 'GOVERNANCE', href: '/settings/categories', description: 'Expense Category' })),
      ...units.map((u: any) => ({ id: u.id, title: `Unit ${u.unitNumber}`, type: 'ASSET', href: '/properties', description: u.type })),
    ];

    return rankSearchResults(rawResults, query);
  },

  /**
   * Executes an organizational bootstrap protocol (ADMIN ONLY).
   */
  async bootstrapOrganization(payload: { orgName: string, ownerName: string, ownerEmail: string }, operatorId: string) {
    const db = getSovereignClient("ROOT_SYSTEM");

    return await db.$transaction(async (tx: any) => {
      const org = await tx.organization.create({
        data: { name: payload.orgName }
      });

      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4);
      const tempPasswordHash = await import("bcryptjs").then(m => m.hash(tempPassword, 12));

      const user = await tx.user.create({
        data: {
          email: payload.ownerEmail,
          name: payload.ownerName,
          passwordHash: tempPasswordHash,
          role: "OWNER",
          organizationId: org.id,
          accountStatus: "ACTIVE",
          requiresPasswordChange: true
        }
      });

      await recordAuditLog({
        action: 'CREATE',
        entityType: 'ORGANIZATION',
        entityId: org.id,
        metadata: { name: payload.orgName, ownerEmail: payload.ownerEmail },
        tx: tx as any,
        userId: operatorId,
        organizationId: org.id
      });

      return { 
        organization: org, 
        owner: user,
        tempPassword 
      };
    });
  },

  /**
   * Materializes the Detailed Structural Ontology for the organization.
   */
  async getDetailedOntology(organizationId: string) {
    const db = getSovereignClient(organizationId);

    const buildings = await db.property.findMany({
      where: { organizationId },
      include: {
        units: { include: { leases: { where: { isActive: true }, include: { tenant: { select: { id: true, name: true } } } } } },
        ledgerEntries: {
          where: { organizationId, OR: [{ account: { category: 'EXPENSE' } }, { expenseCategoryId: { not: null } }] },
          take: 10,
          orderBy: { transactionDate: 'desc' },
          include: { expenseCategory: true }
        }
      }
    });

    const corporateExpenses = await db.ledgerEntry.findMany({
      where: { organizationId, propertyId: null, OR: [{ account: { category: 'EXPENSE' } }, { expenseCategoryId: { not: null } }] },
      take: 20,
      orderBy: { transactionDate: 'desc' },
      include: { expenseCategory: true }
    });

    const mappedBuildings = buildings.map((b: any) => {
      const tenantsMap = new Map();
      b.units.forEach((u: any) => u.leases.forEach((l: any) => l.tenant && tenantsMap.set(l.tenant.id, l.tenant.name)));

      return {
        id: b.id,
        name: b.name,
        type: 'BUILDING',
        tenants: Array.from(tenantsMap.entries()).map(([id, name]) => ({ id, name, type: 'TENANT' })),
        expenses: b.ledgerEntries.map((e: any) => ({
          id: e.id,
          name: e.description || e.expenseCategory?.name || 'Uncategorized OPEX',
          amount: Number(e.amount),
          type: 'EXPENSE'
        }))
      };
    });

    return {
      id: organizationId,
      name: "Sovereign Registry",
      type: 'ORGANIZATION',
      children: [
        { id: 'asset-portfolio', name: 'Asset Portfolio', type: 'CATEGORY', children: mappedBuildings },
        {
          id: 'corporate-overhead', name: 'Corporate Overhead', type: 'CATEGORY',
          children: corporateExpenses.map((e: any) => ({
            id: e.id,
            name: e.description || e.expenseCategory?.name || 'Corporate Entry',
            amount: Number(e.amount),
            type: 'EXPENSE'
          }))
        }
      ]
    };
  }
};
