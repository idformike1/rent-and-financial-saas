import { prisma } from '../lib/prisma';
import { AccountCategory, EntryStatus, PaymentMode } from '@prisma/client';

async function main() {
  console.log('--- AXIOM 2026: THE SOVEREIGN CIRCUIT STRESS TEST ---');

  // 0. ORGANIZATION (TENANCY ROOT)
  const org = await prisma.organization.upsert({
    where: { id: 'seed-org-axiom' },
    update: {},
    create: {
      id: 'seed-org-axiom',
      name: "Axiom Holdings",
    }
  });
  const orgId = org.id;

  // 1. PHYSICAL (ASSETS)
  console.log('Ingesting Physical Infrastructure...');
  const property = await prisma.property.create({
    data: {
      organizationId: orgId,
      name: "Axiom Prime",
      address: "77 Sovereign Way, Zinc District",
    }
  });

  // 2. INFRASTRUCTURE (ASSETS)
  const units = await Promise.all([
    prisma.unit.create({ data: { organizationId: orgId, propertyId: property.id, unitNumber: "101", marketRent: 2500.00, type: "Apartment" } }),
    prisma.unit.create({ data: { organizationId: orgId, propertyId: property.id, unitNumber: "102", marketRent: 2500.00, type: "Apartment" } }),
    prisma.unit.create({ data: { organizationId: orgId, propertyId: property.id, unitNumber: "103", marketRent: 2500.00, type: "Apartment" } }),
  ]);

  // 3. HUMAN (TENANTS)
  console.log('Ingesting Human Directory...');
  const tenants = await Promise.all([
    prisma.tenant.create({ data: { organizationId: orgId, name: "Aris Thorne", email: "aris@axiom.xyz", phone: "555-0101" } }),
    prisma.tenant.create({ data: { organizationId: orgId, name: "Lyra Vance", email: "lyra@axiom.xyz", phone: "555-0102" } }),
  ]);

  // 4. BINDING (LEASES)
  console.log('Executing Leases...');
  await Promise.all([
    prisma.lease.create({
      data: {
        organizationId: orgId,
        tenantId: tenants[0].id,
        unitId: units[0].id,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-01-01'),
        rentAmount: 2500.00,
        isActive: true
      }
    }),
    prisma.lease.create({
      data: {
        organizationId: orgId,
        tenantId: tenants[1].id,
        unitId: units[1].id,
        startDate: new Date('2026-02-01'),
        endDate: new Date('2027-02-01'),
        rentAmount: 2500.00,
        isActive: true
      }
    }),
  ]);

  // 5. FINANCIAL ENGINE (TREASURY)
  console.log('Initializing Ledger Entries...');
  
  // Ledger Materialization
  const ledger = await prisma.financialLedger.create({
    data: {
      organizationId: orgId,
      name: "Master Operational Ledger",
      class: "EXPENSE"
    }
  });

  // Categorical Registry
  const rentCat = await prisma.expenseCategory.create({
    data: { organizationId: orgId, ledgerId: ledger.id, name: "Market Rent", isPersonal: false }
  });
  const maintCat = await prisma.expenseCategory.create({
    data: { organizationId: orgId, ledgerId: ledger.id, name: "Maintenance & Repairs", isPersonal: false }
  });
  const drawCat = await prisma.expenseCategory.create({
    data: { organizationId: orgId, ledgerId: ledger.id, name: "Owner Draw", isPersonal: true }
  });

  const account = await prisma.account.create({
    data: { organizationId: orgId, name: "Operating Account", category: AccountCategory.ASSET }
  });

  const accountIncome = await prisma.account.create({
    data: { organizationId: orgId, name: "Rental Income", category: AccountCategory.INCOME }
  });

  await prisma.transaction.createMany({
    data: [
      { id: "TX-ALPHA-001", organizationId: orgId, description: "Jan Rent - Unit 101" },
      { id: "TX-ALPHA-002", organizationId: orgId, description: "Feb Rent - Unit 102" },
      { id: "TX-BETA-001",  organizationId: orgId, description: "HVAC Filter Replacement" },
      { id: "TX-GAMMA-001", organizationId: orgId, description: "Q1 Distribution" }
    ]
  });

  await prisma.ledgerEntry.createMany({
    data: [
      { 
        organizationId: orgId,
        transactionId: "TX-ALPHA-001",
        accountId: account.id,
        amount: 2500.00, 
        type: 'DEBIT',
        description: "Jan Rent - Unit 101", 
        expenseCategoryId: rentCat.id, 
        propertyId: property.id, 
        tenantId: tenants[0].id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.BANK
      },
      { 
        organizationId: orgId,
        transactionId: "TX-ALPHA-001",
        accountId: accountIncome.id,
        amount: 2500.00, 
        type: 'CREDIT',
        description: "Jan Rent - Unit 101", 
        expenseCategoryId: rentCat.id, 
        propertyId: property.id, 
        tenantId: tenants[0].id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.BANK
      },
      { 
        organizationId: orgId,
        transactionId: "TX-ALPHA-002",
        accountId: account.id,
        amount: 2500.00, 
        type: 'DEBIT',
        description: "Feb Rent - Unit 102", 
        expenseCategoryId: rentCat.id, 
        propertyId: property.id, 
        tenantId: tenants[1].id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.BANK
      },
      { 
        organizationId: orgId,
        transactionId: "TX-ALPHA-002",
        accountId: accountIncome.id,
        amount: 2500.00, 
        type: 'CREDIT',
        description: "Feb Rent - Unit 102", 
        expenseCategoryId: rentCat.id, 
        propertyId: property.id, 
        tenantId: tenants[1].id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.BANK
      },
      { 
        organizationId: orgId,
        transactionId: "TX-BETA-001",
        accountId: account.id,
        amount: 450.00, 
        type: 'CREDIT',
        description: "HVAC Filter Replacement", 
        expenseCategoryId: maintCat.id, 
        propertyId: property.id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.CASH
      },
      { 
        organizationId: orgId,
        transactionId: "TX-BETA-001",
        accountId: account.id, // Expense account conceptually
        amount: 450.00, 
        type: 'DEBIT',
        description: "HVAC Filter Replacement", 
        expenseCategoryId: maintCat.id, 
        propertyId: property.id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.CASH
      },
      { 
        organizationId: orgId,
        transactionId: "TX-GAMMA-001",
        accountId: account.id,
        amount: 2000.00, 
        type: 'CREDIT',
        description: "Q1 Distribution", 
        expenseCategoryId: drawCat.id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.BANK
      },
      { 
        organizationId: orgId,
        transactionId: "TX-GAMMA-001",
        accountId: account.id, // Equity draw technically
        amount: 2000.00, 
        type: 'DEBIT',
        description: "Q1 Distribution", 
        expenseCategoryId: drawCat.id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.BANK
      }
    ]
  });

  console.log('--- MASTER SEED COMPLETE: DATA INJECTION SUCCESSFUL ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
