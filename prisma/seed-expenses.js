const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('--- SEEDING 100 EXPENSES (JS) ---')

  const properties = await prisma.property.findMany()
  if (properties.length === 0) {
    console.log('No properties found.')
    return
  }

  const subCategories = await prisma.expenseCategory.findMany({
    where: {
      parentId: { not: null }
    }
  })

  if (subCategories.length === 0) {
    console.log('No sub-categories found.')
    return
  }

  const account = (await prisma.account.findFirst({ where: { category: 'EXPENSE' } })) || 
                  (await prisma.account.findFirst({ where: { category: 'ASSET' } }))

  if (!account) {
    console.log('No accounts found.')
    return
  }

  const payees = ['City Water Corp', 'Energy Grid', 'Handyman Joes', 'Security Experts', 'Cleaning Pros', 'Amazon Business', 'Home Depot', 'Local Grocery', 'Starbucks', 'Apple Store']

  const randomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  }

  const expenses = []
  for (let i = 0; i < 100; i++) {
    const subCat = subCategories[Math.floor(Math.random() * subCategories.length)]
    const property = subCat.scope === 'PROPERTY' ? properties[Math.floor(Math.random() * properties.length)] : null
    const amount = Math.floor(Math.random() * 500) + 20
    const date = randomDate(new Date(2025, 0, 1), new Date())
    const payee = payees[Math.floor(Math.random() * payees.length)]
    
    expenses.push({
      transactionId: `TX-${Math.random().toString(36).substring(7).toUpperCase()}`,
      accountId: account.id,
      amount: amount,
      date: date,
      transactionDate: date,
      description: `Testing expense entry #${i+1} for ${subCat.name}`,
      paymentMode: i % 5 === 0 ? 'CASH' : 'BANK',
      expenseCategoryId: subCat.id,
      propertyId: property ? property.id : null,
      payee: payee
    })
  }

  for (const exp of expenses) {
    await prisma.ledgerEntry.create({
      data: exp
    })
  }

  console.log(`Successfully seeded 100 expenses.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
