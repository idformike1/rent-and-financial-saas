import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Initializing Ledger Sanitization Protocol: AX-PURGE-2026");

  // Target: Forensic identified income orphans (lacking tenant/property links)
  // This operation per user directive is a PERMANENT HARD DELETE.
  const result = await prisma.ledgerEntry.deleteMany({
    where: {
      amount: { gt: 0 },
      OR: [
        { tenantId: null },
        { propertyId: null }
      ]
    }
  });

  console.log(`✅ SANITIZATION COMPLETE`);
  console.log(`- TARGET: 139 Income Orphans (NULL tenantId/propertyId)`);
  console.log(`- ACTION: Permanent Hard Delete (Irreversible)`);
  console.log(`- RECORDS EXCISED: ${result.count}`);
  
  if (result.count === 0) {
    console.warn("⚠️ WARNING: No records matched the sanitization criteria.");
  }
}

main()
  .catch((e) => {
    console.error('❌ SANITIZATION CRITICAL FAILURE:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
