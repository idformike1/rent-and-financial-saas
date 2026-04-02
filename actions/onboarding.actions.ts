'use server'

import prisma from '@/lib/prisma'
import { runSecureServerAction } from '@/lib/auth-utils'
import { Prisma } from '@prisma/client'
import { SystemResponse } from '@/types'

export interface OnboardingPayload {
  tenantName: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  unitId: string;
  baseRent: number;
  securityDeposit: number;
  moveInDate: string; // ISO date string
}

export async function submitOnboarding(data: OnboardingPayload): Promise<SystemResponse> {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      // Step 0: Deduplication Check
      if (data.email || data.phone) {
        const existing = await prisma.tenant.findFirst({
          where: {
            OR: [
              ...(data.email ? [{ email: data.email }] : []),
              ...(data.phone ? [{ phone: data.phone }] : [])
            ],
            isDeleted: false
          }
        });

        if (existing) {
          return { 
            success: false, 
            message: `Tenant already exists (${existing.name}). Please use the 'Add Additional Lease' flow on their profile.`, 
            errorCode: "VALIDATION_ERROR" 
          };
        }
      }

      const unit = await prisma.unit.findUnique({ 
        where: { id: data.unitId },
        include: { leases: { where: { isActive: true } } }
      });
      if (!unit) return { success: false, message: "Unit not found", errorCode: "VALIDATION_ERROR" };
      
      // Protocols Rule: Single-Tenant Occupancy Enforcement
      if (unit.leases.length > 0) {
        return { 
          success: false, 
          message: "Unit is currently occupied. Protocol Rule #1: Single Registry Only.", 
          errorCode: "STATE_CONFLICT" 
        };
      }

      // Maintenance State Machine: Blocks DECOMMISSIONED units
      if (unit.maintenanceStatus === 'DECOMMISSIONED') {
        return { success: false, message: "Unit is DECOMMISSIONED. Assignment blocked by Protocol Rule #3.", errorCode: "STATE_CONFLICT" };
      }

      const moveIn = new Date(data.moveInDate);
      const year = moveIn.getUTCFullYear();
      const month = moveIn.getUTCMonth();
      
      const endOfMonth = new Date(Date.UTC(year, month + 1, 0));
      const daysInMonth = endOfMonth.getUTCDate();
      const currentDay = moveIn.getUTCDate();
      const remainingDays = daysInMonth - currentDay + 1;
      
      const proratedRentRaw = (data.baseRent / daysInMonth) * remainingDays;
      const proratedRent = new Prisma.Decimal(proratedRentRaw.toFixed(2));
      const secDep = new Prisma.Decimal(data.securityDeposit);

      const result = await prisma.$transaction(async (txOps: Prisma.TransactionClient) => {
        // Step 1: Create Tenant with Enterprise fields
        const tenant = await txOps.tenant.create({
          data: { 
            name: data.tenantName,
            email: data.email,
            phone: data.phone,
            nationalId: data.nationalId,
            isDeleted: false
          }
        });

        // Step 2: Create Lease
        const endDate = new Date(moveIn);
        endDate.setUTCFullYear(endDate.getUTCFullYear() + 1);

        const lease = await txOps.lease.create({
          data: {
            tenantId: tenant.id,
            unitId: data.unitId,
            isPrimary: true,
            rentAmount: new Prisma.Decimal(data.baseRent),
            depositAmount: secDep,
            startDate: moveIn,
            endDate,
            isActive: true
          }
        });

        // Step 3: Financial Initialization
        await txOps.charge.create({
          data: {
            tenantId: tenant.id,
            leaseId: lease.id,
            type: 'RENT', 
            amount: secDep,
            amountPaid: new Prisma.Decimal(0),
            dueDate: moveIn,
            isFullyPaid: false,
          }
        });

        await txOps.charge.create({
          data: {
            tenantId: tenant.id,
            leaseId: lease.id,
            type: 'RENT', 
            amount: proratedRent,
            amountPaid: new Prisma.Decimal(0),
            dueDate: moveIn,
            isFullyPaid: false,
          }
        });

        await txOps.unit.update({
          where: { id: unit.id },
          data: { maintenanceStatus: 'OPERATIONAL' }
        });

        return { tenantId: tenant.id, leaseId: lease.id };
      });

      return { 
        success: true, 
        message: "Enterprise Onboarding successfully materialized.", 
        data: result 
      };

    } catch (e: any) {
      return { success: false, message: e.message || "Onboarding failed", errorCode: "STATE_CONFLICT" };
    }
  });
}
