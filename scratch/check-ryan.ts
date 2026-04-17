import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRyan() {
  try {
    console.log("--- SEARCHING FOR RYAN REYNOLDS ---");
    const tenants = await prisma.tenant.findMany({
      where: {
        name: { contains: 'Ryan Reynolds', mode: 'insensitive' }
      },
      include: {
        ledgerEntries: true,
        leases: true
      }
    });

    if (tenants.length === 0) {
      console.log("No tenant found with name 'Ryan Reynolds'.");
    } else {
      console.log(`Found ${tenants.length} tenant(s).`);
      tenants.forEach(t => {
        console.log(`Tenant ID: ${t.id}, Name: ${t.name}`);
        console.log(`Leases: ${t.leases.length}`);
        console.log(`Ledger Entries: ${t.ledgerEntries.length}`);
        t.ledgerEntries.forEach(e => {
          console.log(` - [${e.date.toISOString().split('T')[0]}] ${e.description}: ${e.amount}`);
        });
      });
    }

    console.log("\n--- SEARCHING FOR ANONYMOUS ENTRIES WITH 'RYAN' IN DESCRIPTION ---");
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        description: { contains: 'Ryan', mode: 'insensitive' }
      }
    });
    console.log(`Found ${entries.length} entry(ies).`);
    entries.forEach(e => {
        console.log(` - [${e.date.toISOString().split('T')[0]}] ${e.description}: ${e.amount} (Tenant: ${e.tenantId})`);
    });

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkRyan();
