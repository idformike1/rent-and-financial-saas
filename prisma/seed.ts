import { PrismaClient, MaintenanceStatus, ChargeType, AccountCategory, ExpenseScope, PaymentMode } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

/**
 * ENTERPRISE HARDENING SEED ENGINE
 * Creates a robust 11-month fiscal history under a Master Organization.
 */
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter });

  console.log('🚀 INITIALIZING ENTERPRISE ENVIRONMENT...')
  
  // -- 0. MASTER ORGANIZATION --
  const org = await prisma.organization.create({
    data: { name: 'Global Enterprise Holdings' }
  });
  console.log(`🏢 Organization Created: ${org.name} (${org.id})`)

  // -- 1. ADMIN USER --
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@system.com' },
    update: {
      organizationId: org.id,
      role: 'OWNER',
      isActive: true,
      canEdit: true
    },
    create: {
      email: 'admin@system.com',
      passwordHash: passwordHash,
      name: 'System Administrator',
      role: 'OWNER',
      organizationId: org.id,
      isActive: true,
      canEdit: true
    }
  });
  console.log(`👤 Admin User Materialized: ${admin.email}`)

  // -- 2. EXPENSE CATEGORIES --
  console.log('📂 Seeding Chart of Accounts (Expense Categories)...')
  const categoriesData = [
    { name: 'Building Utilities', scope: ExpenseScope.PROPERTY, children: ['Water', 'Electricity'] },
    { name: 'Maintenance', scope: ExpenseScope.PROPERTY, children: ['Plumbing', 'Electrical'] },
    { name: 'Home Utilities', scope: ExpenseScope.HOME, children: ['Water', 'Internet'] },
    { name: 'Person 1', scope: ExpenseScope.PERSONAL, children: ['Food', 'Travel'] },
    { name: 'Person 2', scope: ExpenseScope.PERSONAL, children: ['Food', 'Medical'] },
  ];

  for (const cat of categoriesData) {
    const parent = await prisma.expenseCategory.create({
      data: { name: cat.name, scope: cat.scope, organizationId: org.id }
    });
    for (const childName of cat.children) {
      await prisma.expenseCategory.create({
        data: { name: childName, scope: cat.scope, parentId: parent.id, organizationId: org.id }
      });
    }
  }

  // -- 3. CHART OF ACCOUNTS --
  const accountsData = [
    { name: 'Bank Checking (Chase)', category: AccountCategory.ASSET, organizationId: org.id },
    { name: 'Cash in Hand', category: AccountCategory.ASSET, organizationId: org.id },
    { name: 'Savings Reserve', category: AccountCategory.ASSET, organizationId: org.id },
    { name: 'Rental Revenue', category: AccountCategory.INCOME, organizationId: org.id },
    { name: 'Utility Recovery (Water)', category: AccountCategory.INCOME, organizationId: org.id },
    { name: 'Utility Recovery (Elec)', category: AccountCategory.INCOME, organizationId: org.id },
    { name: 'Master Water Bill', category: AccountCategory.EXPENSE, organizationId: org.id },
    { name: 'Master Elec Bill', category: AccountCategory.EXPENSE, organizationId: org.id },
    { name: 'Maintenance Expense', category: AccountCategory.EXPENSE, organizationId: org.id },
    { name: 'Owner Draw', category: AccountCategory.EXPENSE, organizationId: org.id },
  ]

  const accounts: Record<string, string> = {};
  for (const acc of accountsData) {
    const record = await prisma.account.create({
      data: acc
    });
    accounts[acc.name] = record.id;
  }

  // -- 4. PHYSICAL ASSETS (Properties & Units) --
  console.log('🏗️  Materializing Properties...')
  const northComplex = await prisma.property.create({
    data: {
      organizationId: org.id,
      name: 'North Complex',
      address: '123 Sky Tower Blvd, Sector North',
      organizationId: org.id
    }
  });

  const southPlaza = await prisma.property.create({
    data: {
      name: 'South Plaza',
      address: '456 Market Road, Central District',
      organizationId: org.id
    }
  });

  console.log('🏘️  Allocating Units to Properties...')
  const units = [];
  
  for (let i = 101; i <= 115; i++) {
    units.push(await prisma.unit.create({
      data: {
        unitNumber: `N-${i}`,
        propertyId: northComplex.id,
        type: i % 5 === 0 ? 'Studio' : 'Apartment',
        category: 'FLAT',
        maintenanceStatus: MaintenanceStatus.OPERATIONAL,
        organizationId: org.id
      }
    }));
  }

  for (let i = 201; i <= 215; i++) {
    units.push(await prisma.unit.create({
      data: {
        unitNumber: `S-${i}`,
        propertyId: southPlaza.id,
        type: i % 3 === 0 ? 'Store' : 'Retail Shutter',
        category: i % 3 === 0 ? 'STORE' : 'SHUTTER',
        maintenanceStatus: MaintenanceStatus.OPERATIONAL,
        organizationId: org.id
      }
    }));
  }

  // -- 5. TENANT POPULATION (30 Tenants) --
  console.log('👥 Populating Tenants & Leases...')
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const tenant = await prisma.tenant.create({
      data: { 
        name: `Tenant ${i + 1}`,
        email: `tenant${i + 1}@enterprise.inc`,
        phone: `+1-555-${(1000 + i).toString().padStart(4, '0')}`,
        nationalId: `ID-CORP-${(10000 + i).toString()}`,
        organizationId: org.id
      }
    });

    const unit = units[i];
    const rent = 1000 + (i * 50);
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const lease = await prisma.lease.create({
      data: {
        tenantId: tenant.id,
        unitId: unit.id,
        isPrimary: i < 15,
        rentAmount: rent,
        startDate,
        endDate,
        isActive: true,
        organizationId: org.id
      }
    });

    for (let m = 0; m <= 11; m++) {
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
      if (dueDate > now) continue;

      const isPaid = Math.random() > 0.15;
      const amountPaid = isPaid ? rent : 0;

      const charge = await prisma.charge.create({
        data: {
          tenantId: tenant.id,
          leaseId: lease.id,
          type: ChargeType.RENT,
          amount: rent,
          amountPaid,
          dueDate,
          isFullyPaid: isPaid,
          organizationId: org.id
        }
      });

      if (isPaid) {
        const txId = randomUUID();
        await prisma.ledgerEntry.create({
          data: {
            organizationId: org.id,
            transactionId: txId,
            accountId: accounts['Bank Checking (Chase)'],
            amount: rent,
            date: dueDate,
            description: `Rent Pmt: ${tenant.name}`,
            organizationId: org.id
          }
        });
        await prisma.ledgerEntry.create({
          data: {
            organizationId: org.id,
            transactionId: txId,
            accountId: accounts['Rental Revenue'],
            amount: -rent,
            date: dueDate,
            description: `Rent Pmt: ${tenant.name}`,
            organizationId: org.id
          }
        });
      }

      if (m % 2 === 0) {
        const utilAmt = 45.50 + i;
        await prisma.charge.create({
          data: {
            tenantId: tenant.id,
            leaseId: lease.id,
            type: ChargeType.WATER_SUBMETER,
            amount: utilAmt,
            amountPaid: utilAmt,
            dueDate,
            isFullyPaid: true,
            organizationId: org.id
          }
        });

        const utilTxId = randomUUID();
        await prisma.ledgerEntry.create({
          data: {
            transactionId: utilTxId,
            accountId: accounts['Bank Checking (Chase)'],
            amount: utilAmt,
            date: dueDate,
            description: `Utility: ${tenant.name}`,
            organizationId: org.id
          }
        });
        await prisma.ledgerEntry.create({
          data: {
            transactionId: utilTxId,
            accountId: accounts['Utility Recovery (Water)'],
            amount: -utilAmt,
            date: dueDate,
            description: `Utility: ${tenant.name}`,
            organizationId: org.id
          }
        });
      }
    }
  }

  // -- 6. GLOBAL EXPENSES --
  console.log('💸 Injecting Master Expenses...')
  for (let m = 0; m <= 11; m++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const masterBillTxId = randomUUID();
    
    await prisma.ledgerEntry.create({
      data: {
        transactionId: masterBillTxId,
        accountId: accounts['Master Water Bill'],
        amount: 1200 + (Math.random() * 300),
        date: monthDate,
        description: `City Water Master Bill ${monthDate.toLocaleString('default', {month:'short'})}`,
        organizationId: org.id
      }
    });

    await prisma.ledgerEntry.create({
      data: {
        transactionId: masterBillTxId,
        accountId: accounts['Bank Checking (Chase)'],
        amount: -(1200 + (Math.random() * 300)),
        date: monthDate,
        description: `City Water Master Bill Pmt`,
        organizationId: org.id
      }
    });
  }

  console.log('✅ ENTERPRISE ENVIRONMENT MATERIALIZED.')
  await prisma.$disconnect();
}

main()
  .catch(err => {
    console.error("❌ SEED FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end(); // CRITICAL: This ensures the process exits and doesn't hang.
  });
