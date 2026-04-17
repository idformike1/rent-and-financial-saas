
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const databaseUrl = "postgres://postgres.tvkcfxrfptnkeyazizge:Fohori@Bacha@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'admin@system.com' },
    select: { organizationId: true }
  });
  console.log(JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
