
import { prisma } from '../src/lib/prisma';

async function checkMeterReadings() {
  try {
    const tenant = await prisma.tenant.findFirst({
      where: { name: { contains: 'Aris Thorne' } },
      include: { leases: { include: { unit: true } } }
    });

    if (!tenant || !tenant.leases[0]) {
      console.log("Tenant not found");
      return;
    }

    const unitId = tenant.leases[0].unit.id;
    console.log(`Checking readings for Unit ID: ${unitId} (${tenant.leases[0].unit.unitNumber})`);

    const readings = await prisma.meterReading.findMany({
      where: { unitId },
      orderBy: { date: 'desc' }
    });

    console.log("Current Meter Readings:");
    readings.forEach(r => {
      console.log(`- Type: ${r.type}, Value: ${r.value}, Date: ${r.date.toISOString()}, ID: ${r.id}`);
    });
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

checkMeterReadings();
