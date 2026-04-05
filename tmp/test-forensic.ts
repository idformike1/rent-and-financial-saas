import prisma from './lib/prisma';
import { getTenantForensicDossier } from './actions/tenant-forensics.actions';

async function test() {
  const t = await prisma.tenant.findFirst();
  if (!t) {
    console.log("No tenant found");
    return;
  }
  console.log("Testing with tenant:", t.id);
  const res = await getTenantForensicDossier(t.id);
  console.log("Result success:", res.success);
  if (!res.success) {
    console.log("Error:", res.message);
  } else {
    console.log("Integrity Score:", res.data.integrityScore);
    console.log("Strip Chart Items:", res.data.stripChart.length);
  }
}

test();
