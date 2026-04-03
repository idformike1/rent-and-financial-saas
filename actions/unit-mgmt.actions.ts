'use server'

import prisma from '@/lib/prisma'
import { Prisma, MaintenanceStatus } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { recordAuditLog } from '@/lib/audit-logger'

export async function createUnit(data: { unitNumber: string, type: string, category: string, propertyId: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const unit = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const u = await tx.unit.create({
          data: {
            organizationId: session.organizationId,
            unitNumber: data.unitNumber,
            type: data.type,
            category: data.category,
            propertyId: data.propertyId,
            maintenanceStatus: 'OPERATIONAL'
          }
        });

        await recordAuditLog({
          action: 'CREATE',
          entityType: 'UNIT',
          entityId: u.id,
          metadata: { unitNumber: data.unitNumber, propertyId: data.propertyId },
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });
        return u;
      });

      revalidatePath(`/properties/${data.propertyId}`);
      return { success: true, data: unit };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function updateUnitStatus(unitId: string, status: MaintenanceStatus) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const unit = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        if (status === 'DECOMMISSIONED') {
          const activeLeases = await tx.lease.count({
            where: { unitId, isActive: true, organizationId: session.organizationId }
          });
          if (activeLeases > 0) {
            throw new Error(`Protocol Breach: Unit cannot be DECOMMISSIONED while ${activeLeases} active lease(s) exist.`);
          }
        }

        const u = await tx.unit.update({
          where: { id: unitId, organizationId: session.organizationId },
          data: { maintenanceStatus: status }
        });

        await recordAuditLog({
          action: 'UPDATE',
          entityType: 'UNIT',
          entityId: unitId,
          metadata: { maintenanceStatus: status },
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });
        return u;
      });

      revalidatePath('/properties');
      return { success: true, data: unit };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
