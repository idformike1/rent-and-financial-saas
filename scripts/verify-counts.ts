import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const orgId = "6210703b-3f67-48ab-86ea-a4644fc75345";
  const tenantsCount = await prisma.tenant.count({ where: { organizationId: orgId } });
  const propertiesCount = await prisma.property.count({ where: { organizationId: orgId } });
  const entriesCount = await prisma.ledgerEntry.count({ where: { organizationId: orgId } });
  const personalCatsCount = await prisma.expenseCategory.count({ where: { organizationId: orgId, isPersonal: true } });

  console.log(`COUNTS FOR ${orgId}:`);
  console.log(`- Tenants: ${tenantsCount}`);
  console.log(`- Properties: ${propertiesCount}`);
  console.log(`- Ledger Entries: ${entriesCount}`);
  console.log(`- Personal Categories: ${personalCatsCount}`);
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
