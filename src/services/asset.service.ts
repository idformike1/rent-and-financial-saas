import { getSovereignClient } from "@/src/lib/db";
import { Property, Unit, AccountCategory, EntryStatus, Prisma } from '@prisma/client';
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
        charge: { lease: { unitId } }
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
          where: { maintenanceStatus: { not: 'DECOMMISSIONED' } },
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
          tenant: l.tenant ? { name: l.tenant.name } : null
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

  async deleteProperty(propertyId: string, context: { operatorId: string, organizationId: string }) {
    const db = getSovereignClient(context.organizationId);
    return await db.$transaction(async (tx: any) => {
      // Soft deletion is preferred for financial integrity
      const result = await tx.property.delete({
        where: { id: propertyId, organizationId: context.organizationId }
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
  async getPropertyAssetPulse(propertyId: string, organizationId: string) {
    const db = getSovereignClient(organizationId);

    const property = await db.property.findUnique({ where: { id: propertyId, organizationId } });
    const units = await db.unit.findMany({
      where: { propertyId, organizationId },
      include: { leases: { where: { isActive: true }, include: { tenant: { select: { name: true } } } } }
    });
    const revenueAgg = await db.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { propertyId, organizationId, account: { category: AccountCategory.INCOME } }
    });
    const opexAgg = await db.ledgerEntry.aggregate({
      _sum: { amount: true },
      where: { propertyId, organizationId, account: { category: AccountCategory.EXPENSE } }
    });
    const chargeAgg = await db.charge.aggregate({
      _sum: { amount: true, amountPaid: true },
      where: { organizationId, lease: { unit: { propertyId } } }
    });


    if (!property) throw new Error("ERR_ASSET_ABSENT");

    const revenue = Math.abs(Number(revenueAgg._sum.amount || 0));
    const opex = Math.abs(Number(opexAgg._sum.amount || 0));
    const noi = revenue - opex;

    const totalCharged = Number(chargeAgg._sum.amount || 0);
    const totalPaid = Number(chargeAgg._sum.amountPaid || 0);
    const collectionEfficiency = totalCharged > 0 ? (totalPaid / totalCharged) * 100 : 100;

    const grossPotential = units.reduce((sum, u) => sum + Number(u.marketRent || 0), 0);
    const actualBilled = units.reduce((sum, u) => sum + (u.leases[0] ? Number(u.leases[0].rentAmount || 0) : 0), 0);
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
