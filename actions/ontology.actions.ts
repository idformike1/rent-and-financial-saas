'use server'

import prisma from "@/lib/prisma"
import { runSecureServerAction } from "@/lib/auth-utils"

export async function fetchDetailedOntology() {
  return runSecureServerAction('MANAGER', async (session) => {
    const orgId = session.organizationId;

    // 1. Fetch Organization
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true }
    });

    if (!org) throw new Error("Organization not found");

    // 2. Fetch Buildings with their related Tenants (via Leases) and Expenses
    const buildings = await prisma.property.findMany({
      where: { organizationId: orgId },
      include: {
        units: {
          include: {
            leases: {
              where: { isActive: true },
              include: {
                tenant: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        },
        ledgerEntries: {
          where: {
            organizationId: orgId,
            OR: [
              { account: { category: 'EXPENSE' } },
              { expenseCategoryId: { not: null } }
            ]
          },
          select: {
            id: true,
            description: true,
            amount: true,
            transactionDate: true,
            expenseCategory: {
              select: { name: true }
            }
          },
          orderBy: { transactionDate: 'desc' },
          take: 10 
        }
      }
    });

    // 3. Fetch Corporate Overhead (Expenses with no propertyId)
    const corporateExpenses = await prisma.ledgerEntry.findMany({
      where: {
        organizationId: orgId,
        propertyId: null,
        OR: [
          { account: { category: 'EXPENSE' } },
          { expenseCategoryId: { not: null } }
        ]
      },
      select: {
        id: true,
        description: true,
        amount: true,
        transactionDate: true,
        expenseCategory: {
          select: { name: true }
        }
      },
      orderBy: { transactionDate: 'desc' },
      take: 20
    });

    // Transform buildings to include unique tenants and mapped expenses
    const mappedBuildings = buildings.map((b: any) => {
      const tenantsMap = new Map<string, string>();
      b.units.forEach((u: any) => {
        u.leases.forEach((l: any) => {
          if (l.tenant) {
            tenantsMap.set(l.tenant.id, l.tenant.name);
          }
        });
      });

      return {
        id: b.id,
        name: b.name,
        type: 'BUILDING',
        tenants: Array.from(tenantsMap.entries()).map(([id, name]) => ({ id, name, type: 'TENANT' })),
        expenses: b.ledgerEntries.map((e: any) => ({ 
          ...e, 
          name: e.description || e.expenseCategory?.name || 'Uncategorized OPEX',
          type: 'EXPENSE' 
        }))
      };
    });

    return {
      root: {
        id: org.id,
        name: org.name,
        type: 'ORGANIZATION',
        children: [
          {
            id: 'asset-portfolio',
            name: 'Asset Portfolio',
            type: 'CATEGORY',
            children: mappedBuildings
          },
          {
            id: 'corporate-overhead',
            name: 'Corporate Overhead',
            type: 'CATEGORY',
            children: corporateExpenses.map((e: any) => ({ 
              ...e, 
              name: e.description || e.expenseCategory?.name || 'Corporate Overhead Entry',
              type: 'EXPENSE' 
            }))
          }
        ]
      }
    };
  });
}
