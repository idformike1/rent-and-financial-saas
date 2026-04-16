import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EntryStatus, AccountCategory, PaymentMode } from '@prisma/client';

export async function GET() {
  console.log('--- AXIOM 2026: THE SOVEREIGN CIRCUIT STRESS TEST ---');

  try {
    // 0. ORGANIZATION
    const org = await prisma.organization.upsert({
      where: { id: 'seed-org-axiom' },
      update: {},
      create: {
        id: 'seed-org-axiom',
        name: "Axiom Holdings",
      }
    });

    // 1. PHYSICAL (ASSETS)
    const property = await prisma.property.create({
      data: {
        organizationId: org.id,
        name: "Axiom Prime",
        address: "77 Sovereign Way, Zinc District",
      }
    });

    // 2. INFRASTRUCTURE (ASSETS)
    const units = await Promise.all([
      prisma.unit.create({ data: { organizationId: org.id, propertyId: property.id, unitNumber: "101", marketRent: 2500.00, type: "Apartment" } }),
      prisma.unit.create({ data: { organizationId: org.id, propertyId: property.id, unitNumber: "102", marketRent: 2500.00, type: "Apartment" } }),
      prisma.unit.create({ data: { organizationId: org.id, propertyId: property.id, unitNumber: "103", marketRent: 2500.00, type: "Apartment" } }),
    ]);

    // 3. HUMAN (TENANTS)
    const tenants = await Promise.all([
      prisma.tenant.create({ data: { organizationId: org.id, name: "Aris Thorne", email: "aris@axiom.xyz", phone: "555-0101" } }),
      prisma.tenant.create({ data: { organizationId: org.id, name: "Lyra Vance", email: "lyra@axiom.xyz", phone: "555-0102" } }),
    ]);

    // 4. BINDING (LEASES)
    await Promise.all([
      prisma.lease.create({
        data: {
          organizationId: org.id,
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
          organizationId: org.id,
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
    const ledger = await prisma.financialLedger.create({
      data: {
        organizationId: org.id,
        name: "Master Operational Ledger",
        class: "EXPENSE"
      }
    });

    const rentCat = await prisma.expenseCategory.create({
      data: { organizationId: org.id, ledgerId: ledger.id, name: "Market Rent", isPersonal: false }
    });
    const maintCat = await prisma.expenseCategory.create({
      data: { organizationId: org.id, ledgerId: ledger.id, name: "Maintenance & Repairs", isPersonal: false }
    });
    const drawCat = await prisma.expenseCategory.create({
      data: { organizationId: org.id, ledgerId: ledger.id, name: "Owner Draw", isPersonal: true }
    });

    const account = await prisma.account.create({
      data: { organizationId: org.id, name: "Operating Account", category: AccountCategory.ASSET }
    });

    await prisma.ledgerEntry.createMany({
      data: [
        { 
          organizationId: org.id,
          transactionId: "TX-ALPHA-001",
          accountId: account.id,
          amount: 2500.00, 
          description: "Jan Rent - Unit 101", 
          expenseCategoryId: rentCat.id, 
          propertyId: property.id, 
          tenantId: tenants[0].id,
          status: EntryStatus.ACTIVE,
          paymentMode: PaymentMode.BANK
        },
        { 
          organizationId: org.id,
          transactionId: "TX-ALPHA-002",
          accountId: account.id,
          amount: 2500.00, 
          description: "Feb Rent - Unit 102", 
          expenseCategoryId: rentCat.id, 
          propertyId: property.id, 
          tenantId: tenants[1].id,
          status: EntryStatus.ACTIVE,
          paymentMode: PaymentMode.BANK
        },
        { 
          organizationId: org.id,
          transactionId: "TX-BETA-001",
          accountId: account.id,
          amount: -450.00, 
          description: "HVAC Filter Replacement", 
          expenseCategoryId: maintCat.id, 
          propertyId: property.id,
          status: EntryStatus.ACTIVE,
          paymentMode: PaymentMode.CASH
        },
        { 
          organizationId: org.id,
          transactionId: "TX-GAMMA-001",
          accountId: account.id,
          amount: -2000.00, 
          description: "Q1 Distribution", 
          expenseCategoryId: drawCat.id,
          status: EntryStatus.ACTIVE,
          paymentMode: PaymentMode.BANK
        }
      ]
    });

    return NextResponse.json({ success: true, message: "Master Seed Injected Successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
