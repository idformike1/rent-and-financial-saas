import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const categories = [
      { name: 'UTILITIES', scope: 'PROPERTY', children: ['WATER', 'ELECTRICITY', 'WASTE'] },
      { name: 'MAINTENANCE', scope: 'PROPERTY', children: ['ROOFING', 'PLUMBING', 'ELECTRICAL', 'HVAC'] },
      { name: 'ADMINISTRATIVE', scope: 'PROPERTY', children: ['LEGAL', 'INSURANCE', 'ADVERTISING'] },
      { name: 'HOUSEHOLD', scope: 'HOME', children: ['GROCERIES', 'INTERNET', 'REPAIRS'] },
      { name: 'LIFESTYLE', scope: 'PERSONAL', children: ['DINING', 'TRAVEL', 'SUBSCRIPTIONS'] }
    ]

    for (const cat of categories) {
      let parent = await prisma.expenseCategory.findFirst({
        where: { name: cat.name, scope: cat.scope as any, parentId: null }
      })

      if (!parent) {
        parent = await prisma.expenseCategory.create({
          data: { name: cat.name, scope: cat.scope as any }
        })
      }

      for (const child of cat.children) {
        const existingChild = await prisma.expenseCategory.findFirst({
           where: { name: child, scope: cat.scope as any, parentId: parent.id }
        })
        if (!existingChild) {
          await prisma.expenseCategory.create({
            data: { name: child, scope: cat.scope as any, parentId: parent.id }
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Categories seeded' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
