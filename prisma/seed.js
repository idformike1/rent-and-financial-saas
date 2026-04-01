const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

async function main() {
  const connectionString = "postgresql://postgres.tvkcfxrfptnkeyazizge:Fohori@Bacha@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('🚀 INITIALIZING DEEP FINANCIAL SEED...')

  // 1. Chart of Accounts
  const accountsData = [
    { name: 'Bank Checking (Chase)', category: 'ASSET' },
    { name: 'Cash in Hand', category: 'ASSET' },
    { name: 'Savings Reserve', category: 'ASSET' },
    { name: 'Rental Revenue', category: 'INCOME' },
    { name: 'Utility Recovery (Water)', category: 'INCOME' },
    { name: 'Master Water Bill', category: 'EXPENSE' },
    { name: 'Maintenance Expense', category: 'EXPENSE' },
  ]

  const accountMap = {};
  for (const acc of accountsData) {
    const existing = await prisma.account.findFirst({ where: { name: acc.name } });
    if (!existing) {
      const created = await prisma.account.create({ data: acc });
      accountMap[acc.name] = created.id;
    } else {
      accountMap[acc.name] = existing.id;
    }
  }

  // 2. 5 Units
  console.log('🏗️  Creating 5 Units...')
  const units = [];
  for (let i = 1; i <= 5; i++) {
    const unitNumber = `B10${i}`;
    let u = await prisma.unit.findFirst({ where: { unitNumber } });
    if (!u) {
      u = await prisma.unit.create({
        data: {
          unitNumber,
          propertyId: 'PROP-001',
          type: 'Apartment',
          maintenanceStatus: 'OPERATIONAL'
        }
      });
    }
    units.push(u);
  }

  // 3. 3 Active Tenants
  console.log('👥 Creating 3 Tenants & Historical Leases...')
  const now = new Date();
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  for (let i = 0; i < 3; i++) {
    const tenant = await prisma.tenant.create({
      data: { name: `Strategic Tenant ${i + 1}` }
    });

    const lease = await prisma.lease.create({
      data: {
        tenantId: tenant.id,
        unitId: units[i].id,
        rentAmount: 2000,
        startDate: threeMonthsAgo,
        endDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
        isActive: true,
        isPrimary: true
      }
    });

    // Create 3 months of history
    for (let m = 0; m < 3; m++) {
      const dueDate = new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth() + m, 1);
      
      // Rent Charge
      const charge = await prisma.charge.create({
        data: {
          tenantId: tenant.id,
          leaseId: lease.id,
          type: 'RENT',
          amount: 2000,
          amountPaid: 2000,
          dueDate,
          isFullyPaid: true
        }
      });

      // 15 LedgerEntries Spread Across 3 Months (5 entries per month total for 3 tenants)
      // Tenant 1 & 2 pay fully, Tenant 3 pays late (next month)
      const txId = `TX-${tenant.id}-${m}`;
      await prisma.ledgerEntry.create({
        data: {
          transactionId: txId,
          accountId: accountMap['Bank Checking (Chase)'],
          amount: 2000,
          date: dueDate,
          description: `Rent Payment: ${tenant.name}`
        }
      });
      await prisma.ledgerEntry.create({
        data: {
          transactionId: txId,
          accountId: accountMap['Rental Revenue'],
          amount: -2000,
          date: dueDate,
          description: `Rent Revenue: ${tenant.name}`
        }
      });
    }
  }

  // Inject Maintenance & Master Expenses to show historical trends (Algorithm B)
  console.log('🛠️  Injecting Master Expenses...')
  for (let m = 0; m < 3; m++) {
    const monthDate = new Date(threeMonthsAgo.getFullYear(), threeMonthsAgo.getMonth() + m, 15);
    const expTxId = `EXP-M${m}`;
    
    // Master Water Bill
    await prisma.ledgerEntry.create({
      data: {
        transactionId: expTxId,
        accountId: accountMap['Master Water Bill'],
        amount: 800 + (m * 50),
        date: monthDate,
        description: `Master Water Bill - Month ${m+1}`
      }
    });
    // Maintenance Expense
    await prisma.ledgerEntry.create({
      data: {
        transactionId: expTxId + '-MAINT',
        accountId: accountMap['Maintenance Expense'],
        amount: 300,
        date: monthDate,
        description: `Common Area Maintenance`
      }
    });
  }

  console.log('✅ DEEP SEED COMPLETE.');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error("❌ SEED FAILED:", err);
  process.exit(1);
});
