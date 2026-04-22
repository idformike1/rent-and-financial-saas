import { PrismaClient, EntryType, AccountCategory } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DIRECT_URL || `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("─── WEALTH STRESS TEST: INITIATING HIGH-DENSITY INJECTION ───");

  // 1. Find the active WEALTH organization
  const wealthOrg = await prisma.organization.findFirst({
    where: {
      name: {
        contains: 'Wealth',
        mode: 'insensitive'
      }
    }
  });

  if (!wealthOrg) {
    console.error("❌ FATAL: Wealth Organization not found. Please ensure a workspace with 'Wealth' in its name exists.");
    process.exit(1);
  }

  console.log(`📍 Targeted Organization: ${wealthOrg.name} [${wealthOrg.id}]`);

  // 2. Ensure valid wealth accounts exist
  let checkingAccount = await prisma.account.findFirst({
    where: { name: "Checking", organizationId: wealthOrg.id }
  });
  if (!checkingAccount) {
    checkingAccount = await prisma.account.create({
      data: { 
        name: "Checking", 
        category: AccountCategory.ASSET, 
        organizationId: wealthOrg.id,
        isSystem: true
      }
    });
  }

  let vacationFund = await prisma.account.findFirst({
    where: { name: "Vacation Fund", organizationId: wealthOrg.id }
  });
  if (!vacationFund) {
    vacationFund = await prisma.account.create({
      data: { 
        name: "Vacation Fund", 
        category: AccountCategory.ASSET, 
        organizationId: wealthOrg.id,
        isSystem: true
      }
    });
  }

  console.log(`✅ Accounts Verified: [Checking] -> [Vacation Fund]`);

  // 3. Injection Loop
  const TOTAL_RECORDS = 300;
  console.log(`🚀 Injecting ${TOTAL_RECORDS} historical internal transfers...`);

  const now = new Date();

  for (let i = 0; i < TOTAL_RECORDS; i++) {
    const amount = Math.floor(Math.random() * (500 - 10 + 1)) + 10;
    
    // Spread across last 12 months for dense time-series data
    const date = new Date(now);
    date.setMonth(now.getMonth() - Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

    await prisma.$transaction(async (tx) => {
      // Establish RLS context (Sovereign Security Pattern)
      await tx.$executeRawUnsafe(`SELECT set_config('app.current_tenant_id', '${wealthOrg.id}', true)`);

      const transaction = await tx.transaction.create({
        data: {
          organizationId: wealthOrg.id,
          description: `Internal Transfer: Stress Test Entry #${i + 1}`,
          date: date,
        }
      });

      // Source Deduction (CREDIT to Asset)
      await tx.ledgerEntry.create({
        data: {
          organizationId: wealthOrg.id,
          transactionId: transaction.id,
          accountId: checkingAccount!.id,
          amount: -amount,
          type: EntryType.CREDIT,
          description: `Transfer Out: Vacation Fund Seed`,
          transactionDate: date,
        }
      });

      // Destination Credit (DEBIT to Asset)
      await tx.ledgerEntry.create({
        data: {
          organizationId: wealthOrg.id,
          transactionId: transaction.id,
          accountId: vacationFund!.id,
          amount: amount,
          type: EntryType.DEBIT,
          description: `Transfer In: Vacation Fund Seed`,
          transactionDate: date,
        }
      });
    });

    if ((i + 1) % 50 === 0) {
      console.log(`▓▓ Injected ${i + 1}/${TOTAL_RECORDS} historical records...`);
    }
  }

  console.log("Stress Test Complete. 300 Records Injected.");
}

main()
  .catch((e) => {
    console.error("❌ STRESS TEST FAILURE:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
