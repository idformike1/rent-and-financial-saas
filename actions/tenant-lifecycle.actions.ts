'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { recordAuditLog } from '@/lib/audit-logger'

export async function updateTenantDetails(tenantId: string, data: { name: string, email?: string, phone?: string, nationalId?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenant = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const t = await tx.tenant.update({
          where: { id: tenantId, organizationId: session.organizationId },
          data: { 
            name: data.name,
            email: data.email,
            phone: data.phone,
            nationalId: data.nationalId
          }
        });

        await recordAuditLog({
          action: 'UPDATE',
          entityType: 'TENANT',
          entityId: tenantId,
          metadata: { name: data.name, email: data.email },
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });
        return t;
      });

      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      return { success: true, data: tenant };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

/**
 * Enterprise Protocol: Soft Delete Tenant
 * Rule #4: Data is immutable history. No restoration permitted.
 */
export async function softDeleteTenant(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Step 1: Soft Delete Tenant
        await tx.tenant.update({
          where: { id: tenantId, organizationId: session.organizationId },
          data: { isDeleted: true }
        });

        // Step 2: Archive all active leases
        await tx.lease.updateMany({
           where: { tenantId, isActive: true, organizationId: session.organizationId },
           data: { isActive: false, endDate: new Date() }
        });

        await recordAuditLog({
           action: 'DELETE',
           entityType: 'TENANT',
           entityId: tenantId,
           metadata: { archiveDate: new Date() },
           tx,
           userId: session.userId,
           organizationId: session.organizationId
        });
      });
      revalidatePath('/tenants');
      return { success: true, message: "Tenant soft-deleted and leases archived." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

/**
 * Add Additional Lease (Multi-Unit Tenancy)
 */
export async function addAdditionalLease(data: { 
  tenantId: string, 
  unitId: string, 
  rentAmount: number, 
  depositAmount: number,
  startDate: string 
}) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const unit = await tx.unit.findUnique({ where: { id: data.unitId, organizationId: session.organizationId } });
        if (!unit) throw new Error("Unit not found");
        
        if (unit.maintenanceStatus === 'DECOMMISSIONED') {
          throw new Error("Assignment Failure: Target Unit is currently DECOMMISSIONED.");
        }

        const moveIn = new Date(data.startDate);
        const endDate = new Date(moveIn);
        endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

        const lease = await tx.lease.create({
          data: {
            organizationId: session.organizationId,
            tenantId: data.tenantId,
            unitId: data.unitId,
            isPrimary: false,
            rentAmount: new Prisma.Decimal(data.rentAmount),
            depositAmount: new Prisma.Decimal(data.depositAmount),
            startDate: moveIn,
            endDate,
            isActive: true
          }
        });

        await tx.unit.update({
          where: { id: data.unitId, organizationId: session.organizationId },
          data: { maintenanceStatus: 'OPERATIONAL' }
        });

        await recordAuditLog({
          action: 'CREATE',
          entityType: 'LEASE',
          entityId: lease.id,
          metadata: { tenantId: data.tenantId, unitId: data.unitId },
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });

        return lease;
      });

      revalidatePath(`/tenants/${data.tenantId}`);
      revalidatePath('/properties');
      return { success: true, message: "Additional lease protocol established.", data: result };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function processMoveOut(tenantId: string, leaseId: string, unitId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.lease.update({
          where: { id: leaseId, organizationId: session.organizationId },
          data: { isActive: false, endDate: new Date() }
        });

        await tx.unit.update({
          where: { id: unitId, organizationId: session.organizationId },
          data: { maintenanceStatus: 'OPERATIONAL' }
        });

        await tx.charge.deleteMany({
           where: { tenantId, leaseId, isFullyPaid: false, organizationId: session.organizationId }
        });

        await recordAuditLog({
          action: 'MOVE_OUT',
          entityType: 'TENANT',
          entityId: tenantId,
          metadata: { unitId, leaseId },
          tx,
          userId: session.userId,
          organizationId: session.organizationId
        });
      });
      
      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      revalidatePath('/properties');
      return { success: true, message: "Move-out protocol executed successfully." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
