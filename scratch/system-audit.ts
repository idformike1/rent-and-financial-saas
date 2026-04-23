import { prisma } from '../lib/prisma.ts';

async function audit() {
  try {
    const totalUsers = await prisma.user.count();
    
    const roleDistribution = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    });

    const nullOrgUsers = await prisma.user.count({
      where: {
        organizationId: null
      }
    });

    const accountStatusDistribution = await prisma.user.groupBy({
      by: ['accountStatus'],
      _count: {
        accountStatus: true
      }
    });

    console.log('--- DATA AUDIT RESULTS ---');
    console.log('Total Users:', totalUsers);
    console.log('Role Distribution:', JSON.stringify(roleDistribution, null, 2));
    console.log('Users with null organizationId:', nullOrgUsers);
    console.log('Account Status Distribution:', JSON.stringify(accountStatusDistribution, null, 2));

  } catch (error: any) {
    console.error('Audit failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

audit();
