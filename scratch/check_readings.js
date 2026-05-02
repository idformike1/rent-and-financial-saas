
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
    pool.end();
  }
}

checkMeterReadings();
