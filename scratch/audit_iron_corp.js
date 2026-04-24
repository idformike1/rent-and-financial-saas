const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

// Use the PgBouncer URL (6543) for the audit if 5432 is blocked
const connectionString = process.env.DATABASE_URL; 
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function auditDeletion() {
  try {
    console.log("--- FORENSIC AUDIT: 'Iron Corp' PURGE ---");
    
    // 1. Verify Organizational Soft-Delete
    const org = await prisma.organization.findFirst({
      where: { name: 'Iron Corp' }
    });

    if (!org) {
      console.log("[-] STATUS: Entity record not found (Hard Delete or Sync Failure).");
      return;
    }

    console.log(`[+] ENTITY FOUND: ${org.id}`);
    console.log(`[+] DELETION TIMESTAMP: ${org.deletedAt}`);

    if (org.deletedAt) {
      console.log("[✓] SUCCESS: Immutability Protocol active. Record archived.");
    } else {
      console.log("[!] WARNING: Entity is still active in the registry.");
    }

    // 2. Verify User Cascade
    console.log("\n--- FORENSIC AUDIT: IDENTITY CASCADE ---");
    const users = await prisma.user.findMany({
      where: { organizationId: org.id }
    });

    if (users.length === 0) {
      console.log("[-] STATUS: No associated identities found.");
    } else {
      users.forEach(u => {
        const isPurged = u.deletedAt !== null && u.accountStatus === 'ARCHIVED';
        console.log(`[${isPurged ? '✓' : 'X'}] USER: ${u.email} | STATUS: ${u.accountStatus} | DELETED: ${u.deletedAt}`);
      });
    }

    // 3. Identification of Operator
    console.log("\n--- FORENSIC AUDIT: SYSTEM LOGS ---");
    const logs = await prisma.auditLog.findMany({
      where: { entityId: org.id },
      orderBy: { createdAt: 'desc' },
      take: 1
    });

    if (logs.length > 0) {
      console.log(`[+] OPERATOR ID: ${logs[0].userId}`);
      console.log(`[+] PROTOCOL ACTION: ${logs[0].action}`);
      console.log(`[+] TIMESTAMP: ${logs[0].createdAt}`);
    } else {
      console.log("[-] STATUS: No audit trail found for this specific ID.");
    }

  } catch (err) {
    console.error("AUDIT FATAL:", err.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

auditDeletion();
