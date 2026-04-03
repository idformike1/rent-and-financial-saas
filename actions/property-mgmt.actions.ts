'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { recordAuditLog } from '@/lib/audit-logger'

export async function createProperty(data: { name: string, address: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const property = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const p = await tx.property.create({
          data: {
            organizationId: session.organizationId,
            name: data.name,
            address: data.address
          }
        });

        await recordAuditLog({
          action: 'CREATE',
          entityType: 'PROPERTY',
          entityId: p.id,
          metadata: { name: data.name },
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });
        return p;
      });

      revalidatePath('/properties');
      return { success: true, data: property };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function deleteProperty(propertyId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Check for units first
        const unitsCount = await tx.unit.count({ where: { propertyId, organizationId: session.organizationId } });
        if (unitsCount > 0) throw new Error("ENTITY_LOCKED: Cannot delete property with active units.");

        await tx.property.delete({
          where: { id: propertyId, organizationId: session.organizationId }
        });

        await recordAuditLog({
          action: 'DELETE',
          entityType: 'PROPERTY',
          entityId: propertyId,
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });
      });

      revalidatePath('/properties');
      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
