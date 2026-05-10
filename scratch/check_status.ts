import { assetService } from './src/services/asset.service';
import { prisma } from './src/lib/prisma';

async function checkStatus() {
  const orgId = '...'; // I don't know the org ID
  // Let's just find the first property
  const property = await prisma.property.findFirst({
    include: { units: true }
  });
  console.log('Property Status:', property?.status);
  console.log('Units:', property?.units.map(u => ({ id: u.id, status: u.maintenanceStatus })));
}

checkStatus();
