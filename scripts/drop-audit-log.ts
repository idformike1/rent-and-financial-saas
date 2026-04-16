import { prisma } from '../lib/prisma'

async function main() {
  // Drop the old table with stale column names
  await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "AuditLog" CASCADE;`)
  console.log('✅ AuditLog table dropped. Run npx prisma db push to recreate with correct schema.')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
