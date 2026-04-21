const { PrismaClient } = require("@prisma/client")
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
require('dotenv').config()

/**
 * SOVEREIGN SEED (ADAPTER EDITION): PERSONAL WEAPONRY
 * 
 * Using the PG Adapter to bypass constructor validation errors in Prisma 7.  
 */

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("─── SOVEREIGN SEED START (JS ADAPTER) ───")

  // 1. SYNC
  const allUsers = await prisma.user.findMany()
  console.log(`Synchronizing memberships for ${allUsers.length} users...`)
  
  for (const user of allUsers) {
    await prisma.organizationMember.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: user.organizationId } },
      update: {},
      create: {
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role
      }
    })
  }

  // 2. DISCOVERY
  const masterUser = await prisma.user.findFirst({
    where: { role: 'OWNER' }
  }) || await prisma.user.findFirst()

  if (!masterUser) throw new Error("IDENTITY_ABSENT")

  console.log(`Targeting Master Identity: ${masterUser.email}`)

  // Check if Personal Wealth already exists for this user
  const existingOrg = await prisma.organization.findFirst({
    where: { name: "Personal Wealth", members: { some: { userId: masterUser.id } } }
  })

  if (existingOrg) {
    console.log("Personal Wealth workspace already exists. Skipping injection.")
  } else {
    // 3. INJECTION
    const personalOrg = await prisma.organization.create({
      data: {
        name: "Personal Wealth",
        members: {
          create: {
            userId: masterUser.id,
            role: "OWNER"
          }
        }
      }
    })

    console.log(`Created Organization: ${personalOrg.name} [${personalOrg.id}]`)

    // 4. CHART OF ACCOUNTS
    const accounts = [
      { name: "PERSONAL_CASH", category: "ASSET" },
      { name: "SALARY_INCOME", category: "INCOME" },
      { name: "LIFESTYLE_EXPENSE", category: "EXPENSE" },
      { name: "GROCERIES_EXPENSE", category: "EXPENSE" },
    ]

    for (const acc of accounts) {
      await prisma.account.create({
        data: {
          name: acc.name,
          category: acc.category,
          organizationId: personalOrg.id,
          isSystem: true
        }
      })
    }

    console.log(`Seeded Chart of Accounts for ${personalOrg.name}.`)
  }

  console.log("─── SOVEREIGN SEED COMPLETE ───")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
