'use server'

import prisma from '@/lib/prisma'

export async function deepScanSystem(query: string) {
  if (!query || query.length < 3) return { success: true, data: [] }

  try {
    const [tenants, categories, units] = await Promise.all([
      prisma.tenant.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ]
        },
        take: 5
      }),
      (prisma as any).expenseCategory.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        take: 5
      }),
      prisma.unit.findMany({
        where: {
          unitNumber: { contains: query, mode: 'insensitive' }
        },
        take: 5
      })
    ])

    const results = [
      ...tenants.map((t: any) => ({ id: t.id, title: t.name, type: 'TENANT', href: `/tenants/${t.id}`, description: t.email })),
      ...categories.map((c: any) => ({ id: c.id, title: c.name, type: 'GOVERNANCE', href: '/settings/categories', description: 'Expense Category' })),
      ...units.map((u: any) => ({ id: u.id, title: `Unit ${u.unitNumber}`, type: 'ASSET', href: '/properties', description: u.type })),
    ]

    return { success: true, data: results }
  } catch (error: any) {
    console.error('Deep Scan Error:', error)
    return { success: false, error: 'Quantum Search Failure' }
  }
}
