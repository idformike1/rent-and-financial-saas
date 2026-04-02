'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { MaintenanceStatus } from '@prisma/client'

export async function updateTenantDetails(tenantId: string, data: { name: string, email?: string, phone?: string, nationalId?: string }) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenant = await prisma.tenant.update({
        where: { id: tenantId, organizationId: session.organizationId },
        data: { 
          name: data.name,
          email: data.email,
          phone: data.phone,
          nationalId: data.nationalId
        }
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
      await prisma.$transaction([
        // Step 1: Soft Delete Tenant
        prisma.tenant.update({
          where: { id: tenantId, organizationId: session.organizationId },
          data: { isDeleted: true }
        }),
        // Step 2: Archive all active leases
        prisma.lease.updateMany({
           where: { tenantId, isActive: true, organizationId: session.organizationId },
           data: { isActive: false, endDate: new Date() }
        })
      ]);
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
      const unit = await prisma.unit.findUnique({ where: { id: data.unitId, organizationId: session.organizationId } });
      if (!unit) return { success: false, message: "Unit not found" };
      
      // Rule #3: Block Decommissioned Units
      if (unit.maintenanceStatus === 'DECOMMISSIONED') {
        return { success: false, message: "Assignment Failure: Target Unit is currently DECOMMISSIONED by maintenance protocol." };
      }

      const moveIn = new Date(data.startDate);
      const endDate = new Date(moveIn);
      endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

      await prisma.$transaction([
        prisma.lease.create({
          data: {
            organizationId: session.organizationId,
            tenantId: data.tenantId,
            unitId: data.unitId,
            isPrimary: false, // Additional leases are secondary
            rentAmount: new Prisma.Decimal(data.rentAmount),
            depositAmount: new Prisma.Decimal(data.depositAmount),
            startDate: moveIn,
            endDate,
            isActive: true
          }
        }),
        prisma.unit.update({
          where: { id: data.unitId, organizationId: session.organizationId },
          data: { maintenanceStatus: 'OPERATIONAL' }
        })
      ]);

      revalidatePath(`/tenants/${data.tenantId}`);
      revalidatePath('/properties');
      return { success: true, message: "Additional lease protocol established." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}

export async function processMoveOut(tenantId: string, leaseId: string, unitId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      await prisma.$transaction([
        prisma.lease.update({
          where: { id: leaseId, organizationId: session.organizationId },
          data: { isActive: false, endDate: new Date() }
        }),
        prisma.unit.update({
          where: { id: unitId, organizationId: session.organizationId },
          data: { maintenanceStatus: 'OPERATIONAL' }
        }),
        prisma.charge.deleteMany({
           where: { tenantId, leaseId, isFullyPaid: false, organizationId: session.organizationId }
        })
      ]);
      
      revalidatePath(`/tenants/${tenantId}`);
      revalidatePath('/tenants');
      revalidatePath('/properties');
      return { success: true, message: "Move-out protocol executed successfully." };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
