import { AccountCategory } from '@prisma/client';
import { prisma } from '../lib/prisma';

async function main() {
  // This seed script is legacy and needs a valid organizationId and ledgerId to function.
  // It is preserved but deactivated to ensure build stability for Axiom 2026.
  console.log('--- SYSTEM ALERT: LEGACY SEEDER DEACTIVATED ---');
  console.log('Use src/app/api/seed-master/route.ts for current schema initialization.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
