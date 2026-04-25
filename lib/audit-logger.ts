import { prisma } from './prisma'
import { auth } from '@/auth'

interface AuditLogParams {
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'NUCLEAR_PURGE' | 'INVITE' | 'ACTIVATE' | 'DEACTIVATE' | 'ROLE_CHANGE' | 'MOVE_OUT' | 'PAYMENT' | 'GRANT_EDIT' | 'REVOKE_EDIT';
  entityType: 'INVITATION' | 'USER' | 'EXPENSE' | 'REVENUE' | 'PROPERTY' | 'TENANT' | 'UNIT' | 'LEASE' | 'CHARGE' | 'ACCOUNT' | 'LEDGER_ENTRY' | 'LEDGER' | 'CATEGORY' | 'ORGANIZATION';
  entityId: string;
  metadata?: any;
  tx?: any; 
  userId?: string;
  organizationId?: string;
}

export async function recordAuditLog({ action, entityType, entityId, metadata, tx, userId, organizationId }: AuditLogParams) {
  const client = tx || prisma;
  let finalUserId = userId;
  let finalOrgId = organizationId;

  if (!finalUserId || !finalOrgId) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.organizationId) {
      throw new Error("UNAUTHORIZED_AUDIT_ATTEMPT");
    }
    finalUserId = session.user.id;
    finalOrgId = session.user.organizationId;
  }

  // CRITICAL: Verify that the user still exists in the DB to prevent P2003 (FK Violation)
  const userExists = await prisma.user.count({ where: { id: finalUserId } });
  
  if (userExists === 0) {
    // If user is missing from DB (likely due to a seed wipe), we skip the user linkage
    // or we could throw. In this workstation standard, we preserve the action.
    console.warn(`[AUDIT_LOG_RECOVER] User ${finalUserId} missing from DB. Recording as System event.`);
    return await client.auditLog.create({
      data: {
        action,
        entityType,
        entityId,
        metadata: metadata ? { ...metadata, orphanedUserId: finalUserId } : { orphanedUserId: finalUserId },
        userId: undefined, // Break FK link
        organizationId: finalOrgId
      }
    });
  }

  return await client.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      metadata: metadata ? metadata : undefined,
      user: { connect: { id: finalUserId } },
      organization: finalOrgId ? { connect: { id: finalOrgId } } : undefined
    }
  });
}
