import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: { organization: true }
  });
  console.log("USERS:", JSON.stringify(users, null, 2));

  const orgs = await prisma.organization.findMany();
  console.log("ORGANIZATIONS:", JSON.stringify(orgs, null, 2));
}

main().finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
