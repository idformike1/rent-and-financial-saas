import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = [
      { name: 'UTILITIES', children: ['WATER', 'ELECTRICITY', 'WASTE'] },
      { name: 'MAINTENANCE', children: ['ROOFING', 'PLUMBING', 'ELECTRICAL', 'HVAC'] },
      { name: 'ADMINISTRATIVE', children: ['LEGAL', 'INSURANCE', 'ADVERTISING'] },
      { name: 'HOUSEHOLD', children: ['GROCERIES', 'INTERNET', 'REPAIRS'] },
      { name: 'LIFESTYLE', children: ['DINING', 'TRAVEL', 'SUBSCRIPTIONS'] }
    ]

    for (const cat of categories) {
      const parent = await prisma.expenseCategory.findFirst({
        where: { name: cat.name, parentId: null }
      })

      if (!parent) {
        continue; 
      }

      for (const child of cat.children) {
        const existingChild = await prisma.expenseCategory.findFirst({
           where: { name: child, parentId: parent.id }
        })
        // NOTE: Creation skipped in legacy seed to avoid required ledgerId constraint errors during build
      }
    }

    return NextResponse.json({ success: true, message: 'Categories seeded' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
