import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkRyanReynolds() {
  console.log('--- SEARCHING FOR RYAN REYNOLDS ---');
  
  const tenants = await prisma.tenant.findMany({
    where: {
      name: {
        contains: 'Ryan Reynolds',
        mode: 'insensitive'
      }
    },
    include: {
      leases: true,
      ledgerEntries: {
        take: 5,
        orderBy: { transactionDate: 'desc' }
      }
    }
  });

  console.log(`Found ${tenants.length} tenants matching "Ryan Reynolds"`);
  
  for (const tenant of tenants) {
    console.log(`\nTenant: ${tenant.name} [ID: ${tenant.id}]`);
    console.log(`Organization ID: ${tenant.organizationId}`);
    console.log(`Active Leases: ${tenant.leases.filter(l => l.isActive).length}`);
    console.log(`Total Ledger Entries: ${await prisma.ledgerEntry.count({ where: { tenantId: tenant.id } })}`);
    
    if (tenant.ledgerEntries.length > 0) {
      console.log('Recent Entries:');
      tenant.ledgerEntries.forEach(entry => {
        console.log(`- [${entry.transactionDate.toISOString().split('T')[0]}] ${entry.description}: $${entry.amount}`);
      });
    }
  }

  const entriesByPayee = await prisma.ledgerEntry.findMany({
    where: {
      payee: {
        contains: 'Ryan Reynolds',
        mode: 'insensitive'
      }
    }
  });

  console.log(`\nFound ${entriesByPayee.length} entries matching payee "Ryan Reynolds"`);
  entriesByPayee.forEach(entry => {
    console.log(`- [${entry.transactionDate.toISOString().split('T')[0]}] ${entry.description}: $${entry.amount} [Unit: ${entry.unitId || 'N/A'}]`);
  });

  await prisma.$disconnect();
}

checkRyanReynolds();
