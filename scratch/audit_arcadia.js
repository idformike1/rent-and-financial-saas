
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = "postgres://postgres.tvkcfxrfptnkeyazizge:Fohori@Bacha@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const properties = await prisma.property.findMany({
    where: { name: { contains: 'Arcadia' } },
    select: { id: true, name: true, address: true, organizationId: true }
  });
  console.log(JSON.stringify(properties, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
