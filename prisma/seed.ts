import { PrismaClient, MaintenanceStatus, ChargeType, AccountCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { randomUUID } from 'crypto'

/**
 * FULL TEST DRIVE SEED ENGINE
 * Creates a robust 11-month fiscal history for testing Dashboards & CRM.
 */
async function main() {
  const connectionString = process.env.DATABASE_URL?.includes('5432') 
    ? process.env.DATABASE_URL 
    : process.env.DATABASE_URL?.replace(':6543', ':5432').replace('pgbouncer=true', '');

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('🚀 INITIALIZING TEST DRIVE ENVIRONMENT...')
  
  // -- 1. CHART OF ACCOUNTS --
  const accountsData = [
    { name: 'Bank Checking (Chase)', category: AccountCategory.ASSET },
    { name: 'Cash in Hand', category: AccountCategory.ASSET },
    { name: 'Savings Reserve', category: AccountCategory.ASSET },
    { name: 'Rental Revenue', category: AccountCategory.INCOME },
    { name: 'Utility Recovery (Water)', category: AccountCategory.INCOME },
    { name: 'Utility Recovery (Elec)', category: AccountCategory.INCOME },
    { name: 'Master Water Bill', category: AccountCategory.EXPENSE },
    { name: 'Master Elec Bill', category: AccountCategory.EXPENSE },
    { name: 'Maintenance Expense', category: AccountCategory.EXPENSE },
    { name: 'Owner Draw', category: AccountCategory.EXPENSE },
  ]

  const accounts: Record<string, string> = {};
  for (const acc of accountsData) {
    const record = await prisma.account.upsert({
      where: { id: randomUUID() }, // Upsert by name isn't possible in schema, so we create if missing
      update: {},
      create: acc
    });
    // Actually finding by name is safer for the record map
    const actual = await prisma.account.findFirst({ where: { name: acc.name } });
    if (actual) accounts[acc.name] = actual.id;
  }

  // -- 2. PHYSICAL ASSETS (30 Units) --
  console.log('🏗️  Creating Units...')
  const units = [];
  for (let i = 101; i <= 130; i++) {
    units.push(await prisma.unit.create({
      data: {
        unitNumber: `A${i}`,
        propertyId: 'PROP-MASTER-001',
        type: i % 5 === 0 ? 'Studio' : 'Apartment',
        maintenanceStatus: MaintenanceStatus.OPERATIONAL
      }
    }));
  }

  // -- 3. TENANT POPULATION (30 Tenants) --
  console.log('👥 Populating Tenants & Leases...')
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const tenant = await prisma.tenant.create({
      data: { name: `Tenant ${i + 1}` }
    });

    const unit = units[i];
    const rent = 1000 + (i * 50);
    
    // Lease starts 11 months ago
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const lease = await prisma.lease.create({
      data: {
        tenantId: tenant.id,
        unitId: unit.id,
        isPrimary: true,
        rentAmount: rent,
        startDate,
        endDate,
        isActive: true
      }
    });

    // -- 4. 11 MONTHS OF FISCAL DATA --
    for (let m = 0; m <= 11; m++) {
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
      if (dueDate > now) continue;

      // Create Rent Charge
      const isPaid = Math.random() > 0.15; // 85% payment rate
      const amountPaid = isPaid ? rent : 0;

      const charge = await prisma.charge.create({
        data: {
          tenantId: tenant.id,
          leaseId: lease.id,
          type: ChargeType.RENT,
          amount: rent,
          amountPaid,
          dueDate,
          isFullyPaid: isPaid
        }
      });

      // If paid, create Ledger Entries
      if (isPaid) {
        const txId = randomUUID();
        // Asset Debit (+)
        await prisma.ledgerEntry.create({
          data: {
            transactionId: txId,
            accountId: accounts['Bank Checking (Chase)'],
            amount: rent,
            date: dueDate,
            description: `Rent Pmt: ${tenant.name}`
          }
        });
        // Revenue Credit (-)
        await prisma.ledgerEntry.create({
          data: {
            transactionId: txId,
            accountId: accounts['Rental Revenue'],
            amount: -rent,
            date: dueDate,
            description: `Rent Pmt: ${tenant.name}`
          }
        });
      }

      // Add Random Utility Charge & Recovery
      if (m % 2 === 0) {
        const utilAmt = 45.50 + i;
        await prisma.charge.create({
          data: {
            tenantId: tenant.id,
            leaseId: lease.id,
            type: ChargeType.WATER_SUBMETER,
            amount: utilAmt,
            amountPaid: utilAmt, // Always paid for simple recovery testing
            dueDate,
            isFullyPaid: true
          }
        });

        const utilTxId = randomUUID();
        await prisma.ledgerEntry.create({
          data: {
            transactionId: utilTxId,
            accountId: accounts['Bank Checking (Chase)'],
            amount: utilAmt,
            date: dueDate,
            description: `Utility: ${tenant.name}`
          }
        });
        await prisma.ledgerEntry.create({
          data: {
            transactionId: utilTxId,
            accountId: accounts['Utility Recovery (Water)'],
            amount: -utilAmt,
            date: dueDate,
            description: `Utility: ${tenant.name}`
          }
        });
      }
    }
  }

  // -- 5. GLOBAL EXPENSES (Algorithm B Master Bills) --
  console.log('💸 Injecting Master Expenses (Algorithm B Data)...')
  for (let m = 0; m <= 11; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const masterBillTxId = randomUUID();
    
    // Master Water Bill (Expense)
    await prisma.ledgerEntry.create({
      data: {
        transactionId: masterBillTxId,
        accountId: accounts['Master Water Bill'],
        amount: 1200 + (Math.random() * 300),
        date: monthDate,
        description: `City Water Master Bill ${monthDate.toLocaleString('default', {month:'short'})}`
      }
    });

    // Asset Payment Out (Credit)
    await prisma.ledgerEntry.create({
      data: {
        transactionId: masterBillTxId,
        accountId: accounts['Bank Checking (Chase)'],
        amount: -(1200 + (Math.random() * 300)),
        date: monthDate,
        description: `City Water Master Bill Pmt`
      }
    });
  }

  console.log('✅ TEST DRIVE ENVIRONMENT MATERIALIZED.')
  await prisma.$disconnect();
  await pool.end();
}

main().catch(err => {
  console.error("❌ SEED FAILED:", err);
  process.exit(1);
});
