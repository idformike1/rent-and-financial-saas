import { getSovereignClient } from "@/src/lib/db";
import { prisma } from "@/src/lib/prisma";
import { Property, Unit, AccountCategory, EntryStatus, Prisma, MaintenanceStatus } from '@prisma/client';
import { unstable_cache } from "next/cache";
import { recordAuditLog } from "@/lib/audit-logger";

/**
 * SOVEREIGN OS DATA ENGINE: ASSET SERVICE
 * 
 * Centralized data access layer for all property and unit operations.
 */

export interface AssetUnit {
  id: string;
  unitNumber: string;
  type: string;
  tenantName: string;
  status: string;
  collectedIncome: number;
}

export interface AssetProperty {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  activeLeases: number;
  collectedIncome: number;
  occupancyRate: number;
  units: AssetUnit[];
}

export interface PortfolioSummary {
  totalAssets: number;
  totalCapacity: number;
  blendedOccupancy: number;
  netCollectedIncome: number;
  properties: AssetProperty[];
}

export const assetService = {
  /* ── 1. READ QUERIES ─────────────────────────────────────────────────── */

  /**
   * Retrieves all properties for an organization with units.
   */
  async getPropertiesWithContext(organizationId: string) {
    const db = getSovereignClient(organizationId);
    return db.property.findMany({
      where: { 
        organizationId 
      },
      include: {
        units: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  /**
   * Retrieves a simplified list of properties for sidebar navigation.
   */
  async getSidebarProperties(organizationId: string) {
    const db = getSovereignClient(organizationId);
    return db.property.findMany({
      where: { organizationId },
      select: { id: true, name: true, address: true },
      orderBy: { name: 'asc' }
    });
  },

  /**
   * Retrieves high-performance portfolio-level telemetry.
   */
  async getPortfolioSummary(organizationId: string): Promise<PortfolioSummary> {
    return unstable_cache(
      async () => {
        const db = getSovereignClient(organizationId);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const properties = await db.property.findMany({
          where: { organizationId },
          include: {
            ledgerEntries: {
              where: {
                organizationId,
                account: { category: AccountCategory.INCOME },
                status: EntryStatus.ACTIVE,
                transactionDate: { gte: startOfMonth, lte: endOfMonth }
              },
              select: { amount: true, tenantId: true }
            },
            units: {
              include: {
                leases: {
                  where: { isActive: true },
                  include: { tenant: { select: { id: true, name: true } } }
                }
              }
            }
          },
          orderBy: { name: 'asc' }
        });

        const mappedProperties: AssetProperty[] = properties.map((p: any) => {
          const propCollected = p.ledgerEntries.reduce((sum: number, entry: any) => sum + Math.abs(Number(entry.amount)), 0);
          
          const mappedUnits: AssetUnit[] = p.units.map((u: any) => {
            const activeLease = u.leases[0];
            const unitTenantId = activeLease?.tenant?.id;
            const unitEntries = unitTenantId ? p.ledgerEntries.filter((e: any) => e.tenantId === unitTenantId) : [];
            const unitIncome = unitEntries.reduce((sum: number, entry: any) => sum + Math.abs(Number(entry.amount)), 0);

            let status = '[ SURVEILLANCE ]';
            if (u.maintenanceStatus === 'OPERATIONAL' && u.leases.length > 0) {
              status = '[ OPTIMIZED ]';
            } else if (u.maintenanceStatus === 'DECOMMISSIONED') {
              status = '[ CRITICAL ]';
            }

            return {
              id: u.id,
              unitNumber: u.unitNumber,
              type: u.type,
              tenantName: u.leases[0]?.tenant?.name || 'VACANT',
              status,
              collectedIncome: unitIncome
            };
          });

          const activeLeasesCount = p.units.filter((u: any) => u.leases.length > 0).length;

          return {
            id: p.id,
            name: p.name,
            address: p.address,
            totalUnits: p.units.length,
            activeLeases: activeLeasesCount,
            collectedIncome: propCollected,
            occupancyRate: p.units.length > 0 ? (activeLeasesCount / p.units.length) * 100 : 0,
            units: mappedUnits
          };
        });

        const totalCapacity = mappedProperties.reduce((sum, p) => sum + p.totalUnits, 0);
        const totalActiveLeases = mappedProperties.reduce((sum, p) => sum + p.activeLeases, 0);

        return {
          totalAssets: mappedProperties.length,
          totalCapacity,
          blendedOccupancy: totalCapacity > 0 ? (totalActiveLeases / totalCapacity) * 100 : 0,
          netCollectedIncome: mappedProperties.reduce((sum, p) => sum + p.collectedIncome, 0),
          properties: mappedProperties
        };
      },
      [`org-${organizationId}-portfolio-summary`],
      {
        tags: [`org-${organizationId}-analytics`],
        revalidate: 3600 // 1 Hour
      }
    )();
  },

  /**
   * Retrieves all OPERATIONAL units that do not have an active lease.
   */
  async getAvailableUnits(organizationId: string) {
    const db = getSovereignClient(organizationId);
    const units = await db.unit.findMany({
      where: {
        organizationId,
        maintenanceStatus: 'OPERATIONAL',
        leases: { none: { isActive: true } }
      },
      include: { property: true },
      orderBy: { unitNumber: 'asc' }
    });

    return units.map((u: any) => ({
      ...u,
      marketRent: Number(u.marketRent)
    }));
  },

  /**
   * Materializes a granular ledger feed for a specific unit.
   */
  async getUnitLedgerFeed(unitId: string, organizationId: string) {
    const db = getSovereignClient(organizationId);
    return db.ledgerEntry.findMany({
      where: { 
        organizationId,
        OR: [
          { unitId },
          { charge: { lease: { unitId } } }
        ]
      },
      include: {
        account: true,
        tenant: true
      },
      orderBy: { transactionDate: 'desc' }
    });
  },

  /**
   * Retrieves a property by ID with full telemetry and units.
   */
  async getPropertySovereignView(propertyId: string, organizationId: string) {
    const db = getSovereignClient(organizationId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const property = await db.property.findFirst({
      where: { id: propertyId, organizationId },
      include: {
        units: {
          // Visibility Protocol: Show all units regardless of status
          include: {
            leases: {
              where: { isActive: true },
              include: { tenant: { select: { name: true } } }
            }
          },
          orderBy: { unitNumber: 'asc' }
        },
        ledgerEntries: {
          where: {
            organizationId,
            account: { category: AccountCategory.INCOME },
            status: EntryStatus.ACTIVE,
            transactionDate: { gte: startOfMonth, lte: endOfMonth }
          },
          select: { amount: true }
        }
      }
    });

    if (!property) throw new Error("Property not found or access denied.");

    const activeLeases = property.units.filter((u: any) => u.leases.length > 0).length;
    const totalUnits = property.units.length;
    const collectedIncome = property.ledgerEntries.reduce((sum: number, entry: any) => sum + Math.abs(Number(entry.amount)), 0);
    const portfolioValue = property.units.reduce((sum: number, u: any) => {
      return sum + (u.leases[0] ? Number(u.leases[0].rentAmount) : 0);
    }, 0);

    return {
      id: property.id,
      name: property.name,
      address: property.address,
      status: property.status,
      units: property.units.map((u: any) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        type: u.type,
        maintenanceStatus: u.maintenanceStatus,
        leases: u.leases.map((l: any) => ({
          id: l.id,
          rentAmount: Number(l.rentAmount),
          depositAmount: Number(l.depositAmount),
          startDate: l.startDate,
          tenant: l.tenant ? { id: l.tenantId, name: l.tenant.name } : null
        }))
      })),
      telemetry: {
        totalUnits,
        activeLeases,
        yield: totalUnits > 0 ? (activeLeases / totalUnits) * 100 : 0,
        collectedIncome,
        portfolioValue
      }
    };
  },

  /**
   * Retrieves a granular view of a specific unit with its active lease context.
   */
  async getUnitSovereignView(unitId: string, organizationId: string) {
    const db = getSovereignClient(organizationId);
    const unit = await db.unit.findFirst({
      where: { id: unitId, organizationId },
      include: {
        property: { select: { id: true, name: true, status: true, units: true } },
        leases: {
          where: { isActive: true },
          include: { tenant: { select: { name: true } } }
        }
      }
    });

    if (!unit) return null;

    return {
      ...unit,
      marketRent: Number(unit.marketRent),
      leases: unit.leases.map((l: any) => ({
        ...l,
        rentAmount: Number(l.rentAmount),
        depositAmount: Number(l.depositAmount)
      }))
    };
  },

  /* ── 2. MUTATIONS ────────────────────────────────────────────────────── */

  async createProperty(payload: { name: string, address: string }, context: { operatorId: string, organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    return await db.$transaction(async (tx: any) => {
      const property = await tx.property.create({
        data: { organizationId: context.organizationId, name: payload.name, address: payload.address }
      });
      await recordAuditLog({ action: 'CREATE', entityType: 'PROPERTY', entityId: property.id, metadata: { name: payload.name }, tx });
      return property;
    });
  },

  async updateProperty(propertyId: string, payload: any, context: { operatorId: string, organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    return await db.$transaction(async (tx: any) => {
      const result = await tx.property.updateMany({
        where: { id: propertyId, organizationId: context.organizationId },
        data: payload
      });
      if (result.count === 0) throw new Error("ERR_IDENTITY_ABSENT");
      await recordAuditLog({ action: 'UPDATE', entityType: 'PROPERTY', entityId: propertyId, metadata: payload, tx });
      return { id: propertyId, ...payload };
    });
  },

  async decommissionProperty(propertyId: string, context: { organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    
    return await db.$transaction(async (tx) => {
      // 1. Bulk Update all units to DECOMMISSIONED
      const result = await tx.unit.updateMany({
        where: { 
          propertyId, 
          organizationId: context.organizationId,
          maintenanceStatus: { not: MaintenanceStatus.DECOMMISSIONED }
        },
        data: { maintenanceStatus: MaintenanceStatus.DECOMMISSIONED }
      });

      // 2. Update Property Status
      await tx.property.update({
        where: { id: propertyId, organizationId: context.organizationId },
        data: { status: 'DECOMMISSIONED' }
      });

      // 3. Log Governance Event
      await recordAuditLog({
        action: 'PROPERTY_DECOMMISSION',
        entityType: 'PROPERTY',
        entityId: propertyId,
        metadata: { unitsAffected: result.count }
      });

      return { success: true, count: result.count };
    });
  },

  async recommissionProperty(propertyId: string, context: { organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    
    return await db.$transaction(async (tx) => {
      // 1. Restore Property Status
      await tx.property.update({
        where: { id: propertyId, organizationId: context.organizationId },
        data: { status: 'ACTIVE' }
      });

      // 2. Restore all units to OPERATIONAL
      const result = await tx.unit.updateMany({
        where: { propertyId, organizationId: context.organizationId },
        data: { maintenanceStatus: MaintenanceStatus.OPERATIONAL }
      });

      // 3. Log Governance Event
      await recordAuditLog({
        action: 'PROPERTY_RECOMMISSION',
        entityType: 'PROPERTY',
        entityId: propertyId,
        metadata: { unitsRestored: result.count }
      });

      return { success: true, count: result.count };
    });
  },

  async deleteProperty(propertyId: string, context: { operatorId: string, organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    return await db.$transaction(async (tx: any) => {
      const now = new Date();
      
      // 1. Soft delete all associated units
      await tx.unit.updateMany({
        where: { propertyId, organizationId: context.organizationId },
        data: { deletedAt: now }
      });

      // 2. Soft delete the property itself
      const result = await tx.property.update({
        where: { id: propertyId, organizationId: context.organizationId },
        data: { deletedAt: now }
      });

      await recordAuditLog({ action: 'DELETE', entityType: 'PROPERTY', entityId: propertyId, tx });
      return result;
    });
  },

  async createUnit(payload: any, context: { operatorId: string, organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    return await db.$transaction(async (tx: any) => {
      const unit = await tx.unit.create({
        data: { 
          ...payload, 
          organizationId: context.organizationId,
          marketRent: new Prisma.Decimal(payload.marketRent || 0)
        }
      });
      await recordAuditLog({ action: 'CREATE', entityType: 'UNIT', entityId: unit.id, metadata: payload, tx });
      return unit;
    });
  },

  async updateUnit(unitId: string, payload: any, context: { operatorId: string, organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    return await db.$transaction(async (tx: any) => {
      const data = { ...payload };
      if (payload.marketRent !== undefined) data.marketRent = new Prisma.Decimal(payload.marketRent);

      const unit = await tx.unit.update({
        where: { id: unitId, organizationId: context.organizationId },
        data
      });
      await recordAuditLog({ action: 'UPDATE', entityType: 'UNIT', entityId: unit.id, metadata: payload, tx });
      return unit;
    });
  },

  /**
   * Materializes real-time telemetry for a specific asset.
   */
  async getPropertyAssetPulse(propertyId: string, organizationId: string, timeframe: string = 'ALL_TIME') {
    const now = new Date();
    let dateFilter: any = {};

    if (timeframe === 'MONTHLY') {
      dateFilter = {
        transactionDate: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        }
      };
    } else if (timeframe === 'YEARLY') {
      dateFilter = {
        transactionDate: {
          gte: new Date(now.getFullYear(), 0, 1),
          lte: new Date(now.getFullYear(), 11, 31, 23, 59, 59)
        }
      };
    }

    // Find all active tenants for this property to include their transactions in KPIs
    const propertyTenants = await prisma.lease.findMany({
      where: { unit: { propertyId }, isActive: true, deletedAt: null },
      select: { tenantId: true }
    });
    const tenantIds = propertyTenants.map(l => l.tenantId).filter(Boolean);

    const assetFilter: any = {
      OR: [
        { propertyId },
        { tenantId: { in: tenantIds } }
      ]
    };

    const [property, units, revenueAgg, opexAgg, chargeAgg] = await Promise.all([
      prisma.property.findUnique({ where: { id: propertyId, organizationId } }),
      prisma.unit.findMany({
        where: { propertyId, organizationId },
        include: { leases: { where: { isActive: true }, include: { tenant: { select: { id: true, name: true } } } } }
      }),
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { 
          ...assetFilter,
          organizationId, 
          status: 'ACTIVE',
          account: { category: 'INCOME' }, 
          ...dateFilter 
        }
      }),
      prisma.ledgerEntry.aggregate({
        _sum: { amount: true },
        where: { 
          ...assetFilter,
          organizationId, 
          status: 'ACTIVE',
          account: { category: 'EXPENSE' }, 
          ...dateFilter 
        }
      }),
      prisma.charge.aggregate({
        _sum: { amount: true, amountPaid: true },
        where: { 
          organizationId, 
          OR: [
            { lease: { unit: { propertyId } } },
            { tenantId: { in: tenantIds } }
          ],
          ...(timeframe !== 'ALL_TIME' ? { dueDate: dateFilter.transactionDate } : {})
        }
      })
    ]);

    if (!property) throw new Error("ERR_ASSET_ABSENT");

    const revenue = Math.abs(Number(revenueAgg._sum.amount || 0));
    const opex = Math.abs(Number(opexAgg._sum.amount || 0));
    const noi = revenue - opex;

    const totalCharged = Number(chargeAgg._sum.amount || 0);
    const totalPaid = Number(chargeAgg._sum.amountPaid || 0);
    const collectionEfficiency = totalCharged > 0 ? (totalPaid / totalCharged) * 100 : 100;

    // Scale static metrics by timeframe
    const multiplier = timeframe === 'YEARLY' ? 12 : 1;

    const grossPotential = units.reduce((sum, u) => sum + Number(u.marketRent || 0), 0) * multiplier;
    const actualBilled = units.reduce((sum, u) => sum + (u.leases[0] ? Number(u.leases[0].rentAmount || 0) : 0), 0) * multiplier;
    const leakagePercent = grossPotential > 0 ? ((grossPotential - actualBilled) / grossPotential) * 100 : 0;

    return {
      hud: {
        noi,
        grossPotential,
        revenueLeakage: leakagePercent,
        collectionEfficiency: collectionEfficiency
      },
      waterfall: { revenue, opex, capex: 0, netCash: noi },
      units: units.map((u: any) => ({
        id: u.id,
        unitNumber: u.unitNumber,
        tenantName: u.leases[0]?.tenant?.name || 'VACANT',
        riskScore: u.leases.length > 0 ? 'GREEN' : 'RED',
        occupancy: u.leases.length > 0,
        maintenanceStatus: u.maintenanceStatus
      }))
    };
  }
};
