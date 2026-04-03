import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const ledgers = await (prisma as any).financialLedger.findMany()
    console.log("LEDGERS FOUND:", ledgers.length)
  } catch (e: any) {
    console.error("ERROR FETCHING LEDGERS:", e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
