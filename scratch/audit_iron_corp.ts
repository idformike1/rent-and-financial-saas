import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditDeletion() {
  console.log("--- AUDIT: ORGANIZATION 'Iron Corp' ---");
  const org = await prisma.organization.findFirst({
    where: { name: 'Iron Corp' }
  });
  console.log(JSON.stringify(org, null, 2));

  if (org) {
    console.log("\n--- AUDIT: ASSOCIATED USERS ---");
    const users = await prisma.user.findMany({
      where: { organizationId: org.id }
    });
    console.log(JSON.stringify(users.map(u => ({ email: u.email, accountStatus: u.accountStatus, deletedAt: u.deletedAt })), null, 2));

    console.log("\n--- AUDIT: SYSTEM LOGS ---");
    const logs = await prisma.auditLog.findMany({
      where: { 
        OR: [
          { entityId: org.id },
          { entityType: 'ORGANIZATION', action: 'DELETE' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    console.log(JSON.stringify(logs, null, 2));
  }
}

auditDeletion()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
