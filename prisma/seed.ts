import { PrismaClient, MaintenanceStatus, ChargeType, AccountCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { randomUUID } from 'crypto'

/**
 * FULL TEST DRIVE SEED ENGINE
 * Creates a robust 11-month fiscal history for testing Dashboards & CRM.
 */
async function main() {
  const prisma = new PrismaClient();

  console.log('🚀 INITIALIZING TEST DRIVE ENVIRONMENT...')
  
  // -- 0. EXPENSE CATEGORIES --
  console.log('📂 Seeding Chart of Accounts (Expense Categories)...')
  const categoriesData = [
    // PROPERTY SCOPE
    { name: 'Building Utilities', scope: 'PROPERTY', children: ['Water', 'Electricity'] },
    { name: 'Maintenance', scope: 'PROPERTY', children: ['Plumbing', 'Electrical'] },
    // HOME SCOPE
    { name: 'Home Utilities', scope: 'HOME', children: ['Water', 'Internet'] },
    // PERSONAL SCOPE
    { name: 'Person 1', scope: 'PERSONAL', children: ['Food', 'Travel'] },
    { name: 'Person 2', scope: 'PERSONAL', children: ['Food', 'Medical'] },
  ];

  for (const cat of categoriesData) {
    const parent = await (prisma as any).expenseCategory.create({
      data: { name: cat.name, scope: cat.scope }
    });
    for (const childName of cat.children) {
      await (prisma as any).expenseCategory.create({
        data: { name: childName, scope: cat.scope, parentId: parent.id }
      });
    }
  }
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
    const record = await (prisma as any).account.upsert({
      where: { id: randomUUID() }, // Upsert by name isn't possible in schema, so we create if missing
      update: {},
      create: acc
    });
    // Actually finding by name is safer for the record map
    const actual = await (prisma as any).account.findFirst({ where: { name: acc.name } });
    if (actual) accounts[acc.name] = actual.id;
  }

  // -- 2. PHYSICAL ASSETS (Properties & Units) --
  console.log('🏗️  Materializing Properties...')
  const northComplex = await (prisma as any).property.create({
    data: {
      name: 'North Complex',
      address: '123 Sky Tower Blvd, Sector North'
    }
  });

  const southPlaza = await (prisma as any).property.create({
    data: {
      name: 'South Plaza',
      address: '456 Market Road, Central District'
    }
  });

  console.log('🏘️  Allocating Units to Properties...')
  const units = [];
  
  // North Complex: Flats (Residential Focused)
  for (let i = 101; i <= 115; i++) {
    units.push(await (prisma as any).unit.create({
      data: {
        unitNumber: `N-${i}`,
        propertyId: northComplex.id,
        type: i % 5 === 0 ? 'Studio' : 'Apartment',
        category: 'FLAT',
        maintenanceStatus: MaintenanceStatus.OPERATIONAL
      }
    }));
  }

  // South Plaza: Shutters & Stores (Commercial Focused)
  for (let i = 201; i <= 215; i++) {
    units.push(await (prisma as any).unit.create({
      data: {
        unitNumber: `S-${i}`,
        propertyId: southPlaza.id,
        type: i % 3 === 0 ? 'Store' : 'Retail Shutter',
        category: i % 3 === 0 ? 'STORE' : 'SHUTTER',
        maintenanceStatus: MaintenanceStatus.OPERATIONAL
      }
    }));
  }

  // -- 3. TENANT POPULATION (30 Tenants) --
  console.log('👥 Populating Tenants & Leases...')
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const tenant = await (prisma as any).tenant.create({
      data: { 
        name: `Tenant ${i + 1}`,
        email: `tenant${i + 1}@enterprise.inc`,
        phone: `+1-555-${(1000 + i).toString().padStart(4, '0')}`,
        nationalId: `ID-CORP-${(10000 + i).toString()}`
      }
    });

    const unit = units[i];
    const rent = 1000 + (i * 50);
    
    // Lease starts 11 months ago
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);

    const lease = await (prisma as any).lease.create({
      data: {
        tenantId: tenant.id,
        unitId: unit.id,
        isPrimary: i < 15, // First 15 are primary
        rentAmount: rent,
        depositAmount: rent,
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

      const charge = await (prisma as any).charge.create({
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
        await (prisma as any).ledgerEntry.create({
          data: {
            transactionId: txId,
            accountId: accounts['Bank Checking (Chase)'],
            amount: rent,
            date: dueDate,
            description: `Rent Pmt: ${tenant.name}`
          }
        });
        // Revenue Credit (-)
        await (prisma as any).ledgerEntry.create({
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
        await (prisma as any).charge.create({
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
        await (prisma as any).ledgerEntry.create({
          data: {
            transactionId: utilTxId,
            accountId: accounts['Bank Checking (Chase)'],
            amount: utilAmt,
            date: dueDate,
            description: `Utility: ${tenant.name}`
          }
        });
        await (prisma as any).ledgerEntry.create({
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
    await (prisma as any).ledgerEntry.create({
      data: {
        transactionId: masterBillTxId,
        accountId: accounts['Master Water Bill'],
        amount: 1200 + (Math.random() * 300),
        date: monthDate,
        description: `City Water Master Bill ${monthDate.toLocaleString('default', {month:'short'})}`
      }
    });

    // Asset Payment Out (Credit)
    await (prisma as any).ledgerEntry.create({
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
  await (prisma as any).$disconnect();
}

main().catch(err => {
  console.error("❌ SEED FAILED:", err);
  process.exit(1);
});
