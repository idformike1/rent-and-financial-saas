import 'dotenv/config';
import { AccountCategory, PaymentMode, EntryStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

async function main() {
  console.log("🚀 Initializing Axiom 2026 Sovereign Seed Engine (300 Entries Portfolio)...");

  // 1. Identify/Create Target Organization
  const org = await prisma.organization.upsert({
    where: { id: 'seed-org-axiom' },
    update: {},
    create: {
      id: 'seed-org-axiom',
      name: "Axiom Holdings Group",
    }
  });
  const orgId = org.id;
  console.log(`✅ Target Locked: ${org.name} (${orgId})`);

  // 2. Clear Existing Data for this Org (Nuclear Purge)
  console.log("🧹 Purging existing telemetry...");
  await prisma.ledgerEntry.deleteMany({ where: { organizationId: orgId } });
  await prisma.charge.deleteMany({ where: { organizationId: orgId } });
  await prisma.lease.deleteMany({ where: { organizationId: orgId } });
  await prisma.tenant.deleteMany({ where: { organizationId: orgId } });
  await prisma.unit.deleteMany({ where: { organizationId: orgId } });
  await prisma.property.deleteMany({ where: { organizationId: orgId } });
  await prisma.expenseCategory.deleteMany({ where: { organizationId: orgId } });
  await prisma.financialLedger.deleteMany({ where: { organizationId: orgId } });
  await prisma.account.deleteMany({ where: { organizationId: orgId } });

  // 3. Properties (5)
  console.log("🏗️ Materializing Physical Infrastructure (5 Properties)...");
  const propertyNames = ["Axiom Prime", "The Zinc Lofts", "Sovereign Heights", "Mercury Tower", "Arcadia Estates"];
  const properties = [];
  for (const name of propertyNames) {
    const p = await prisma.property.create({
      data: {
        organizationId: orgId,
        name: name,
        address: `${Math.floor(Math.random() * 999)} Industrial Way, Tech District`,
      }
    });
    properties.push(p);
  }

  // 4. Units & Tenants (15 Units, 15 Tenants)
  console.log("👥 Ingesting Human Directory & Units (15 Tenants)...");
  const tenants = [];
  const units = [];
  const tenantNames = [
    "Aris Thorne", "Lyra Vance", "Cyrus Kael", "Nova Sterling", "Orion Blackwood",
    "Luna Vane", "Silas Frost", "Elena Moss", "Julian Marsh", "Seraphina Cloud",
    "Atlas Stone", "Freya Reed", "Kaelen Grey", "Margo Flint", "Ronan Ash"
  ];

  for (let i = 0; i < 15; i++) {
    // 3 units per property
    const propIndex = Math.floor(i / 3);
    const u = await prisma.unit.create({
      data: {
        organizationId: orgId,
        propertyId: properties[propIndex].id,
        unitNumber: `${100 + (i % 3) + 1}`,
        marketRent: 2500 + (Math.random() * 500),
        type: "Apartment"
      }
    });
    units.push(u);

    const t = await prisma.tenant.create({
      data: {
        organizationId: orgId,
        name: tenantNames[i],
        email: `${tenantNames[i].toLowerCase().replace(' ', '.')}@axiom.xyz`,
        phone: `555-01${i.toString().padStart(2, '0')}`
      }
    });
    tenants.push(t);

    // Create Lease
    await prisma.lease.create({
      data: {
        organizationId: orgId,
        tenantId: t.id,
        unitId: u.id,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2027-01-01'),
        rentAmount: u.marketRent,
        isActive: true,
        isPrimary: true
      }
    });
  }

  // 5. Ledger & Categories
  console.log("⚖️ Initializing Ledger Registry...");
  const ledger = await prisma.financialLedger.create({
    data: { organizationId: orgId, name: "Master Operational Ledger", class: "MIXED" }
  });

  const catRent = await prisma.expenseCategory.create({
    data: { organizationId: orgId, ledgerId: ledger.id, name: "Rental Revenue", isPersonal: false }
  });
  const catMaint = await prisma.expenseCategory.create({
    data: { organizationId: orgId, ledgerId: ledger.id, name: "Maintenance & Repairs", isPersonal: false }
  });
  const catUtility = await prisma.expenseCategory.create({
    data: { organizationId: orgId, ledgerId: ledger.id, name: "Utilities", isPersonal: false }
  });

  // 3 Personal Accounts (Categories)
  const personalCats = [];
  const personalNames = ["Owner Draw (Personal)", "Personal Travel", "Personal Dining"];
  for (const name of personalNames) {
    const pc = await prisma.expenseCategory.create({
      data: { organizationId: orgId, ledgerId: ledger.id, name: name, isPersonal: true }
    });
    personalCats.push(pc);
  }

  const account = await prisma.account.create({
    data: { organizationId: orgId, name: "Main Operating Account", category: AccountCategory.ASSET }
  });

  // 6. 300 Ledger Entries
  const entries: any[] = [];
  console.log("💾 Synthesizing 300 Ledger Entries...");

  // (A) Rent Collection (90 entries: 15 tenants * 6 months)
  const startMonth = new Date('2026-01-10');
  for (let m = 0; m < 6; m++) {
    for (let t = 0; t < 15; t++) {
      const transDate = new Date(startMonth);
      transDate.setMonth(startMonth.getMonth() + m);
      
      entries.push({
        organizationId: orgId,
        transactionId: `RENT-${m}-${t}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        accountId: account.id,
        amount: units[t].marketRent,
        transactionDate: transDate,
        date: transDate,
        description: `Rent Collection - ${tenants[t].name} (Unit ${units[t].unitNumber})`,
        expenseCategoryId: catRent.id,
        propertyId: properties[Math.floor(t / 3)].id,
        tenantId: tenants[t].id,
        status: EntryStatus.ACTIVE,
        paymentMode: PaymentMode.BANK
      });
    }
  }

  // (B) Personal Expenses (50 entries distributed)
  for (let i = 0; i < 50; i++) {
    const pc = personalCats[i % personalCats.length];
    const transDate = new Date();
    transDate.setDate(transDate.getDate() - Math.floor(Math.random() * 180));
    
    entries.push({
      organizationId: orgId,
      transactionId: `PERS-${i}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      accountId: account.id,
      amount: -(10 + (Math.random() * 500)),
      transactionDate: transDate,
      date: transDate,
      description: `Personal Transaction: ${pc.name}`,
      expenseCategoryId: pc.id,
      status: EntryStatus.ACTIVE,
      paymentMode: PaymentMode.BANK
    });
  }

  // (C) Property Maintenance (100 entries)
  const maintenanceDesc = ["Plumbing Repair", "HVAC Service", "Roof Inspection", "Landscaping", "Pest Control", "Electrical Audit"];
  for (let i = 0; i < 100; i++) {
    const prop = properties[i % properties.length];
    const transDate = new Date();
    transDate.setDate(transDate.getDate() - Math.floor(Math.random() * 200));

    entries.push({
      organizationId: orgId,
      transactionId: `MAINT-${i}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      accountId: account.id,
      amount: -(100 + (Math.random() * 1500)),
      transactionDate: transDate,
      date: transDate,
      description: `${maintenanceDesc[i % maintenanceDesc.length]} @ ${prop.name}`,
      expenseCategoryId: catMaint.id,
      propertyId: prop.id,
      status: EntryStatus.ACTIVE,
      paymentMode: PaymentMode.CASH
    });
  }

  // (D) Other Revenue/Expenses (Remainder to reach 300)
  // Current: 90 + 50 + 100 = 240. Need 60 more.
  for (let i = 0; i < 60; i++) {
    const transDate = new Date();
    transDate.setDate(transDate.getDate() - Math.floor(Math.random() * 200));
    const isRevenue = Math.random() > 0.7; // 30% chance of misc revenue

    entries.push({
      organizationId: orgId,
      transactionId: `MISC-${i}-${Math.random().toString(36).substring(7).toUpperCase()}`,
      accountId: account.id,
      amount: isRevenue ? (50 + Math.random() * 200) : -(20 + Math.random() * 100),
      transactionDate: transDate,
      date: transDate,
      description: isRevenue ? "Miscellaneous Inflow" : "Digital Subscription Payment",
      expenseCategoryId: isRevenue ? catRent.id : catUtility.id,
      status: EntryStatus.ACTIVE,
      paymentMode: PaymentMode.BANK
    });
  }

  // Final Batch Execution
  console.log(`🚀 Executing Master Injection: ${entries.length} segments...`);
  // createMany for performance
  await prisma.ledgerEntry.createMany({
    data: entries
  });

  console.log("✅ SUCCESS: 300 entries, 15 tenants, 5 properties, and 3 personal accounts materialized.");
}

main()
  .catch((e) => {
    console.error("❌ CRTICAL SEED FAILURE:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
