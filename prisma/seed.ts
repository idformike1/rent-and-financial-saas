import 'dotenv/config';
import { PrismaClient, AccountCategory, PaymentMode, EntryStatus } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Initializing Universal Discrepancy Eradication Seed...");

  // 1. Fetch ALL current Organizations (including auto-healed ones)
  const orgs = await prisma.organization.findMany();
  console.log(`📡 Found ${orgs.length} target identity clusters.`);

  for (const org of orgs) {
    const orgId = org.id;
    console.log(`\n🛠️  Processing Cluster: ${org.name} (${orgId})`);

    // 1.1 Ensure at least one User exists for this Org
    const userCount = await prisma.user.count({ where: { organizationId: orgId } });
    if (userCount === 0) {
       await prisma.user.create({
         data: {
           email: `admin-${orgId.slice(0,5)}@axiom.xyz`,
           passwordHash: '$2a$12$K3c8vJ.lJz6Qh.F/U.9/E.L.Z.F.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y',
           name: "Cluster Administrator",
           role: "OWNER",
           organizationId: orgId
         }
       });
    }

    // 2. Clear Non-Identity Data
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
    console.log("   🏗️  Building Infrastructure...");
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

    // 4. Units & Tenants (15)
    console.log("   👥  Populating Directory...");
    const tenants = [];
    const units = [];
    const tenantNames = [
      "Aris Thorne", "Lyra Vance", "Cyrus Kael", "Nova Sterling", "Orion Blackwood",
      "Luna Vane", "Silas Frost", "Elena Moss", "Julian Marsh", "Seraphina Cloud",
      "Atlas Stone", "Freya Reed", "Kaelen Grey", "Margo Flint", "Ronan Ash"
    ];

    for (let i = 0; i < 15; i++) {
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

    // 5. Ledger & Accounts
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

    // 6. 300 Entries
    console.log("   💾  Injecting Telemetry...");
    const entries: any[] = [];
    
    // Rent
    const startMonth = new Date('2026-01-10');
    for (let m = 0; m < 6; m++) {
      for (let t = 0; t < 15; t++) {
        const transDate = new Date(startMonth);
        transDate.setMonth(startMonth.getMonth() + m);
        entries.push({
          organizationId: orgId, transactionId: `RENT-${m}-${t}-${orgId.slice(0,3)}`,
          accountId: account.id, amount: units[t].marketRent,
          transactionDate: transDate, date: transDate,
          description: `Rent Collection - ${tenants[t].name}`,
          expenseCategoryId: catRent.id, propertyId: properties[Math.floor(t / 3)].id,
          tenantId: tenants[t].id, status: EntryStatus.ACTIVE, paymentMode: PaymentMode.BANK
        });
      }
    }

    // Expenses
    for (let i = 0; i < 100; i++) {
       entries.push({
         organizationId: orgId, transactionId: `EXP-${i}-${orgId.slice(0,3)}`,
         accountId: account.id, amount: -(100 + Math.random() * 500),
         transactionDate: new Date(), date: new Date(),
         description: "Property Maintenance Service",
         expenseCategoryId: catMaint.id, propertyId: properties[i % 5].id,
         status: EntryStatus.ACTIVE, paymentMode: PaymentMode.CASH
       });
    }

    // Remaining (Personal + Misc)
    for (let i = 0; i < 110; i++) {
       const isPers = i < 50;
       entries.push({
         organizationId: orgId, transactionId: `MISC-${i}-${orgId.slice(0,3)}`,
         accountId: account.id, amount: isPers ? -(50 + Math.random() * 200) : (100 + Math.random() * 50),
         transactionDate: new Date(), date: new Date(),
         description: isPers ? "Personal Expenditure" : "Miscellaneous Inflow",
         expenseCategoryId: isPers ? personalCats[i % 3].id : catRent.id,
         status: EntryStatus.ACTIVE, paymentMode: PaymentMode.BANK
       });
    }

    await prisma.ledgerEntry.createMany({ data: entries });
    console.log(`   ✅  Cluster ${orgId.slice(0,8)} Synchronized.`);
  }

  console.log("\n✨ UNIVERSE STABILIZED: All identity clusters are now fully liquid.");
}

main()
  .catch((e) => {
    console.error("❌ CRTICAL FAILURE:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
