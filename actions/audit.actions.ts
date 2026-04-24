'use server'

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * PANOPTICON DATA PIPELINE
 * Fetches system-wide audit logs for root administrative oversight.
 */
export async function getGlobalAuditLogs(limit = 50, query?: string) {
  const session = await auth();
  
  // Security Gate: Root clearance required
  if (!(session?.user as any)?.isSystemAdmin) {
    throw new Error("ERR_AUTHORITY_ABSENT: Global audit telemetry requires ROOT_ADMIN clearance.");
  }

  try {
    const where: any = {};
    if (query) {
      where.OR = [
        { action: { contains: query, mode: 'insensitive' } },
        { targetName: { contains: query, mode: 'insensitive' } },
        { entityId: { contains: query, mode: 'insensitive' } },
        { user: { email: { contains: query, mode: 'insensitive' } } },
        { user: { name: { contains: query, mode: 'insensitive' } } },
        { organization: { name: { contains: query, mode: 'insensitive' } } },
      ];
    }

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        },
        organization: {
          select: {
            name: true
          }
        }
      }
    });

    return { success: true, data: logs };
  } catch (error: any) {
    console.error('[AUDIT_LEDGER_FETCH_FATAL]', error);
    return { success: false, error: "ERR_TELEMETRY_FAILURE" };
  }
}
