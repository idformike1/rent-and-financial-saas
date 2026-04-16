const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Management Fees", type: "EXPENSE", isPersonal: false },
    { name: "Maintenance & Repairs", type: "EXPENSE", isPersonal: false },
    { name: "Property Insurance", type: "EXPENSE", isPersonal: false },
    { name: "Utilities", type: "EXPENSE", isPersonal: false },
    { name: "Property Tax", type: "EXPENSE", isPersonal: false },
    { name: "Market Rent", type: "INCOME", isPersonal: false },
    { name: "Owner Draw", type: "EXPENSE", isPersonal: true },
    { name: "Personal Travel", type: "EXPENSE", isPersonal: true },
    { name: "Tax Preparation", type: "EXPENSE", isPersonal: true },
  ];

  console.log('--- SEEDING EXPENSE CATEGORIES ---');

  for (const cat of categories) {
    const record = await prisma.expenseCategory.upsert({
      where: { id: `seed-${cat.name.replace(/\s+/g, '-').toLowerCase()}` },
      update: {
        type: cat.type,
        isPersonal: cat.isPersonal,
      },
      create: {
        id: `seed-${cat.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: cat.name,
        type: cat.type,
        isPersonal: cat.isPersonal,
      },
    });
    console.log(`+ Created/Updated: ${record.name} [Personal: ${record.isPersonal}]`);
  }

  console.log('--- SEEDING COMPLETE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
