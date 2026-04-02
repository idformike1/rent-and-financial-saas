import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    let properties = await prisma.property.findMany()
    if (properties.length === 0) {
      const defaultProp = await prisma.property.create({
        data: { name: "The Citadel Building", address: "001 Enterprise Way" }
      })
      properties = [defaultProp]
    }

    let subCategories = await prisma.expenseCategory.findMany({
      where: { parentId: { not: null } }
    })

    if (subCategories.length === 0) {
       return NextResponse.json({ error: 'No sub-categories found. Please run the category seeder first (/api/seed-categories).' }, { status: 400 })
    }

    let account = await prisma.account.findFirst({ where: { category: 'EXPENSE' } })
    if (!account) {
      account = await prisma.account.create({
        data: { name: "Master Operational Expense", category: 'EXPENSE' }
      })
    }

    const payees = ['City Water Corp', 'Energy Grid', 'Handyman Joes', 'Security Experts', 'Cleaning Pros', 'Amazon Business', 'Home Depot', 'Local Grocery', 'Starbucks', 'Apple Store']

    const randomDate = (start: Date, end: Date) => {
      return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    }

    const entries = []
    for (let i = 0; i < 100; i++) {
        const subCat = subCategories[Math.floor(Math.random() * subCategories.length)]
        const property = subCat.scope === 'PROPERTY' ? properties[Math.floor(Math.random() * properties.length)] : null
        const amount = new Prisma.Decimal(Math.floor(Math.random() * 500) + 20)
        const date = randomDate(new Date(2025, 0, 1), new Date())
        const payee = payees[Math.floor(Math.random() * payees.length)]
        
        entries.push({
          transactionId: `TX-${Math.random().toString(36).substring(7).toUpperCase()}`,
          accountId: account.id,
          amount,
          date,
          transactionDate: date,
          description: `Testing expense entry #${i+1} for ${subCat.name}`,
          paymentMode: i % 5 === 0 ? 'CASH' : 'BANK',
          expenseCategoryId: subCat.id,
          propertyId: property ? property.id : null,
          payee: payee
        } as any)
    }

    // Batch create
    for (const entry of entries) {
        await prisma.ledgerEntry.create({ data: entry });
    }

    return NextResponse.json({ success: true, count: entries.length })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
