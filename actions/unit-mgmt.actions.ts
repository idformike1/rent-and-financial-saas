'use server'

import prisma from '@/lib/prisma'
import { Prisma, MaintenanceStatus } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { recordAuditLog } from '@/lib/audit-logger'

export async function createUnit(data: { unitNumber: string, type: string, category: string, propertyId: string, marketRent?: number }) {
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
            marketRent: data.marketRent || 0,
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
      return { success: true, data: { ...unit, marketRent: Number(unit.marketRent) } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function updateUnit(unitId: string, data: { maintenanceStatus?: MaintenanceStatus, marketRent?: number, propertyId?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const unit = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const u = await tx.unit.update({
          where: { id: unitId, organizationId: session.organizationId },
          data: {
            maintenanceStatus: data.maintenanceStatus,
            marketRent: data.marketRent
          }
        });

        await recordAuditLog({
          action: 'UPDATE',
          entityType: 'UNIT',
          entityId: unitId,
          metadata: data,
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });
        return u;
      });

      if (data.propertyId) revalidatePath(`/properties/${data.propertyId}`);
      revalidatePath('/properties');
      return { success: true, data: { ...unit, marketRent: Number(unit.marketRent) } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function updateUnitStatus(unitId: string, status: MaintenanceStatus) {
  // Aliasing to updateUnit for compatibility if needed, but keeping original for now
  return updateUnit(unitId, { maintenanceStatus: status });
}
