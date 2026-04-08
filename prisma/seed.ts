import { PrismaClient, AccountCategory, PaymentMode } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Initializing Axiom 2026 Telemetry Seed Engine...");

  // 1. Identify Target Organization
  // We'll target the first user's organization which is typically the testing account
  const user = await prisma.user.findFirst({
    include: { organization: true },
    orderBy: { createdAt: 'asc' }
  });

  if (!user || !user.organization) {
    console.error("❌ CRTICAL ERROR: No master organization found. Please sign up first.");
    process.exit(1);
  }

  const orgId = user.organization.id;
  console.log(`✅ Target Locked: ${user.organization.name} (${orgId})`);

  // 2. Nuclear Purge: Clean existing Ledger telemetry to prevent contamination
  console.log("🧹 Purging existing ledger entries...");
  await prisma.ledgerEntry.deleteMany({
    where: { organizationId: orgId }
  });

  // 3. Treasury Verification: Ensure INCOME and EXPENSE accounts exist
  let incomeAccount = await prisma.account.findFirst({
    where: { organizationId: orgId, category: AccountCategory.INCOME }
  });

  if (!incomeAccount) {
    incomeAccount = await prisma.account.create({
      data: {
        organizationId: orgId,
        name: 'General Revenue Treasury',
        category: AccountCategory.INCOME
      }
    });
    console.log("✅ Created INCOME treasury node.");
  }

  let expenseAccount = await prisma.account.findFirst({
    where: { organizationId: orgId, category: AccountCategory.EXPENSE }
  });

  if (!expenseAccount) {
    expenseAccount = await prisma.account.create({
      data: {
        organizationId: orgId,
        name: 'Operating Expenditures',
        category: AccountCategory.EXPENSE
      }
    });
    console.log("✅ Created EXPENSE treasury node.");
  }

  // 4. Temporal Sequence Generation
  const entries = [];
  const TOTAL_ENTRIES = 300;
  const now = new Date();
  const pastYear = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

  console.log(`⏳ Synthesizing ${TOTAL_ENTRIES} entries across 365 day temporal window...`);

  for (let i = 0; i < TOTAL_ENTRIES; i++) {
    // Generate an evenly distributed random date within the last 365 days
    const randomDate = new Date(pastYear.getTime() + Math.random() * (now.getTime() - pastYear.getTime()));
    
    // Probabilistic Flow Distribution: 40% Inflow, 60% Outflow
    const isInflow = Math.random() < 0.40;
    
    let amount = 0;
    let description = '';
    let accountId = '';
    
    if (isInflow) {
      accountId = incomeAccount.id;
      // Revenue Generation: Highly variable positive amounts ($500 to $15,000)
      amount = Math.floor(Math.random() * 14500) + 500; // 500 to 15,000
      
      const revenueSources = ['Stripe Payout', 'Mercury Capital Deposit', 'ACH Transfer (Client)', 'Wire Transfer (Holding)'];
      description = revenueSources[Math.floor(Math.random() * revenueSources.length)];
    } else {
      accountId = expenseAccount.id;
      const expenseProbability = Math.random();
      
      // Outflow Generation rules via probability distribution
      if (expenseProbability < 0.13) {
        // Payroll (~13% of 60% outflow = ~23 entries -> Roughly 2x/month)
        amount = -(Math.floor(Math.random() * 60000) + 20000); // -20k to -80k
        description = Math.random() > 0.5 ? 'Gusto Payroll Integration' : 'Deel Global Contractors';
      } else if (expenseProbability < 0.23) {
        // Infrastructure (~10% of 60% outflow = ~18 entries)
        amount = -(Math.floor(Math.random() * 8000) + 2000); // -2k to -10k
        description = Math.random() > 0.5 ? 'Amazon Web Services (AWS)' : 'Google Cloud Platform';
      } else {
        // Operating SaaS / Micro-expenses (Bulk of entries)
        amount = -(Math.floor(Math.random() * 450) + 50); // -50 to -500
        const saas = ['Linear Subscription', 'Notion Team Plan', 'GitHub Copilot', 'Vercel Pro', 'Figma Organization', 'Slack Enterprise'];
        description = saas[Math.floor(Math.random() * saas.length)];
      }
    }

    entries.push({
      organizationId: orgId,
      transactionId: `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      accountId: accountId,
      amount: amount,
      transactionDate: randomDate,
      date: randomDate,
      description: description,
      paymentMode: PaymentMode.BANK // Workstation defaults to digital flows
    });
  }

  // 5. Batch Execution
  console.log("💾 Writing telemetry matrix to Prisma backend...");
  await prisma.ledgerEntry.createMany({
    data: entries
  });

  console.log(`✅ SUCCESS: System seeded with ${entries.length} realistic fiscal parameters.`);
}

main()
  .catch((e) => {
    console.error("❌ EXCEPTION OVERRIDE:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
