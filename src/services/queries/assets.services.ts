import { getSovereignClient } from "@/src/lib/db";
import { AccountCategory, EntryStatus, Prisma } from "@prisma/client";

/**
 * ASSET COMMAND SERVICES (QUERY LAYER)
 * 
 * Materializes portfolio-level telemetry for the Asset Command Center.
 * Mandate: Property-level grouping, Monthly Collected Income aggregation, 
 * and pre-computed Clinical Status derivation.
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

export async function getPortfolioSummaryService(context: { operatorId: string, organizationId: string }): Promise<PortfolioSummary> {
  const db = getSovereignClient(context.operatorId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // 1. Fetch raw property matrix
  const properties = await db.property.findMany({
    where: { organizationId: context.organizationId },
    include: {
      ledgerEntries: {
        where: {
          organizationId: context.organizationId,
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

  // 2. Transform into Hierarchical Asset DTO
  const mappedProperties: AssetProperty[] = properties.map((p: any) => {
    let propCollected = 0;
    
    const mappedUnits: AssetUnit[] = p.units.map((u: any) => {
      const activeLease = u.leases[0];
      const unitTenantId = activeLease?.tenant?.id;

      // Map property-level entries to this specific unit via Tenant ID
      const unitEntries = unitTenantId 
        ? p.ledgerEntries.filter((e: any) => e.tenantId === unitTenantId)
        : [];
      
      const unitIncome = unitEntries.reduce((sum: number, entry: any) => sum + Math.abs(Number(entry.amount)), 0);
      propCollected += unitIncome;

      // Clinical Status Logic
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

  // 3. Portfolio-wide Telemetry
  const totalAssets = mappedProperties.length;
  const totalCapacity = mappedProperties.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalActiveLeases = mappedProperties.reduce((sum, p) => sum + p.activeLeases, 0);
  const netCollectedIncome = mappedProperties.reduce((sum, p) => sum + p.collectedIncome, 0);

  return {
    totalAssets,
    totalCapacity,
    blendedOccupancy: totalCapacity > 0 ? (totalActiveLeases / totalCapacity) * 100 : 0,
    netCollectedIncome,
    properties: mappedProperties
  };
}

/**
 * SIDEBAR HYDRATION
 */
export async function getSidebarPropertiesService(context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);
  return db.property.findMany({
    where: { organizationId: context.organizationId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });
}

/**
 * SOVEREIGN VIEWPORT HYDRATION
 */
export async function getPropertySovereignViewService(propertyId: string, context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const property = await db.property.findUnique({
    where: { id: propertyId, organizationId: context.organizationId },
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
          organizationId: context.organizationId,
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
  // Estimate portfolio value (Base rent sum from active leases)
  const portfolioValue = property.units.reduce((sum: number, u: any) => {
    return sum + (u.leases[0] ? Number(u.leases[0].rentAmount) : 0);
  }, 0);

  // Strictly pick only the required fields to prevent Prisma metadata leakage
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
}

/**
 * UNIT FORENSIC LEDGER SYNC
 */
export async function getUnitLedgerFeedService(unitId: string, context: { operatorId: string, organizationId: string }) {
  const db = getSovereignClient(context.operatorId);
  
  // Resolve all historic and active tenant occupancies for this specific unit
  const unit = await db.unit.findUnique({
    where: { id: unitId, organizationId: context.organizationId },
    include: { leases: { select: { tenantId: true } } }
  });

  if (!unit) return [];

  const tenantIds = unit.leases.map((l: any) => l.tenantId);

  // Materialize the absolute ledger across all tenant timelines linked to this unit
  return await db.ledgerEntry.findMany({
    where: {
      organizationId: context.organizationId,
      OR: [
        { tenantId: { in: tenantIds } },
        { unitId: unitId }
      ]
    },
    orderBy: { transactionDate: 'desc' },
    select: {
      id: true,
      transactionDate: true,
      description: true,
      amount: true,
      paymentMode: true,
      status: true,
      account: { select: { category: true } }
    }
  });
}
