
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditDatabase() {
  console.log("--- STARTING DEEP FORENSIC AUDIT (MJS) ---");

  try {
    // 1. Audit FinancialLedgers for Duplicates
    console.log("\n[1] Auditing Financial Ledgers for Duplicates...");
    const ledgers = await prisma.financialLedger.findMany();
    const ledgerMap = new Map();
    const duplicateLedgers = [];

    for (const l of ledgers) {
      const key = `${l.organizationId}:${l.name.toUpperCase()}`;
      if (ledgerMap.has(key)) {
        duplicateLedgers.push({ key, ids: [ledgerMap.get(key), l.id] });
      } else {
        ledgerMap.set(key, l.id);
      }
    }
    
    if (duplicateLedgers.length > 0) {
      console.error("DRAGONS FOUND: Duplicate Ledgers detected!");
      duplicateLedgers.forEach(d => console.error(`- Duplicate Key ${d.key} found with IDs: ${d.ids.join(', ')}`));
    } else {
      console.log("No duplicate ledgers found.");
    }

    // 2. Audit Units for Organization integrity
    console.log("\n[2] Auditing Unit-Organization Integrity...");
    const units = await prisma.unit.findMany({ include: { property: true } });
    const unitErrors = units.filter(u => !u.organizationId || (u.property && u.property.organizationId !== u.organizationId));
    
    if (unitErrors.length > 0) {
      console.error("DRAGONS FOUND: Unit Organization mismatches!");
      unitErrors.forEach(u => console.error(`- Unit ${u.id} (No: ${u.unitNumber}) Org: ${u.organizationId}, Property Org: ${u.property?.organizationId}`));
    } else {
      console.log("All Units have valid Organization linkage.");
    }

    // 3. Audit Account Nodes for Orphans
    console.log("\n[3] Auditing Account Node Taxonomies...");
    const nodes = await prisma.expenseCategory.findMany();
    const orphans = nodes.filter(n => !n.ledgerId);
    if (orphans.length > 0) {
      console.error("DRAGONS FOUND: Orphaned Account Nodes!");
      orphans.forEach(n => console.error(`- Node ${n.id} (Name: ${n.name}) has NO Ledger ID.`));
    } else {
      console.log("No orphaned account nodes found.");
    }

    // 4. Audit Lease-Tenant connections
    console.log("\n[4] Auditing Lease Integrity...");
    const leases = await prisma.lease.findMany({ include: { tenant: true, unit: true } });
    const badLeases = leases.filter(l => !l.tenant || !l.unit);
    if (badLeases.length > 0) {
       console.error("DRAGONS FOUND: Broken Lease relations!");
       badLeases.forEach(l => console.error(`- Lease ${l.id} broken.`));
    } else {
      console.log("All leases have valid relations.");
    }

  } catch (err) {
    console.error("AUDIT FAILED CRITICALLY:", err.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n--- AUDIT COMPLETE ---");
  }
}

auditDatabase();
