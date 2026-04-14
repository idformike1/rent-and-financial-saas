const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.ledgerEntry.count();
    const users = await prisma.user.count();
    console.log(`LEDGER_COUNT: ${count}`);
    console.log(`USER_COUNT: ${users}`);
    
    if (count > 0) {
      const sample = await prisma.ledgerEntry.findFirst({
        include: { property: true, tenant: true }
      });
      console.log('SAMPLE_TX:', JSON.stringify(sample, null, 2));
    }
  } catch (err) {
    console.error('DB_ERROR:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
