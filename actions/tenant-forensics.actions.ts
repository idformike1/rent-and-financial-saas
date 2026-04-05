'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'

export async function getTenantForensicDossier(tenantId: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    try {
      const tenant = await prisma.tenant.findFirst({
        where: { id: tenantId, organizationId: session.organizationId },
        include: {
          leases: { 
            include: { unit: true }, 
            orderBy: { startDate: 'desc' } 
          },
          charges: { 
            orderBy: { dueDate: 'desc' } 
          }
        }
      });

      if (!tenant) throw new Error("TENANT_RECORD_ABSENT");

      const ledgerEntries = await prisma.ledgerEntry.findMany({
        where: { 
          tenantId: tenantId,
          organizationId: session.organizationId,
          account: { category: 'INCOME' },
          amount: { lt: 0 }
        },
        orderBy: { transactionDate: 'desc' }
      });

      // DATA SANITIZATION (PRISMA DECIMAL -> NUMBER)
      const sanitizedCharges = tenant.charges.map(c => ({
        id: c.id,
        tenantId: c.tenantId,
        leaseId: c.leaseId,
        type: c.type,
        amount: Number(c.amount),
        amountPaid: Number(c.amountPaid),
        dueDate: c.dueDate,
        isFullyPaid: c.isFullyPaid
      }));

      const sanitizedLedger = ledgerEntries.map(e => ({
        id: e.id,
        amount: Math.abs(Number(e.amount)),
        transactionDate: e.transactionDate,
        description: e.description,
        paymentMode: e.paymentMode,
        referenceText: e.referenceText
      }));

      const sanitizedLeases = tenant.leases.map(l => ({
        id: l.id,
        rentAmount: Number(l.rentAmount),
        depositAmount: Number(l.depositAmount),
        startDate: l.startDate,
        endDate: l.endDate,
        isActive: l.isActive,
        isPrimary: l.isPrimary,
        unit: {
          id: l.unit.id,
          unitNumber: l.unit.unitNumber,
          type: l.unit.type,
          marketRent: Number(l.unit.marketRent)
        }
      }));

      // INTEGRITY SCORE CALCULATION
      // Algorithm: Check all fully paid RENT charges. Calculate avg delay.
      const paidRentCharges = sanitizedCharges.filter(c => c.type === 'RENT' && c.isFullyPaid);
      let totalDelayDays = 0;
      
      paidRentCharges.forEach(charge => {
        // Find the latest payment entry for this charge window
        // Note: Direct linking would be better, but we'll use date proximity
        const payment = sanitizedLedger.find(p => 
          p.transactionDate >= charge.dueDate && 
          p.transactionDate <= new Date(charge.dueDate.getTime() + 30 * 24 * 60 * 60 * 1000)
        ) || sanitizedLedger.find(p => Math.abs(p.transactionDate.getTime() - charge.dueDate.getTime()) < 5 * 24 * 60 * 60 * 1000);
        
        if (payment) {
          const delay = Math.max(0, (payment.transactionDate.getTime() - charge.dueDate.getTime()) / (1000 * 3600 * 24));
          totalDelayDays += delay;
        } else {
           // If paid but no direct entry match found in the buffer, assume 0 for legacy or a default penalty if overdue
           const now = new Date();
           if (charge.dueDate < now) totalDelayDays += 2; // Slight penalty for untraceable legacy payments
        }
      });

      const avgDelay = paidRentCharges.length > 0 ? totalDelayDays / paidRentCharges.length : 0;
      const integrityScore = Math.max(0, Math.min(100, 100 - (avgDelay * 3))); // 1 day late = -3 points

      // STRIP-CHART GENERATION (LAST 12 MONTHS)
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        
        const monthCharge = sanitizedCharges.find(c => 
          c.type === 'RENT' && 
          c.dueDate >= monthStart && 
          c.dueDate <= monthEnd
        );

        let status: 'GREEN' | 'YELLOW' | 'RED' | 'EMPTY' = 'EMPTY';
        if (monthCharge) {
          if (!monthCharge.isFullyPaid) {
            status = 'RED';
          } else {
            const payment = sanitizedLedger.find(p => p.transactionDate >= monthStart && p.transactionDate <= monthEnd);
            const gracePeriod = new Date(monthStart);
            gracePeriod.setDate(5); // 5th of month grace period
            
            if (payment && payment.transactionDate <= gracePeriod) {
              status = 'GREEN';
            } else {
              status = 'YELLOW';
            }
          }
        }
        
        months.push({ 
          label: d.toLocaleString('default', { month: 'short' }), 
          status 
        });
      }

      return { 
        success: true, 
        data: JSON.parse(JSON.stringify({
          tenant: {
            id: tenant.id,
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            nationalId: tenant.nationalId,
            isDeleted: tenant.isDeleted,
            leases: sanitizedLeases,
            charges: sanitizedCharges,
            ledgerEntries: sanitizedLedger
          },
          integrityScore: Math.round(integrityScore),
          stripChart: months
        }))
      };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  });
}
