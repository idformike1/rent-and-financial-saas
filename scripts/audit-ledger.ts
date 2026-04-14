import { PrismaClient, EntryStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const organizations = await prisma.organization.findMany();
  const summary: any = {
    timestamp: new Date().toISOString(),
    totalOrganizations: organizations.length,
    organizations: []
  };

  let reportContent = `# Ledger Forensic Audit Report\n\nGenerated at: ${new Date().toLocaleString()}\n\n`;

  for (const org of organizations) {
    const orgId = org.id;
    const orgName = org.name;

    // 1. Heading Mapping
    const revenueHeadings = await prisma.financialLedger.count({
      where: { organizationId: orgId, class: 'REVENUE' }
    });
    const expenseHeadings = await prisma.financialLedger.count({
      where: { organizationId: orgId, class: 'EXPENSE' }
    });

    // 2. Orphan Check (Income entries lacking tenant/property)
    const incomeOrphans = await prisma.ledgerEntry.findMany({
      where: {
        organizationId: orgId,
        amount: { gt: 0 },
        OR: [
          { tenantId: null },
          { propertyId: null }
        ]
      },
      include: { 
        tenant: true, 
        property: true 
      }
    });

    // 3. Void Logic
    const voidedCount = await prisma.ledgerEntry.count({
      where: { organizationId: orgId, status: EntryStatus.VOIDED }
    });

    // 4. Recursion Check (Depth > 3)
    const categories = await prisma.expenseCategory.findMany({
      where: { organizationId: orgId }
    });

    const categoryDepths: any[] = [];
    for (const cat of categories) {
      let depth = 0;
      let curr = cat;
      const visited = new Set();
      while (curr.parentId) {
        if (visited.has(curr.id)) {
            // Circular dependency detected
            categoryDepths.push({ id: cat.id, name: cat.name, depth: 'CIRCULAR' });
            break;
        }
        visited.add(curr.id);
        depth++;
        const parent = categories.find(c => c.id === curr.parentId);
        if (!parent) break;
        curr = parent;
      }
      if (typeof depth === 'number' && depth > 3) {
        categoryDepths.push({ id: cat.id, name: cat.name, depth });
      }
    }

    const orgSummary = {
      id: orgId,
      name: orgName,
      headings: { revenue: revenueHeadings, expense: expenseHeadings },
      voidedEntries: voidedCount,
      incomeOrphans: incomeOrphans.length,
      deepCategories: categoryDepths.length
    };
    summary.organizations.push(orgSummary);

    reportContent += `## Organization: ${orgName} (${orgId})\n\n`;
    reportContent += `### Fiscal Headings\n- Revenue Headings: ${revenueHeadings}\n- Expense Headings: ${expenseHeadings}\n\n`;
    reportContent += `### Status Summary\n- Voided Transactions: ${voidedCount}\n\n`;

    if (incomeOrphans.length > 0) {
      reportContent += `### ⚠️ Income Orphans (${incomeOrphans.length})\n| UUID | Date | Amount | Tenant | Property |\n|---|---|---|---|---|\n`;
      incomeOrphans.forEach(o => {
        reportContent += `| ${o.id} | ${new Date(o.transactionDate).toLocaleDateString()} | ${o.amount} | ${o.tenant?.name || 'MISSING'} | ${o.property?.name || 'MISSING'} |\n`;
      });
      reportContent += `\n`;
    } else {
      reportContent += `### ✅ Income Integrity\nAll income entries are correctly linked to tenants and properties.\n\n`;
    }

    if (categoryDepths.length > 0) {
      reportContent += `### ⚠️ Recursion Depth Violations (>3 Levels)\n| UUID | Name | Depth |\n|---|---|---|\n`;
      categoryDepths.forEach(c => {
        reportContent += `| ${c.id} | ${c.name} | ${c.depth} |\n`;
      });
      reportContent += `\n`;
    } else {
      reportContent += `### ✅ Taxonomy Integrity\nNo deep recursion detected. All categories are within the 3-level depth limit.\n\n`;
    }

    reportContent += `---\n\n`;
  }

  // 5. Global Consistency Audit
  const totalEntries = await prisma.ledgerEntry.count();
  const linkedEntries = await prisma.ledgerEntry.count({
    where: { organizationId: { not: '' } }
  });
  
  const orphanCount = totalEntries - linkedEntries;
  if (orphanCount > 0) {
      reportContent += `## ‼️ CRITICAL SYSTEM ORPHANS\n\nFound ${orphanCount} transactions lacking a valid organizationId link.\n\n`;
  } else {
      reportContent += `## ✅ Global Multi-Tenancy Check\nNo orphaned transactions detected lacking an organizationId.\n\n`;
  }

  // Save Report
  fs.writeFileSync(path.join(process.cwd(), 'audit_report.md'), reportContent);

  // Print JSON to stdout
  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((e) => {
    console.error('Audit Failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
