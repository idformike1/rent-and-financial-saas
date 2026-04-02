'use server'

import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { runSecureServerAction } from '@/lib/auth-utils'

export async function waiveCharge(chargeId: string, reasonText: string) {
  return runSecureServerAction('MANAGER', async (session) => {
    if (!reasonText || reasonText.length < 10) {
      return { success: false, message: "Waive off reason must be at least 10 characters long." }
    }

    const charge = await prisma.charge.findUnique({ where: { id: chargeId } })
    if (!charge) return { success: false, message: "Charge not found." }

    const balance = charge.amount.minus(charge.amountPaid);
    if (balance.lte(0)) return { success: false, message: "Charge is already fully paid." }

    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Waive the remaining balance by marking it as paid (system credit essentially)
        await tx.charge.update({
          where: { id: chargeId },
          data: {
            amountPaid: charge.amount, // Set amountPaid = amount
            isFullyPaid: true
          }
        });

        // 2. Create Audit Trail
        await tx.auditLog.create({
          data: {
            actionType: 'WAIVE_OFF',
            targetId: chargeId,
            amountContext: balance,
            managerId: session.userId || 'manager-override-id',
            reasonText: reasonText
          }
        });
      });

      return { success: true, message: "Charge waived successfully. Audit log created." }
    } catch (e: any) {
      return { success: false, message: e.message || "Failed to waive charge." }
    }
  });
}
