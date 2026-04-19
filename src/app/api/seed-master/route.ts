import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EntryStatus, AccountCategory, PaymentMode } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Ensure you import your hashing library!

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

    // 0.5. SYSTEM OPERATOR (MASTER ADMIN)
    // We must hash the password because we eradicated the backdoor in Phase 1A!
    let admin = await prisma.user.findUnique({ where: { email: 'admin@axiom.xyz' } });
    if (!admin) {
      const hashedPassword = await bcrypt.hash('Sovereign2026!', 12);
      admin = await prisma.user.create({
        data: {
          email: 'admin@axiom.xyz',
          passwordHash: hashedPassword, // <--- Change this line
          organizationId: org.id,
          role: 'OWNER'
        }
      });
    }

    // 1. PHYSICAL (ASSETS)
    // ... [Keep your existing property, units, tenants, and leases code here] ...
    const property = await prisma.property.create({
      data: { organizationId: org.id, name: "Axiom Prime", address: "77 Sovereign Way, Zinc District" }
    });
    // ... (omitted for brevity, keep your code) ...

    // 5. FINANCIAL ENGINE (TREASURY)
    // FIX: Use findFirst to prevent Unique Constraint crashes on re-runs
    let ledger = await prisma.financialLedger.findFirst({
      where: { name: "Master Operational Ledger", organizationId: org.id }
    });

    if (!ledger) {
      ledger = await prisma.financialLedger.create({
        data: {
          organizationId: org.id,
          name: "Master Operational Ledger",
          class: "EXPENSE"
        }
      });
    }

    // ... [Keep your existing Categories, Account, and LedgerEntry code here] ...

    return NextResponse.json({
      success: true,
      message: "Master Seed Injected Successfully.",
      credentials: {
        email: "admin@axiom.xyz",
        password: "Sovereign2026!"
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}