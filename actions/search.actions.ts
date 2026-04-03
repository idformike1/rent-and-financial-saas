'use server'

import prisma from "@/lib/prisma"
import { runSecureServerAction } from '@/lib/auth-utils'

export type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: 'PROPERTY' | 'UNIT' | 'TENANT' | 'EXPENSE';
  href: string;
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  return runSecureServerAction('MANAGER', async (session) => {
    if (query.length < 3) return []
    const orgId = session.organizationId
  const results: SearchResult[] = []

  // 1. Search Properties
  const properties = await prisma.property.findMany({
    where: {
      organizationId: orgId,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
  })
  properties.forEach((p: any) => results.push({
    id: p.id,
    title: p.name,
    subtitle: p.address,
    type: 'PROPERTY',
    href: `/properties`, // Adjust if specific property pages exist
  }))

  // 2. Search Tenants
  const tenants = await prisma.tenant.findMany({
    where: {
      organizationId: orgId,
      name: { contains: query, mode: 'insensitive' },
      isDeleted: false,
    },
    take: 5,
  })
  tenants.forEach((t: any) => results.push({
    id: t.id,
    title: t.name,
    subtitle: `Tenant ID: ${t.id.slice(0, 8)}`,
    type: 'TENANT',
    href: `/tenants/${t.id}`,
  }))

  // 3. Search Units
  const units = await prisma.unit.findMany({
    where: {
      organizationId: orgId,
      unitNumber: { contains: query, mode: 'insensitive' },
    },
    include: { property: true },
    take: 5,
  })
  units.forEach((u: any) => results.push({
    id: u.id,
    title: `Unit ${u.unitNumber}`,
    subtitle: u.property.name,
    type: 'UNIT',
    href: `/properties`, // Adjust if specific unit pages exist
  }))

  // 4. Search Ledger Entries (Expenses/Income)
  const ledger = await prisma.ledgerEntry.findMany({
    where: {
      organizationId: orgId,
      OR: [
        { description: { contains: query, mode: 'insensitive' } },
        { payee: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 5,
  })
  ledger.forEach((l: any) => results.push({
    id: l.id,
    title: l.description || 'Ledger Entry',
    subtitle: l.payee || `$${l.amount.toString()}`,
    type: 'EXPENSE',
    href: `/reports/master-ledger`,
  }))

  return results
  });
}
