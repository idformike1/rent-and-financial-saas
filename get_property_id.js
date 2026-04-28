const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const property = await prisma.property.findFirst();
  if (property) {
    console.log(property.id);
  } else {
    console.log('NO_PROPERTY');
  }
  await prisma.$disconnect();
}

main();
