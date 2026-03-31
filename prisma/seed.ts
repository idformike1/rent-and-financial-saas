import { PrismaClient, AccountCategory } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding Chart of Accounts...')

  const accounts = [
    { name: 'Bank Checking (Chase)', category: AccountCategory.ASSET },
    { name: 'Cash in Hand', category: AccountCategory.ASSET },
    { name: 'Savings Reserve', category: AccountCategory.ASSET },
    { name: 'Rental Revenue', category: AccountCategory.INCOME },
    { name: 'Utility Recovery (Water)', category: AccountCategory.INCOME },
    { name: 'Utility Recovery (Elec)', category: AccountCategory.INCOME },
    { name: 'Late Fee Revenue', category: AccountCategory.INCOME },
    { name: 'Master Water Bill', category: AccountCategory.EXPENSE },
    { name: 'Master Elec Bill', category: AccountCategory.EXPENSE },
    { name: 'Maintenance Expense', category: AccountCategory.EXPENSE },
    { name: 'Owner Draw', category: AccountCategory.EXPENSE },
  ]

  for (const acc of accounts) {
    await prisma.account.create({ // Assuming a constraint or just creating them. We'll simply create.
      data: acc
    })
  }
  
  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
