// scratch/migrate_memberships.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('--- INITIATING IDENTITY MIGRATION ---');
    console.log('Context: Single-Tenant -> Multi-Tenant Bridge');

    try {
        // 1. Fetch all users with an active organization assignment
        const users = await prisma.user.findMany({
            where: {
                organizationId: { not: null },
                deletedAt: null
            }
        });

        console.log(`Found ${users.length} identity/silo mappings to migrate.`);

        let migratedCount = 0;

        // 2. Cascade data into the junction table
        for (const user of users) {
            if (!user.organizationId) continue;

            await prisma.organizationMember.upsert({
                where: {
                    userId_organizationId: {
                        userId: user.id,
                        organizationId: user.organizationId
                    }
                },
                update: {
                    role: user.role,
                    status: user.accountStatus
                },
                create: {
                    userId: user.id,
                    organizationId: user.organizationId,
                    role: user.role,
                    status: user.accountStatus
                }
            });

            migratedCount++;
            if (migratedCount % 10 === 0) {
                console.log(`Progress: ${migratedCount}/${users.length} mappings synchronized.`);
            }
        }

        console.log('\n✅ MIGRATION SUCCESSFUL');
        console.log(`Total Records Synchronized: ${migratedCount}`);
        console.log('Current State: Multi-Tenant bridge is now populated with legacy context.');

    } catch (error) {
        console.error('❌ MIGRATION FAILED:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrate();
