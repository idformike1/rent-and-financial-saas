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
  console.log("🚀 Initializing Ledger Remediation Protocol: AX-REM-2026");

  // Identification criteria for orphans:
  // - Income type (amount > 0)
  // - Currently ACTIVE
  // - Lacking tenantId OR propertyId
  const result = await prisma.ledgerEntry.updateMany({
    where: {
      amount: { gt: 0 },
      status: 'ACTIVE',
      OR: [
        { tenantId: null },
        { propertyId: null }
      ]
    },
    data: {
      status: 'VOIDED'
    }
  });

  console.log(`✅ REMEDIATION COMPLETE`);
  console.log(`- TARGET: Income Orphans (NULL tenantId/propertyId)`);
  console.log(`- ACTION: Soft Voided (status: VOIDED)`);
  console.log(`- IMPACT: ${result.count} records remediated`);
  
  if (result.count === 0) {
    console.warn("⚠️ WARNING: No records matched the remediation criteria.");
  }
}

main()
  .catch((e) => {
    console.error('❌ REMEDIATION CRITICAL FAILURE:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
