import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = `${process.env.DIRECT_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const units = await prisma.unit.findMany({
    include: {
      organization: true
    }
  });
  console.log('UNITS_AUDIT:', JSON.stringify(units, null, 2));

  const orgs = await prisma.organization.findMany();
  console.log('ORGS_AUDIT:', JSON.stringify(orgs, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
