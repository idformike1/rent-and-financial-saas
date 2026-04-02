import 'dotenv/config';
import { PrismaClient, MaintenanceStatus, ChargeType, AccountCategory, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🚀 INITIALIZING ENTERPRISE SAAS ENVIRONMENT...')
  
  // -- 0. BOOTSTRAP ORGANIZATION & ADMIN --
  console.log('🏢 Creating Host Organization (Acme Corp)...')
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp'
    }
  });

  console.log('👤 Registering Administrative Protocol (admin@system.com)...')
  const passwordHash = await bcrypt.hash('password123', 10);
  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'admin@system.com',
      name: 'System Admin',
      passwordHash,
      role: UserRole.OWNER
    }
  });

  // -- 1. EXPENSE CATEGORIES --
  console.log('📂 Seeding Chart of Accounts (Expense Categories)...')
  const categoriesData = [
    { name: 'Building Utilities', scope: 'PROPERTY', children: ['Water', 'Electricity'] },
    { name: 'Maintenance', scope: 'PROPERTY', children: ['Plumbing', 'Electrical'] },
    { name: 'Home Utilities', scope: 'HOME', children: ['Water', 'Internet'] },
    { name: 'Living Expenses', scope: 'PERSONAL', children: ['Food', 'Travel'] },
  ];

  for (const cat of categoriesData as any) {
    const parent = await prisma.expenseCategory.create({
      data: { 
        organizationId: org.id,
        name: cat.name, 
        scope: cat.scope 
      }
    });
    for (const childName of cat.children) {
      await prisma.expenseCategory.create({
        data: { 
          organizationId: org.id,
          name: childName as string, 
          scope: cat.scope as any, 
          parentId: parent.id 
        }
      });
    }
  }

  // -- 2. CHART OF ACCOUNTS (GLOBAL) --
  const accountsData = [
    { name: 'Bank Checking (Chase)', category: AccountCategory.ASSET },
    { name: 'Cash in Hand', category: AccountCategory.ASSET },
    { name: 'Savings Reserve', category: AccountCategory.ASSET },
    { name: 'Rental Revenue', category: AccountCategory.INCOME },
    { name: 'Utility Recovery (Water)', category: AccountCategory.INCOME },
    { name: 'Master Water Bill', category: AccountCategory.EXPENSE },
    { name: 'Master Elec Bill', category: AccountCategory.EXPENSE },
    { name: 'Owner Draw', category: AccountCategory.EXPENSE },
  ]

  const accounts: Record<string, string> = {};
  for (const acc of accountsData) {
    const record = await prisma.account.create({
      data: acc
    });
    accounts[acc.name] = record.id;
  }

  // -- 3. PHYSICAL ASSETS (Isolated to Acme Corp) --
  console.log('🏗️  Materializing Assets for Acme Corp...')
  const northComplex = await prisma.property.create({
    data: {
      organizationId: org.id,
      name: 'North Complex',
      address: '123 Sky Tower Blvd, Sector North'
    }
  });

  console.log('🏘️  Allocating Units...')
  const units = [];
  for (let i = 101; i <= 120; i++) {
    units.push(await prisma.unit.create({
      data: {
        unitNumber: `N-${i}`,
        propertyId: northComplex.id,
        type: i % 5 === 0 ? 'Studio' : 'Apartment',
        category: 'FLAT',
        maintenanceStatus: MaintenanceStatus.OPERATIONAL
      }
    }));
  }

  // -- 4. TENANT POPULATION (Isolated) --
  console.log('👥 Populating Tenants & Leases...')
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    const tenant = await prisma.tenant.create({
      data: { 
        organizationId: org.id,
        name: `Portfolio Tenant ${i + 1}`,
        email: `tenant${i + 1}@acme.com`,
        phone: `+1-555-${(1000 + i).toString()}`
      }
    });

    const unit = units[i];
    const rent = 1200 + (i * 100);
    const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    const lease = await prisma.lease.create({
      data: {
        tenantId: tenant.id,
        unitId: unit.id,
        isPrimary: true,
        rentAmount: rent,
        startDate,
        endDate: new Date(startDate.getFullYear() + i, startDate.getMonth(), 1),
        isActive: true
      }
    });

    // -- 5. 11 MONTHS OF FISCAL PROTOCOL --
    for (let m = 0; m <= 11; m++) {
      const dueDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
      if (dueDate > now) continue;

      const isPaid = Math.random() > 0.1; 
      const amountPaid = isPaid ? rent : 0;

      await prisma.charge.create({
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

      if (isPaid) {
        const txId = randomUUID();
        await prisma.ledgerEntry.create({
          data: {
            organizationId: org.id,
            transactionId: txId,
            accountId: accounts['Bank Checking (Chase)'],
            amount: rent,
            date: dueDate,
            description: `Rent: ${tenant.name}`
          }
        });
        await prisma.ledgerEntry.create({
          data: {
            organizationId: org.id,
            transactionId: txId,
            accountId: accounts['Rental Revenue'],
            amount: -rent,
            date: dueDate,
            description: `Revenue: ${tenant.name}`
          }
        });
      }
    }
  }

  console.log('✅ ENTERPRISE SAAS SYSTEM BOOTSTRAPPED.')
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
